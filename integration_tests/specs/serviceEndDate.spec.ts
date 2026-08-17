import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import communitySupport from '../mockApis/communitySupport'
import { getMatchingRequests } from '../mockApis/wiremock'
import { login, resetStubs, seedSessionRiskSummary } from '../testUtils'
import TaskListPage from '../pages/TaskListPage'

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d
}

const yesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d
}

test.describe('Service End Date Page', () => {
  const referralId = randomUUID()

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      checkRiskInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfAnyAdditionalSupportNeedsCompleted: {
        completed: false,
        statusText: 'Incomplete',
        tag: 'govuk-tag--blue',
      },
      addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addAdditionalInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      selectAnAreaForReferralCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    })
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, referralId)
  })

  test('AC1 and AC2: should navigate from task list and return using back link', async ({ page }) => {
    await page.goto('/referral/task-list')
    const taskListPage = await TaskListPage.verifyOnPage(page)

    await taskListPage.clickAdditionalReferralInformationTask()
    await expect(page).toHaveURL('/referral/task-list/service-end-date')

    await page.getByRole('link', { name: 'Back', exact: true }).click()
    await expect(page).toHaveURL('/referral/task-list')
  })

  test('AC3 AC4 AC5 and AC6: should render heading hint date inputs and reason field', async ({ page }) => {
    await page.goto('/referral/task-list/service-end-date')

    await expect(
      page.getByRole('heading', { name: 'What date does the service need to be completed by?' }),
    ).toBeVisible()
    await expect(page.getByText('This is the date by which the service should be completed.')).toBeVisible()
    await expect(page.getByLabel('Day')).toBeVisible()
    await expect(page.getByLabel('Month')).toBeVisible()
    await expect(page.getByLabel('Year')).toBeVisible()
    await expect(page.getByLabel('Why does it need to be completed by this date?')).toBeVisible()
  })

  test('AC5.1: should show invalid date error for impossible date', async ({ page }) => {
    await page.goto('/referral/task-list/service-end-date')

    await page.getByLabel('Day').fill('31')
    await page.getByLabel('Month').fill('2')
    await page.getByLabel('Year').fill('2027')
    await page.getByLabel('Why does it need to be completed by this date?').fill('Target date agreed with provider')
    await page.getByRole('button', { name: 'Save and continue' }).click()

    await expect(page.locator('[data-testid="error-messages"]')).toContainText('Enter a real date')
  })

  test('AC5.2: should show error when date is before today', async ({ page }) => {
    await page.goto('/referral/task-list/service-end-date')

    const date = yesterday()
    await page.getByLabel('Day').fill(String(date.getDate()))
    await page.getByLabel('Month').fill(String(date.getMonth() + 1))
    await page.getByLabel('Year').fill(String(date.getFullYear()))
    await page.getByLabel('Why does it need to be completed by this date?').fill('Target date agreed with provider')
    await page.getByRole('button', { name: 'Save and continue' }).click()

    await expect(page.locator('[data-testid="error-messages"]')).toContainText(
      'The date the service needs to be completed by must be today or later',
    )
  })

  test('AC5.3: should show error when date is blank', async ({ page }) => {
    await page.goto('/referral/task-list/service-end-date')

    await page.getByLabel('Why does it need to be completed by this date?').fill('Target date agreed with provider')
    await page.getByRole('button', { name: 'Save and continue' }).click()

    await expect(page.locator('[data-testid="error-messages"]')).toContainText(
      'Enter the date the service needs to be completed by',
    )
  })

  test('AC7: should show error when reason is blank', async ({ page }) => {
    await page.goto('/referral/task-list/service-end-date')

    const date = tomorrow()
    await page.getByLabel('Day').fill(String(date.getDate()))
    await page.getByLabel('Month').fill(String(date.getMonth() + 1))
    await page.getByLabel('Year').fill(String(date.getFullYear()))
    await page.getByRole('button', { name: 'Save and continue' }).click()

    await expect(page.locator('[data-testid="error-messages"]')).toContainText(
      'Enter why it needs to be completed by this date',
    )
  })

  test('AC8: should save valid data and return to task list', async ({ page }) => {
    await communitySupport.stubUpdateServiceEndDatePage(referralId, {
      target_service_completion_date: '2027-01-01T00:00:00.000Z',
      target_service_completion_reason: 'Target date agreed with provider',
    })

    await page.goto('/referral/task-list/service-end-date')

    const date = tomorrow()
    await page.getByLabel('Day').fill(String(date.getDate()))
    await page.getByLabel('Month').fill(String(date.getMonth() + 1))
    await page.getByLabel('Year').fill(String(date.getFullYear()))
    await page.getByLabel('Why does it need to be completed by this date?').fill('Target date agreed with provider')
    await page.getByRole('button', { name: 'Save and continue' }).click()

    await expect(page).toHaveURL('/referral/task-list')

    const matchingRequests = await getMatchingRequests({
      method: 'PATCH',
      urlPathPattern: `/community-support/referral/${referralId}/service-end-date`,
    })

    const [savedRequest] = matchingRequests.body.requests
    expect(JSON.parse(savedRequest.body)).toMatchObject({
      target_service_completion_reason: 'Target date agreed with provider',
    })
  })

  test('should repopulate saved target completion date and reason when revisiting the page', async ({ page }) => {
    await communitySupport.stubGetServiceEndDatePage(referralId, {
      target_service_completion_date: '2027-03-31T00:00:00.000Z',
      target_service_completion_reason: 'Existing saved reason',
    })

    await page.goto('/referral/task-list/service-end-date')

    await expect(page.getByLabel('Day')).toHaveValue('31')
    await expect(page.getByLabel('Month')).toHaveValue('3')
    await expect(page.getByLabel('Year')).toHaveValue('2027')
    await expect(page.getByLabel('Why does it need to be completed by this date?')).toHaveValue('Existing saved reason')
  })
})

import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { addMonths, subDays } from 'date-fns'
import communitySupport from '../mockApis/communitySupport'
import { getMatchingRequests } from '../mockApis/wiremock'
import { login, resetStubs, seedSessionRiskSummary } from '../testUtils'
import TaskListPage from '../pages/TaskListPage'
import ServiceEndDatePage from '../pages/ServiceEndDatePage'

const DEFAULT_REASON = 'Target date agreed with provider'

const yesterday = () => subDays(new Date(), 1)

const sixMonthsFromToday = () => addMonths(new Date(), 6)

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
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)
    await expect(page).toHaveURL(ServiceEndDatePage.url())

    await serviceEndDatePage.clickBackLink()
    await expect(page).toHaveURL('/referral/task-list')
  })

  test('AC3 AC4 AC5 and AC6: should render heading hint date inputs and reason field', async ({ page }) => {
    await page.goto(ServiceEndDatePage.url())
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)

    await expect(serviceEndDatePage.header).toBeVisible()
    await expect(page.getByText('This is the date by which the service should be completed.')).toBeVisible()
    await expect(serviceEndDatePage.dayInput).toBeVisible()
    await expect(serviceEndDatePage.monthInput).toBeVisible()
    await expect(serviceEndDatePage.yearInput).toBeVisible()
    await expect(serviceEndDatePage.reasonInput).toBeVisible()
  })

  test('AC5.1: should show invalid date error for impossible date', async ({ page }) => {
    await page.goto(ServiceEndDatePage.url())
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)

    const date = sixMonthsFromToday()
    await serviceEndDatePage.dayInput.fill('31')
    await serviceEndDatePage.monthInput.fill('2')
    await serviceEndDatePage.yearInput.fill(String(date.getFullYear()))
    await serviceEndDatePage.reasonInput.fill(DEFAULT_REASON)
    await serviceEndDatePage.clickSaveAndContinue()

    await expect(page).toHaveURL(ServiceEndDatePage.url())
    await expect(serviceEndDatePage.errorMessages).toContainText('Enter a date in the correct format')
  })

  test('AC5.2: should show error when date is before today', async ({ page }) => {
    await page.goto(ServiceEndDatePage.url())
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)

    await serviceEndDatePage.fillTargetCompletionDate(yesterday())
    await serviceEndDatePage.reasonInput.fill(DEFAULT_REASON)
    await serviceEndDatePage.clickSaveAndContinue()

    await expect(page).toHaveURL(ServiceEndDatePage.url())
    await expect(serviceEndDatePage.errorMessages).toContainText(
      'The date the service needs to be completed by must be in the future',
    )
  })

  test('AC5.3: should show error when date is blank', async ({ page }) => {
    await page.goto(ServiceEndDatePage.url())
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)

    await serviceEndDatePage.reasonInput.fill(DEFAULT_REASON)
    await serviceEndDatePage.clickSaveAndContinue()

    await expect(page).toHaveURL(ServiceEndDatePage.url())
    await expect(serviceEndDatePage.errorMessages).toContainText('Enter the date the service needs to be completed by')
  })

  test('AC7: should show error when reason is blank', async ({ page }) => {
    await page.goto(ServiceEndDatePage.url())
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)

    await serviceEndDatePage.fillTargetCompletionDateSixMonthsFromToday()
    await serviceEndDatePage.clickSaveAndContinue()

    await expect(page).toHaveURL(ServiceEndDatePage.url())
    await expect(serviceEndDatePage.errorMessages).toContainText('Enter why it needs to be completed by this date')
  })

  test('AC8: should save valid data and got service days page', async ({ page }) => {
    const validSubmissionReason = 'Unique valid submission reason for AC8'
    const validDate = sixMonthsFromToday()

    await communitySupport.stubUpdateServiceEndDatePage(referralId, {
      target_service_completion_date: validDate.toISOString(),
      target_service_completion_reason: validSubmissionReason,
    })
    await communitySupport.stubGetServiceDaysPage(referralId, {})

    await page.goto(ServiceEndDatePage.url())
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)

    await serviceEndDatePage.fillTargetCompletionDateSixMonthsFromToday()
    await serviceEndDatePage.reasonInput.fill(validSubmissionReason)
    await serviceEndDatePage.clickSaveAndContinue()

    await expect(page).toHaveURL('/referral/task-list/service-days')

    const matchingRequests = await getMatchingRequests({
      method: 'PATCH',
      urlPathPattern: `/community-support/referral/${referralId}/service-end-date`,
    })

    const [savedRequest] = matchingRequests.body.requests
    expect(JSON.parse(savedRequest.body)).toMatchObject({
      target_service_completion_reason: validSubmissionReason,
    })
  })

  test('should repopulate saved target completion date and reason when revisiting the page', async ({ page }) => {
    const savedDate = sixMonthsFromToday()

    await communitySupport.stubGetServiceEndDatePage(referralId, {
      target_service_completion_date: savedDate.toISOString(),
      target_service_completion_reason: 'Existing saved reason',
    })

    await page.goto(ServiceEndDatePage.url())
    const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)

    await expect(serviceEndDatePage.dayInput).toHaveValue(String(savedDate.getDate()))
    await expect(serviceEndDatePage.monthInput).toHaveValue(String(savedDate.getMonth() + 1))
    await expect(serviceEndDatePage.yearInput).toHaveValue(String(savedDate.getFullYear()))
    await expect(serviceEndDatePage.reasonInput).toHaveValue('Existing saved reason')
  })
})

import { test, expect, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import TaskListPage from '../pages/TaskListPage'
import HomePage from '../pages/homePage'
import FindPersonPage from '../pages/findPersonPage'

/**
 * End-to-end journey regression tests for the Task List Additional Support Needs ACs.
 * Each test navigates the full UI journey: login → home → find person → confirm → select service → task list.
 */
test.describe('Task List E2E Journey Regression', () => {
  const referralId = randomUUID()
  const crn = 'X320741'

  const incompleteStatus = { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' }
  const completedStatus = { completed: true, statusText: 'Completed', tag: undefined }

  const defaultTaskListStatus = {
    fullName: 'Alex Rivers',
    confirmPersonalDetailsCompleted: incompleteStatus,
    checkRiskInformationCompleted: incompleteStatus,
    selectThePersonsNeedsCompleted: incompleteStatus,
    addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
    addDetailsOfMainPointOfContactCompleted: incompleteStatus,
  }

  const supportNeedsStubData = {
    refereeName: { firstName: 'Alex', lastName: 'Rivers' },
    physicalHealth: { selected: false, value: null },
    mentalEmotionalHealth: { selected: false, value: null },
    neurodiversity: { selected: false, value: null },
    locationTravel: { selected: false, value: null },
    caringResponsibilities: { selected: false, value: null },
    employmentResponsibilities: { selected: false, value: null },
    diversity: { selected: false, value: null },
    anythingElse: { selected: false, value: null },
    needsAdditionalSupport: null,
  }

  async function navigateToTaskList(page: Page) {
    await communitySupport.stubGetPerson()
    await communitySupport.stubGetCommunitySupportServicesTwoOptions()
    await communitySupport.stubCreateReferral({
      referralId,
      personId: '',
      referralDate: '',
      personIdentifier: '',
      communityServiceProviderId: '',
      communityServiceProviderName: '',
      region: '',
      deliveryPartner: '',
    })

    await page.goto(HomePage.url())
    await login(page)

    await test.step('make a referral', async () => {
      const homePom = await HomePage.verifyOnPage(page)
      await homePom.clickMakeAReferralTile()
    })
    await test.step('find a person', async () => {
      const findPom = await FindPersonPage.verifyOnPage(page)
      await findPom.enterIdentifyierAndContinue(crn)
    })
    await test.step('confirm person', async () => {
      await expect(page.getByRole('heading', { name: 'Confirm this is the correct' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    await test.step('select service', async () => {
      await expect(page.getByRole('heading', { name: 'Select the Community Support' })).toBeVisible()
      await page.getByRole('radio', { name: 'First Accommodation support' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetTaskListStatus(referralId, defaultTaskListStatus)
    await navigateToTaskList(page)
  })

  // AC1 - Navigate to main task list
  test('AC1: should land on main task list after selecting a service', async ({ page }) => {
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await expect(taskListPom.header).toBeVisible()
    await expect(taskListPom.subHeader).toBeVisible()
  })

  // AC2 - Back navigation
  test('AC2: should navigate back to service selection when Back is clicked', async ({ page }) => {
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.clickBackLink()
    await expect(page.getByRole('heading', { name: 'Select the Community Support' })).toBeVisible()
  })

  // AC3 - Display Additional Support Needs task
  // AC4 - Display Incomplete status for Additional Support Needs
  test('AC3 + AC4: should display Add details of any additional support needs task with Incomplete status', async ({
    page,
  }) => {
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await expect(taskListPom.addSupportNeedsTask).toBeVisible()
    await taskListPom.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
  })

  // AC5 - Navigate to Additional support needs
  test('AC5: should navigate to additional support needs screen when task link is clicked', async ({ page }) => {
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, supportNeedsStubData)
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.clickAddSupportNeedsTask()
    await expect(page).toHaveURL(/additional-support-needs/)
    await expect(
      page.getByRole('heading', {
        name: 'What does Alex need support with to attend or take part in sessions?',
      }),
    ).toBeVisible()
  })

  // AC8 - Persist completed status (return to referral with Completed status)
  test('AC8: should display Completed status for additional support needs task when returning to task list', async ({
    page,
  }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      ...defaultTaskListStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: completedStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
  })

  // AC9 - Persist incomplete status (return to referral with Incomplete status)
  test('AC9: should display Incomplete status for additional support needs task when returning to task list without completing it', async ({
    page,
  }) => {
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
  })

  // AC10 - Maintain Completed status when revisiting
  test('AC10: should maintain Completed status after navigating to additional support needs and returning to task list', async ({
    page,
  }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      ...defaultTaskListStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: completedStatus,
    })
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, supportNeedsStubData)

    await page.goto(TaskListPage.url())
    const taskListPom = await TaskListPage.verifyOnPage(page)

    await test.step('verify Completed status before navigating', async () => {
      await taskListPom.verifyTaskStatus(
        'Referral information',
        'Add details of any additional support needs',
        'Completed',
      )
    })
    await test.step('navigate to additional support needs page', async () => {
      await taskListPom.clickAddSupportNeedsTask()
      await expect(page).toHaveURL(/additional-support-needs/)
      await expect(
        page.getByRole('heading', {
          name: 'What does Alex need support with to attend or take part in sessions?',
        }),
      ).toBeVisible()
    })
    await test.step('return to task list and verify status remains Completed', async () => {
      await page.goto(TaskListPage.url())
      await TaskListPage.verifyOnPage(page)
      await taskListPom.verifyTaskStatus(
        'Referral information',
        'Add details of any additional support needs',
        'Completed',
      )
    })
  })
})

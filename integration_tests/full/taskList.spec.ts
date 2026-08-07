import { test, expect } from '@playwright/test'
import { login, resetStubs, seedSessionRiskSummary } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'

const { referralId } = referralInformationTaskList

const incompleteStatus = { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' }
const completedStatus = { completed: true, statusText: 'Completed', tag: undefined }

test.describe('Task List Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, referralId)
  })

  // AC3 + AC4 - Display Additional Support Needs task with Incomplete status
  test('should display task list correctly with all tasks Incomplete', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', `Select the person's needs`, 'Incomplete')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus(
      'Referral contact details',
      'Add details of main point of contact',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Cannot start yet')
    await taskListPage.verifyCheckAnswersLink(referralId)
  })

  test('should display task list correctly after one task is updated to Completed', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: completedStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', `Select the person's needs`, 'Incomplete')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus(
      'Referral contact details',
      'Add details of main point of contact',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Cannot start yet')
    await taskListPage.verifyCheckAnswersLink(referralId)
  })

  test('should display check answers status correctly after all tasks are Completed', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: completedStatus,
      checkRiskInformationCompleted: completedStatus,
      selectThePersonsNeedsCompleted: completedStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: completedStatus,
      addDetailsOfMainPointOfContactCompleted: completedStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', `Select the person's needs`, 'Completed')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
    await taskListPage.verifyTaskStatus('Referral contact details', 'Add details of main point of contact', 'Completed')
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Completed')
    await taskListPage.verifyCheckAnswersLink(referralId)
  })

  test('should navigate to sub tasks', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.clickPersonalDetailsTask()
    await expect(taskListPage.page).toHaveURL(/personal-details/)

    await taskListPage.page.goBack()
    await taskListPage.clickCheckRiskInformationTask()
    await expect(taskListPage.page).toHaveURL(/view-risk-summary/)
  })

  // AC5 - Navigate to Additional support needs
  test('should navigate to additional support needs screen when link is clicked', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    })
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
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
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.clickAddSupportNeedsTask()
    await expect(taskListPage.page).toHaveURL(/additional-support-needs/)
    await expect(
      page.getByRole('heading', { name: 'What does Alex need support with to attend or take part in sessions?' }),
    ).toBeVisible()
  })

  // AC8 - Persist completed status / AC9 - Persist incomplete status
  test('should display correct status for additional support needs task based on completion', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: completedStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
  })

  // AC10 - Maintain Completed Status When Revisiting additional support needs Task
  test('should maintain Completed status when revisiting additional support needs task', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: completedStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    })
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
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
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
    await taskListPage.clickAddSupportNeedsTask()
    await expect(taskListPage.page).toHaveURL(/additional-support-needs/)
    await expect(
      page.getByRole('heading', { name: 'What does Alex need support with to attend or take part in sessions?' }),
    ).toBeVisible()
    await page.goto(TaskListPage.url())
    await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
  })
})

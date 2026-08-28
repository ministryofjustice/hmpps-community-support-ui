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

  test('should navigate to check risk information task', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
      addAdditionalInformationCompleted: incompleteStatus,
      selectAnAreaForReferralCompleted: incompleteStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.clickCheckRiskInformationTask()
    await expect(taskListPage.page).toHaveURL(/view-risk-summary/)
  })

  test('should navigate to additional support needs screen when link is clicked', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
      addAdditionalInformationCompleted: incompleteStatus,
      selectAnAreaForReferralCompleted: incompleteStatus,
    })
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
      refereeName: { firstName: 'Alex', lastName: 'Rivers' },
      physicalHealth: { selected: 'Unanswered' },
      mentalEmotionalHealth: { selected: 'Unanswered' },
      neurodiversity: { selected: 'Unanswered' },
      locationTravel: { selected: 'Unanswered' },
      caringResponsibilities: { selected: 'Unanswered' },
      employmentResponsibilities: { selected: 'Unanswered' },
      diversity: { selected: 'Unanswered' },
      anythingElse: { selected: 'Unanswered' },
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

  test('should display correct status for additional support needs task based on completion', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: completedStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
      addAdditionalInformationCompleted: incompleteStatus,
      selectAnAreaForReferralCompleted: incompleteStatus,
    })
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
  })

  test('should maintain Completed status when revisiting additional support needs task', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: completedStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
      addAdditionalInformationCompleted: incompleteStatus,
      selectAnAreaForReferralCompleted: incompleteStatus,
    })
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
      refereeName: { firstName: 'Alex', lastName: 'Rivers' },
      physicalHealth: { selected: 'Unanswered' },
      mentalEmotionalHealth: { selected: 'Unanswered' },
      neurodiversity: { selected: 'Unanswered' },
      locationTravel: { selected: 'Unanswered' },
      caringResponsibilities: { selected: 'Unanswered' },
      employmentResponsibilities: { selected: 'Unanswered' },
      diversity: { selected: 'Unanswered' },
      anythingElse: { selected: 'Unanswered' },
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

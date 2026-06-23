import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs, seedSessionCreateReferralDetails, seedSessionTaskListState } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'
import { TaskStatus } from '../../server/referral/taskList/TaskStatus'

test.describe('Task List Page', () => {
  const mockReferralId = referralInformationTaskList.referralId

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubCreateReferral(referralInformationTaskList)
    await page.goto('/')
    await login(page)
    await seedSessionCreateReferralDetails(page, {
      referralCreationDetails: {
        personDetails: { id: randomUUID(), personIdentifier: 'A123456', firstName: 'John', lastName: 'Doe' },
        communityServiceProviderId: 'csp-id-123',
        crn: 'A123456',
      },
    })
    await test.step('go to referral details page', async () => {
      await page.goto(TaskListPage.url(mockReferralId))
    })
  })

  test('should display task list correctly', async ({ page }) => {
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', `Add the person's needs`, 'Incomplete')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus(
      'Referral contact details',
      'Add contact details for this referral',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Cannot start yet')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test('should display task list correctly after updated task status', async ({ page }) => {
    await seedSessionTaskListState(page, 'A123456', 'riskInformation', TaskStatus.COMPLETED)
    await test.step('go to referral details page', async () => {
      await page.goto(TaskListPage.url(mockReferralId))
    })
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', `Add the person's needs`, 'Incomplete')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus(
      'Referral contact details',
      'Add contact details for this referral',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Cannot start yet')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test('should display check answers status correctly after updated all task status to completed', async ({ page }) => {
    await seedSessionTaskListState(page, 'A123456', 'personalDetails', TaskStatus.COMPLETED)
    await seedSessionTaskListState(page, 'A123456', 'riskInformation', TaskStatus.COMPLETED)
    await seedSessionTaskListState(page, 'A123456', 'personNeeds', TaskStatus.COMPLETED)
    await seedSessionTaskListState(page, 'A123456', 'supportNeeds', TaskStatus.COMPLETED)
    await seedSessionTaskListState(page, 'A123456', 'contactDetails', TaskStatus.COMPLETED)
    await test.step('go to referral details page', async () => {
      await page.goto(TaskListPage.url(mockReferralId))
    })
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', `Add the person's needs`, 'Completed')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
    await taskListPage.verifyTaskStatus(
      'Referral contact details',
      'Add contact details for this referral',
      'Completed',
    )
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Completed')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test('should navigate to sub tasks', async ({ page }) => {
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.clickPersonalDetailsTask()
    await expect(taskListPage.page).toHaveURL(/personal-details/)

    await taskListPage.page.goBack()
    await taskListPage.clickRiskInformationTask()
    await expect(taskListPage.page).toHaveURL(/risk-information/)
  })
})

import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs, seedSessionCreateReferralDetails, seedSessionTaskListState } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'
import FindPersonPage from '../pages/findPersonPage'
import CheckReferralInformationPage from '../pages/checkReferralInformationPage'
import { TaskStatus } from '../../server/referral/taskList/TaskStatus'

test.describe('Task List Page', () => {
  const mockReferralId = referralInformationTaskList.referralId
  const mockReferralDetailsInCommunity = {
    personDetails: {
      id: randomUUID(),
      personIdentifier: 'A123456',
      firstName: 'Alex',
      lastName: 'River',
      dateOfBirth: '20 Feb 1975 (51 years old)',
      sex: 'Male',
    },
    communityServiceProviderId: 'csp-id-123',
    crn: 'A123456',
  }
  const mockReferralDetailsInPrison = {
    personDetails: {
      firstName: 'Alex',
      lastName: 'River',
      personIdentifier: 'A1234BC',
      prisonNumbers: ['A1234BC', 'B1234CD', 'C1234DE'],
      sex: 'Male',
      id: 'ID123',
      dateOfBirth: '20 Feb 1975 (51 years old)',
    },
    communityServiceProviderId: 'csp-id-123',
    crn: 'A123456',
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubCreateReferral(referralInformationTaskList)
    await page.goto('/')
    await login(page)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInCommunity })
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

  test('should display CRN and DOB on check referral information', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)

    await TaskListPage.verifyOnPage(page)
    await page.getByRole('link', { name: 'Check answers and submit' }).click()

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    expect(checkReferralInformationPage.personalDetailsSummary.rows).toHaveLength(4)
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[0].key).toHaveText('Name')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[0].value).toHaveText('Alex River')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[1].key).toHaveText('CRN')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[1].value).toHaveText('A123456')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[2].key).toHaveText('Date of birth')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[2].value).toHaveText(
      '20 Feb 1975 (51 years old)',
    )
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[3].key).toHaveText('Sex')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[3].value).toHaveText('Male')
  })

  test('should display prison number and DOB on check referral information when searched by prison number', async ({
    page,
  }) => {
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInPrison })
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)

    await TaskListPage.verifyOnPage(page)
    await page.getByRole('link', { name: 'Check answers and submit' }).click()

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    expect(checkReferralInformationPage.personalDetailsSummary.rows).toHaveLength(4)
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[0].key).toHaveText('Name')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[0].value).toHaveText('Alex River')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[1].key).toHaveText('Prison number')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[1].value).toHaveText(
      'A1234BC, B1234CD, C1234DE',
    )
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[2].key).toHaveText('Date of birth')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[2].value).toHaveText(
      '20 Feb 1975 (51 years old)',
    )
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[3].key).toHaveText('Sex')
    await expect(checkReferralInformationPage.personalDetailsSummary.rows[3].value).toHaveText('Male')
  })

  test('should link back to find person from check referral information page', async ({ page }) => {
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInCommunity })
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)

    await TaskListPage.verifyOnPage(page)
    await page.getByRole('link', { name: 'Check answers and submit' }).click()

    await CheckReferralInformationPage.verifyOnPage(page)
    await page.getByRole('link', { name: 'Back', exact: true }).click()

    await FindPersonPage.verifyOnPage(page)
  })
})

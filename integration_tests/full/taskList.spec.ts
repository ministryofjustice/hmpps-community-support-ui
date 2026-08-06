import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs, seedSessionCreateReferralDetails, seedSessionRiskSummary } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'

test.describe('Task List Page', () => {
  const mockPersonId = randomUUID()
  const mockReferralDetailsInCommunity = {
    personDetails: {
      id: mockPersonId,
      personIdentifier: 'A123456',
      firstName: 'Alex',
      lastName: 'River',
      dateOfBirth: '20 Feb 1975 (51 years old)',
      sex: 'Male',
    },
  }

  const mockPersonalDetails = {
    id: '',
    personalDetails: {
      firstName: 'Alex',
      middleNames: '',
      lastName: 'Rivers',
      crn: 'X320741',
      prisonNumbers: [],
      dateOfBirth: '2026-07-27T13:36:00Z',
      preferredLanguage: 'English',
      currentCircumstances: {
        updatedAt: '2026-07-27T13:36:00Z',
        value: 'none',
      },
      disabilities: {
        updatedAt: '2026-07-27T13:36:00Z',
        allDisabilities: 'none',
      },
    },
    equalityMonitoring: {
      ethnicity: 'White',
      genderIdentity: 'Male',
      nationalities: ['British'],
      religionOrBelief: 'Christian',
      sex: 'Male',
      sexualOrientation: 'Hetrosexual',
      transgender: 'yes',
    },
    contactDetails: {
      phoneNumber: '',
      mobileNumber: '',
      emailAddress: '',
      address: {
        updatedAt: '2026-07-27T13:36:00Z',
        value: '',
        type: '',
        startAt: '2026-07-27T13:36:00Z',
        notes: 'some notes',
        noFixedAbode: true,
      },
    },
  }

  const mockRisk = {
    firstName: 'Alex',
    lastName: 'River',
    crn: 'X320741',
    dateOfBirth: '1975-02-20',
    assessmentWithin12Months: true,
    assessedOn: '2026-02-28T09:00:00',
    riskToSelf: {
      suicide: {
        risk: 'YES',
        previous: 'YES',
        previousConcernsText: 'Previous attempt in 2022 while in custody.',
        current: 'YES',
        currentConcernsText: 'Expressed suicidal ideation during last supervision.',
      },
      selfHarm: { risk: 'DK', previous: 'DK', current: 'DK' },
      custody: { risk: 'NO', previous: 'NO', current: 'NO' },
      hostelSetting: {
        risk: 'NO',
        previous: 'NO',
        current: 'NO',
      },
      vulnerability: {
        risk: 'YES',
        previous: 'NO',
        current: 'YES',
        currentConcernsText: 'Mental health deterioration noted by GP.',
      },
    },
    additionalInformation: 'Known to associate with a co-defendant in the local area.',
    summary: {
      whoIsAtRisk: 'Public, known adults and staff are at risk.',
      natureOfRisk: 'Physical violence and intimidation towards others.',
      riskImminence: 'Risk is immediate, particularly when under the influence of alcohol.',
      riskIncreaseFactors: 'Alcohol and drug misuse.',
      riskMitigationFactors: 'Regular probation contact.',
      analysisOfRiskFactors: 'Pattern of domestic violence linked to substance misuse.',
      riskInCommunity: { HIGH: ['Public'] },
      riskInCustody: { LOW: ['Public'] },
      overallRiskLevel: 'VERY_HIGH',
    },
  }

  const incompleteTaskListStatus = {
    fullName: 'John Doe',
    confirmPersonalDetailsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    checkRiskInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    addDetailsOfAnyAdditionalSupportNeedsCompleted: {
      completed: false,
      statusText: 'Incomplete',
      tag: 'govuk-tag--blue',
    },
    addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  }

  const completedTaskListStatus = {
    fullName: 'John Doe',
    confirmPersonalDetailsCompleted: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
    checkRiskInformationCompleted: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
    selectThePersonsNeedsCompleted: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
    addDetailsOfAnyAdditionalSupportNeedsCompleted: {
      completed: true,
      statusText: 'Completed',
      tag: 'govuk-tag--green',
    },
    addDetailsOfMainPointOfContactCompleted: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubCreateReferral(referralInformationTaskList)
    await communitySupport.stubGetTaskListStatus(referralInformationTaskList.referralId, incompleteTaskListStatus)
    await communitySupport.stubGetConfirmPersonalDetailsData(
      referralInformationTaskList.referralId,
      mockPersonalDetails,
    )
    await communitySupport.stubGetRoshRisks(referralInformationTaskList.referralId, mockRisk)
    await page.goto('/')
    await login(page)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInCommunity })
    await seedSessionRiskSummary(page, referralInformationTaskList.referralId, mockPersonId)
    await page.goto(TaskListPage.url())
  })

  test('should display task list correctly', async ({ page }) => {
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
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Not Started')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test('should display task list correctly after updated task status', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralInformationTaskList.referralId, {
      ...incompleteTaskListStatus,
      checkRiskInformationCompleted: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
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
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Not Started')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test('should display check answers status correctly after updated all task status to completed', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralInformationTaskList.referralId, completedTaskListStatus)

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
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Not Started')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test('should navigate to sub tasks', async ({ page }) => {
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.clickPersonalDetailsTask()
    await expect(taskListPage.page).toHaveURL(/personal-details/)

    await taskListPage.page.goBack()
    await taskListPage.clickCheckRiskInformationTask()
    await expect(taskListPage.page).toHaveURL(/view-risk-summary/)
  })
})

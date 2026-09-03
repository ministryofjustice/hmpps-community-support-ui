import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs, seedSessionCreateReferralDetails, seedSessionRiskSummary } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import checkDraftReferralDetails from '../mockData/checkDraftReferralDetailsData'
import TaskListPage from '../pages/TaskListPage'
import CheckReferralInformationPage from '../pages/checkReferralInformationPage'
import ReferralConfirmationPage from '../pages/referralConfirmationPage'

test.describe('Check Referral Information Page', () => {
  const mockReferralId = referralInformationTaskList.referralId
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
  const mockSubmitReferralResponse = {
    referralId: mockReferralId,
    personId: mockPersonId,
    referenceNumber: 'REF123456',
  }
  const mockCheckDraftReferralDetails = { ...checkDraftReferralDetails, id: mockReferralId }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubCreateReferral(referralInformationTaskList)
    await communitySupport.stubGetTaskListStatus(mockReferralId, { fullName: 'Alex River' })
    await page.goto('/')
    await login(page)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInCommunity })
    await seedSessionRiskSummary(page, mockReferralId, mockPersonId)
    await page.goto(TaskListPage.url())
  })

  test('should link back to task list from check referral information page', async ({ page }) => {
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInCommunity })
    await communitySupport.stubGetCheckDraftReferralDetails(mockReferralId, mockCheckDraftReferralDetails)

    await page.goto(CheckReferralInformationPage.url())

    await CheckReferralInformationPage.verifyOnPage(page)
    await page.getByRole('link', { name: 'Back', exact: true }).click()

    await TaskListPage.verifyOnPage(page)
  })

  test('should display confirmation page if referral submission was successful', async ({ page }) => {
    await communitySupport.stubGetReferral()
    await communitySupport.stubGetCheckDraftReferralDetails(mockReferralId, mockCheckDraftReferralDetails)
    await communitySupport.stubSubmitReferral(mockReferralId, mockSubmitReferralResponse, 200)

    await page.goto(CheckReferralInformationPage.url())

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    await checkReferralInformationPage.submitButton.click()

    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })

  test('should display confirmation page if referral was already submitted', async ({ page }) => {
    await communitySupport.stubGetReferral()
    await communitySupport.stubGetCheckDraftReferralDetails(mockReferralId, mockCheckDraftReferralDetails)
    await communitySupport.stubSubmitReferral(mockReferralId, mockSubmitReferralResponse, 409)

    await page.goto(CheckReferralInformationPage.url())

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    await checkReferralInformationPage.submitButton.click()

    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })
})

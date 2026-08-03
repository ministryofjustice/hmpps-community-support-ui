import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs, seedSessionCreateReferralDetails } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'
import FindPersonPage from '../pages/findPersonPage'
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

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubCreateReferral(referralInformationTaskList)
    await page.goto('/')
    await login(page)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInCommunity })
    await page.goto(TaskListPage.url())
  })

  test('should link back to find person from check referral information page', async ({ page }) => {
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: mockReferralDetailsInCommunity })
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

    await CheckReferralInformationPage.verifyOnPage(page)
    await page.getByRole('link', { name: 'Back', exact: true }).click()

    await FindPersonPage.verifyOnPage(page)
  })

  test('should display confirmation page if referral submission was successful', async ({ page }) => {
    await communitySupport.stubGetReferral()
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)
    await communitySupport.stubSubmitReferral(mockReferralId, mockSubmitReferralResponse, 200)

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    await checkReferralInformationPage.submitButton.click()

    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })

  test('should display confirmation page if referral was already submitted', async ({ page }) => {
    await communitySupport.stubGetReferral()
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)
    await communitySupport.stubSubmitReferral(mockReferralId, mockSubmitReferralResponse, 409)

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    await checkReferralInformationPage.submitButton.click()

    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })
})

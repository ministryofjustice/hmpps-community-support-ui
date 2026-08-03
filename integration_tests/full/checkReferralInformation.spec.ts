import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs, seedSessionCreateReferralDetails } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'
import FindPersonPage from '../pages/findPersonPage'
import CheckReferralInformationPage from '../pages/checkReferralInformationPage'
import ReferralConfirmationPage from '../pages/referralConfirmationPage'
import ErrorPage from '../pages/errorPage'

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

  test('should display CRN and DOB on check referral information', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

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

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

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

    await CheckReferralInformationPage.verifyOnPage(page)

    await page.getByRole('button', { name: 'Submit' }).click()

    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })

  test('should display confirmation page if referral was already submitted', async ({ page }) => {
    await communitySupport.stubGetReferral()
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)
    await communitySupport.stubSubmitReferral(mockReferralId, mockSubmitReferralResponse, 409)

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

    await CheckReferralInformationPage.verifyOnPage(page)

    await page.getByRole('button', { name: 'Submit' }).click()

    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })

  test('should display system error page if internal error was encountered during the submission', async ({ page }) => {
    await communitySupport.stubGetReferral()
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)
    await communitySupport.stubSubmitReferral(mockReferralId, mockSubmitReferralResponse, 500)

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    await checkReferralInformationPage.submitButton.click()

    const errorPage = await ErrorPage.verifyOnSystemErrorPage(page, {
      heading: 'Sorry, there has been a problem submitting the referral',
      message:
        'The referral has not been submitted and it has not been saved. You must create and submit the referral again.',
      buttonText: 'Create a new referral',
      buttonUrl: '/referral/new/find-a-person',
    })

    errorPage.clickButton()

    await FindPersonPage.verifyOnPage(page)
  })

  test('should display default error page if other error was encountered during the submission', async ({ page }) => {
    await communitySupport.stubGetReferral()
    await communitySupport.stubGetReferralInformation(200, mockReferralId, referralInformationTaskList)
    await communitySupport.stubSubmitReferral(mockReferralId, mockSubmitReferralResponse, 403)

    await page.goto(CheckReferralInformationPage.url(mockReferralId))

    const checkReferralInformationPage = await CheckReferralInformationPage.verifyOnPage(page)

    await checkReferralInformationPage.submitButton.click()

    await ErrorPage.verifyOnSPage(page)
  })
})

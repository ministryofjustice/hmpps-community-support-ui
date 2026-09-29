import { expect, test, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import CaseListPage from '../pages/caseListPage'
import ErrorPage from '../pages/errorPage'
import ReferralDetailsPage from '../pages/referralDetailsPage'
import WithdrawalConfirmPage from '../pages/withdrawalConfirmPage'
import WithdrawalReasonPage from '../pages/withdrawalReasonPage'
import communitySupport from '../mockApis/communitySupport'
import { login, resetStubs } from '../testUtils'
import referralDetailsPageData from '../mockData/referralDetailsPageData'

const referralId = randomUUID()
const caseIdentifier = 'QD0878DE'
const referralDetails = referralDetailsPageData(referralId)
const withdrawalReasonGroups = {
  'Problem with referral': ['Ineligible referral', 'Mistaken or duplicate referral'],
  'Sentence or custody related': ['Acquitted on appeal', 'Returned to custody', 'Sentence expired', 'Sentence revoked'],
  'User related': [
    'Another reason',
    'Died',
    'Moved out of service area',
    'Needs met through another route',
    'Not engaged',
    'Work, caring commitments or sickness',
  ],
}
const withdrawalRequest = {
  reasonCode: 'Not engaged',
  additionalDetails: 'No longer engaging.',
}
const reasonLabels = [
  'Ineligible referral',
  'Mistaken or duplicate referral',
  'Acquitted on appeal',
  'Returned to custody',
  'Sentence expired',
  'Sentence revoked',
  'Died',
  'Moved out of service area',
  'Needs met through another route',
  'Not engaged',
  'Work, caring commitments or sickness',
  'Another reason',
]

test.describe('Withdraw referral', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferralDetailsPage(200, referralId)
    await communitySupport.stubGetInProgressCase()
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest)
    await communitySupport.stubGetWithdrawalReasons({ withdrawalReasons: withdrawalReasonGroups })
    await page.goto('/')
    await login(page)
  })

  async function goToWithdrawalConfirm(page: Page) {
    await page.goto(WithdrawalReasonPage.url(caseIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await withdrawalPage.reason('Not engaged').check()

    const additionalInformation = await withdrawalPage.additionalInformationFor('Not engaged')
    await expect(additionalInformation).toBeVisible()
    await additionalInformation.fill(withdrawalRequest.additionalDetails)
    await withdrawalPage.continueButton.click()

    return WithdrawalConfirmPage.verifyOnPage(page)
  }

  // AC1
  test('takes a delivery partner from referral details to withdrawal', async ({ page }) => {
    await page.goto(ReferralDetailsPage.url(referralId))
    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    await referralDetailsPage.withdrawReferralLink.click()

    await expect(page).toHaveURL(WithdrawalReasonPage.url(caseIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await expect(withdrawalPage.header).toHaveText(
      `Why are you withdrawing ${referralDetails.personDetailsTableData.name}'s referral?`,
    )
  })

  // AC2
  test('displays every withdrawal reason in its specified group', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(caseIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)

    await expect(withdrawalPage.reasonHeadings).toHaveText([
      'Problem with referral',
      'Sentence or custody related',
      'User related',
    ])
    await expect(withdrawalPage.reasonRadios).toHaveCount(reasonLabels.length)
    await Promise.all(reasonLabels.map(reasonLabel => expect(withdrawalPage.reason(reasonLabel)).toBeVisible()))
    await expect(withdrawalPage.reasonDivider).toHaveText('or')
    await expect(page.locator('.govuk-radios__divider + .govuk-radios__item')).toContainText('Another reason')
  })

  // AC3 and AC6
  test('reveals required additional information and continues to confirmation', async ({ page }) => {
    const confirmationPage = await goToWithdrawalConfirm(page)

    await expect(confirmationPage.header).toHaveText('Check withdrawal details')
    await expect(confirmationPage.reasonSummaryKey).toHaveText(
      `Why are you withdrawing ${referralDetails.personDetailsTableData.name}'s referral?`,
    )
    await expect(confirmationPage.reasonSummaryValue).toHaveText('Not engaged')
    await expect(confirmationPage.warningText).toBeVisible()
    await expect(confirmationPage.withdrawButton).toBeVisible()
    await expect(confirmationPage.cancelLink).toBeVisible()
    await expect(confirmationPage.changeLink).toBeVisible()
  })

  // AC4
  test('shows an error when no withdrawal reason is selected', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(caseIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await withdrawalPage.continueButton.click()

    await expect(withdrawalPage.errorSummary.locator).toBeVisible()
    await expect(
      withdrawalPage.errorSummary.list.getByRole('link', { name: 'Select why you are withdrawing the referral' }),
    ).toBeVisible()
    expect(await page.locator('textarea').allTextContents()).not.toContain('null')
  })

  // AC5
  test('shows an error when additional information is missing', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(caseIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await withdrawalPage.reason('Not engaged').check()
    await withdrawalPage.continueButton.click()

    await expect(withdrawalPage.errorSummary.locator).toBeVisible()
    await expect(
      withdrawalPage.errorSummary.list.getByRole('link', {
        name: 'Enter details',
      }),
    ).toBeVisible()
    await expect(withdrawalPage.additionalInformationErrorFor('Not engaged')).toContainText('Enter details')
  })

  // AC7
  test('returns to referral details when withdrawal is cancelled', async ({ page }) => {
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.cancelLink.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(caseIdentifier))
    await ReferralDetailsPage.verifyOnPage(page)
  })

  // AC8
  test('redirects to referral details when withdrawal is confirmed', async ({ page }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(caseIdentifier))
    await ReferralDetailsPage.verifyOnPage(page)
  })

  test('shows a dismissible success alert on referral details after withdrawal, which does not reappear on reload', async ({
    page,
  }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(caseIdentifier))
    let referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    await expect(referralDetailsPage.alert).toBeVisible()
    await expect(referralDetailsPage.alert).toContainText('Referral withdrawn')

    await test.step('dismiss the alert', async () => {
      await referralDetailsPage.alert.getByRole('button', { name: 'Dismiss' }).click()
      await expect(referralDetailsPage.alert).toHaveCount(0)
    })

    await test.step('the alert does not reappear after navigating back to the page', async () => {
      await communitySupport.stubGetReferralDetailsPage(200, referralId)
      await page.reload()
      referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
      await expect(referralDetailsPage.alert).toHaveCount(0)
    })
  })

  // AC9
  test('redirects to referral details when another user has already withdrawn the referral', async ({ page }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest, 409)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(caseIdentifier))
    await ReferralDetailsPage.verifyOnPage(page)
  })

  test('shows an error alert on referral details when another user has already withdrawn the referral', async ({
    page,
  }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest, 409)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(caseIdentifier))
    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    await expect(referralDetailsPage.alert).toBeVisible()
    await expect(referralDetailsPage.alert).toContainText('Referral already withdrawn by another user')
  })

  test('shows an information alert with the withdrawal date when the referral was already withdrawn and there is no new notification', async ({
    page,
  }) => {
    await communitySupport.stubGetReferralDetailsPage(
      200,
      referralId,
      undefined,
      undefined,
      true,
      '2026-09-08T00:00:00.000Z',
    )
    await page.goto(ReferralDetailsPage.url(referralId))

    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    await expect(referralDetailsPage.alert).toBeVisible()
    await expect(referralDetailsPage.alert).toContainText('Referral withdrawn on 8 September 2026')
    await expect(referralDetailsPage.alert.getByRole('button', { name: 'Dismiss' })).toHaveCount(0)
  })

  // AC10
  test('shows a service error when withdrawal fails unexpectedly', async ({ page }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest, 500)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(`/referral/${caseIdentifier}/withdraw/service-error`)
    const errorPage = await ErrorPage.verifyOnSystemErrorPage(page, {
      heading: 'Sorry, there is a problem with this service',
      message: 'Try again later.',
      buttonText: 'Go to case list',
      buttonUrl: '/cases-in-progress',
    })
    await errorPage.clickButton()

    await expect(page).toHaveURL(CaseListPage.url('in-progress'))
    await CaseListPage.verifyOnPage(page)
  })
})

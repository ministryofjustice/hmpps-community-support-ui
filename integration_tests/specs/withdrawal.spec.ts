import { expect, test, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import CaseListPage from '../pages/caseListPage'
import ReferralDetailsPage from '../pages/referralDetailsPage'
import WithdrawalConfirmPage from '../pages/withdrawalConfirmPage'
import WithdrawalReasonPage from '../pages/withdrawalReasonPage'
import WithdrawalServiceErrorPage from '../pages/withdrawalServiceErrorPage'
import communitySupport from '../mockApis/communitySupport'
import { login, resetStubs } from '../testUtils'
import referralDetailsPageData from '../mockData/referralDetailsPageData'

const referralId = randomUUID()
const caseIdentifier = 'QD0878DE'
const referralDetails = referralDetailsPageData(referralId)
const withdrawalRequest = {
  reasonCode: 'Not engaged',
  additionalDetails: 'No longer engaging.',
}
const reasonLabels = [
  'Ineligible referral',
  'Mistaken or duplicate referral',
  'Died',
  'Moved out of service area',
  'Not engaged',
  'Needs met through another route',
  'Work, caring commitments or sickness',
  'Another reason',
  'Acquitted on appeal',
  'Returned to custody',
  'Sentence revoked',
  'Sentence expired',
]

test.describe('Withdraw referral', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferralDetailsPage(200, referralId)
    await communitySupport.stubGetInProgressCase()
    await communitySupport.stubGetWithdrawalReasons()
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

    await expect(page.locator('.govuk-hint', { hasText: 'Select one reason.' })).toBeVisible()
    await expect(withdrawalPage.reasonHeadings).toHaveText([
      'Problem with referral',
      'User related',
      'Sentence or custody related',
    ])
    await expect(withdrawalPage.reasonRadios).toHaveCount(reasonLabels.length)
    await Promise.all(reasonLabels.map(reasonLabel => expect(withdrawalPage.reason(reasonLabel)).toBeVisible()))
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
      withdrawalPage.errorSummary.list.getByRole('link', { name: 'Select a reason for withdrawing the referral' }),
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
        name: 'Enter additional information about why the referral is being withdrawn',
      }),
    ).toBeVisible()
    await expect(withdrawalPage.additionalInformationErrorFor('Not engaged')).toContainText(
      'Enter additional information about why the referral is being withdrawn',
    )
  })

  // AC7
  test('returns to referral details when withdrawal is cancelled', async ({ page }) => {
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.cancelLink.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(caseIdentifier))
    await ReferralDetailsPage.verifyOnPage(page)
  })

  // AC8
  test('returns to open cases when withdrawal is confirmed', async ({ page }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(CaseListPage.url('in-progress'))
    await CaseListPage.verifyOnPage(page)
  })

  // AC9
  test('redirects to referral details when another user has already withdrawn the referral', async ({ page }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest, 409)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(referralId))
    await ReferralDetailsPage.verifyOnPage(page)
  })

  // AC10
  test('shows a service error when withdrawal fails unexpectedly', async ({ page }) => {
    await communitySupport.stubWithdrawReferral(caseIdentifier, withdrawalRequest, 500)
    const confirmationPage = await goToWithdrawalConfirm(page)
    await confirmationPage.withdrawButton.click()

    await expect(page).toHaveURL(WithdrawalServiceErrorPage.url(caseIdentifier))
    const serviceErrorPage = await WithdrawalServiceErrorPage.verifyOnPage(page)
    await serviceErrorPage.goToCasesListButton.click()

    await expect(page).toHaveURL(CaseListPage.url('in-progress'))
    await CaseListPage.verifyOnPage(page)
  })
})

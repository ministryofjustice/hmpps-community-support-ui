import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import CaseListPage from '../pages/caseListPage'
import ReferralDetailsPage from '../pages/referralDetailsPage'
import WithdrawalConfirmationPage from '../pages/withdrawalConfirmationPage'
import WithdrawalReasonPage from '../pages/withdrawalReasonPage'
import communitySupport from '../mockApis/communitySupport'
import { login, resetStubs } from '../testUtils'
import referralDetailsPageData from '../mockData/referralDetailsPageData'

const referralId = randomUUID()
const referralIdentifier = 'QD0878DE'
const referralDetails = referralDetailsPageData(referralId)
const reasonLabels = [
  'Ineligible referral',
  'Mistaken or duplicate referral',
  'Not engaged',
  'Needs met through another route',
  'User died',
  'Work, caring commitments, or sickness',
  'Acquitted on appeal',
  'Returned to custody',
  'Sentence revoked',
  'Sentence expired',
  'Any other change of circumstance',
]

test.describe('Withdraw referral', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferralDetailsPage(200, referralId)
    await communitySupport.stubGetInProgressCase()
    await page.goto('/')
    await login(page)
  })

  // AC1
  test('takes a delivery partner from referral details to withdrawal', async ({ page }) => {
    await page.goto(ReferralDetailsPage.url(referralId))
    await page.getByRole('link', { name: 'Withdraw referral', exact: true }).click()

    await expect(page).toHaveURL(WithdrawalReasonPage.url(referralIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await expect(withdrawalPage.header).toHaveText(
      `Why are you withdrawing ${referralDetails.personDetailsTableData.name}'s referral?`,
    )
  })

  // AC2
  test('displays every withdrawal reason in its specified group', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(referralIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)

    await expect(page.locator('.govuk-hint', { hasText: 'Select one reason.' })).toBeVisible()
    await expect(withdrawalPage.reasonHeadings).toHaveText([
      'Problem with referral',
      'User related',
      'Sentence / custody related',
      'Other',
    ])
    await expect(withdrawalPage.reasonRadios).toHaveCount(reasonLabels.length)
    await Promise.all(reasonLabels.map(reasonLabel => expect(withdrawalPage.reason(reasonLabel)).toBeVisible()))
  })

  // AC3 and AC6
  test('reveals required additional information and continues to confirmation', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(referralIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await withdrawalPage.reason('Not engaged').check()

    const additionalInformation = await withdrawalPage.additionalInformationFor('Not engaged')
    await expect(additionalInformation).toBeVisible()
    await additionalInformation.fill('The person has stopped responding to contact attempts.')
    await withdrawalPage.continueButton.click()

    await expect(page).toHaveURL(WithdrawalConfirmationPage.url(referralIdentifier))
    const confirmationPage = await WithdrawalConfirmationPage.verifyOnPage(page)
    await expect(confirmationPage.header).toHaveText(
      `Withdraw ${referralDetails.personDetailsTableData.name}'s referral`,
    )
  })

  // AC4
  test('shows an error when no withdrawal reason is selected', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(referralIdentifier))
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
    await page.goto(WithdrawalReasonPage.url(referralIdentifier))
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
  test('returns to referral details when withdrawal is not confirmed', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(referralIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await withdrawalPage.reason('Not engaged').check()
    await (await withdrawalPage.additionalInformationFor('Not engaged')).fill('No longer engaging.')
    await withdrawalPage.continueButton.click()

    const confirmationPage = await WithdrawalConfirmationPage.verifyOnPage(page)
    await confirmationPage.choice('No').check()
    await confirmationPage.continueButton.click()

    await expect(page).toHaveURL(ReferralDetailsPage.url(referralIdentifier))
    await ReferralDetailsPage.verifyOnPage(page)
  })

  // AC8
  test('returns to open cases when withdrawal is confirmed', async ({ page }) => {
    await page.goto(WithdrawalReasonPage.url(referralIdentifier))
    const withdrawalPage = await WithdrawalReasonPage.verifyOnPage(page)
    await withdrawalPage.reason('Not engaged').check()
    await (await withdrawalPage.additionalInformationFor('Not engaged')).fill('No longer engaging.')
    await withdrawalPage.continueButton.click()

    const confirmationPage = await WithdrawalConfirmationPage.verifyOnPage(page)
    await confirmationPage.choice('Yes').check()
    await confirmationPage.continueButton.click()

    await expect(page).toHaveURL(CaseListPage.url('in-progress'))
    await CaseListPage.verifyOnPage(page)
  })
})

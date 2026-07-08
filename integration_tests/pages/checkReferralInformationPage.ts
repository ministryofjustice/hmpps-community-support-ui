import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class CheckReferralInformationPage extends AbstractPage {
  readonly header: Locator

  readonly submitButton: Locator

  readonly personalDetailsSummary: SummaryList

  readonly referralDetailsSummary: SummaryList

  private constructor(page: Page, personalDetailsSummary: SummaryList, referralDetailsSummary: SummaryList) {
    super(page)
    this.header = page.locator('h1').first()
    this.submitButton = page.locator('button', { hasText: 'Submit referral' })
    this.personalDetailsSummary = personalDetailsSummary
    this.referralDetailsSummary = referralDetailsSummary
  }

  static url(referralId: string): string {
    return `/referral/check-referral-information/${referralId}`
  }

  static async verifyOnPage(page: Page): Promise<CheckReferralInformationPage> {
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const referralDetailsSummary = await SummaryList.create(page.locator('[data-testid="referral-details"]'))
    const checkReferralInformationPage = new CheckReferralInformationPage(
      page,
      personalDetailsSummary,
      referralDetailsSummary,
    )
    await expect(checkReferralInformationPage.personalDetailsSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.referralDetailsSummary.summaryLocator).toBeVisible()
    return checkReferralInformationPage
  }
}

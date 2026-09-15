import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class CheckReferralInformationPage extends AbstractPage {
  readonly header: Locator

  readonly submitButton: Locator

  readonly personalDetailsSummary: SummaryList

  readonly referralDetailsSummary: SummaryList

  readonly equalityMonitoringSummary: SummaryList

  private constructor(
    page: Page,
    personalDetailsSummary: SummaryList,
    referralDetailsSummary: SummaryList,
    equalityMonitoringSummary: SummaryList,
  ) {
    super(page)
    this.header = page.locator('h1').first()
    this.submitButton = page.locator('button', { hasText: 'Submit referral' })
    this.personalDetailsSummary = personalDetailsSummary
    this.referralDetailsSummary = referralDetailsSummary
    this.equalityMonitoringSummary = equalityMonitoringSummary
  }

  static url(): string {
    return '/referral/check-referral-information'
  }

  static async verifyOnPage(page: Page): Promise<CheckReferralInformationPage> {
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const referralDetailsSummary = await SummaryList.create(page.locator('[data-testid="referral-details"]'))
    const equalityMonitoringSummary = await SummaryList.create(page.locator('[data-testid="equality-monitoring"]'))
    const checkReferralInformationPage = new CheckReferralInformationPage(
      page,
      personalDetailsSummary,
      referralDetailsSummary,
      equalityMonitoringSummary,
    )
    await expect(checkReferralInformationPage.personalDetailsSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.referralDetailsSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.equalityMonitoringSummary.summaryLocator).toBeVisible()
    return checkReferralInformationPage
  }
}

import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class CheckReferralInformationPage extends AbstractPage {
  readonly header: Locator

  readonly submitButton: Locator

  readonly personalDetailsSummary: SummaryList

  readonly additionalInformationSummary?: SummaryList

  readonly referralDetailsSummary: SummaryList

  readonly equalityMonitoringSummary: SummaryList

  readonly contactDetailsSummary: SummaryList

  readonly riskInformationSummary: SummaryList

  private constructor(
    page: Page,
    personalDetailsSummary: SummaryList,
    equalityMonitoringSummary: SummaryList,
    riskInformationSummary: SummaryList,
    referralDetailsSummary: SummaryList,
    additionalInformationSummary?: SummaryList,
    contactDetailsSummary?: SummaryList,
  ) {
    super(page)
    this.header = page.locator('h1').first()
    this.submitButton = page.locator('button', { hasText: 'Submit referral' })
    this.personalDetailsSummary = personalDetailsSummary
    this.equalityMonitoringSummary = equalityMonitoringSummary
    this.additionalInformationSummary = additionalInformationSummary
    this.riskInformationSummary = riskInformationSummary
    this.referralDetailsSummary = referralDetailsSummary
    this.contactDetailsSummary = contactDetailsSummary as SummaryList
  }

  static url(): string {
    return '/referral/check-referral-information'
  }

  static async verifyOnPage(page: Page): Promise<CheckReferralInformationPage> {
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const riskInformationSummary = await SummaryList.create(page.locator('[data-testid="risk-information"]'))
    const referralDetailsSummary = await SummaryList.create(page.locator('[data-testid="referral-details"]'))
    const additionalInformationSummary = await SummaryList.create(
      page.locator('[data-testid="additional-information"]'),
    )
    const equalityMonitoringSummary = await SummaryList.create(page.locator('[data-testid="equality-monitoring"]'))
    const contactDetailsSummary = await SummaryList.create(page.locator('[data-testid="contact-details"]'))
    const checkReferralInformationPage = new CheckReferralInformationPage(
      page,
      personalDetailsSummary,
      equalityMonitoringSummary,
      riskInformationSummary,
      referralDetailsSummary,
      additionalInformationSummary,
      contactDetailsSummary,
    )
    await expect(checkReferralInformationPage.personalDetailsSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.riskInformationSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.referralDetailsSummary.summaryLocator).toBeVisible()
    await expect(additionalInformationSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.equalityMonitoringSummary.summaryLocator).toBeVisible()
    await expect(contactDetailsSummary.summaryLocator).toBeVisible()
    return checkReferralInformationPage
  }
}

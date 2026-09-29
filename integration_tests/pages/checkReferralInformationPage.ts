import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class CheckReferralInformationPage extends AbstractPage {
  readonly header: Locator

  readonly submitButton: Locator

  readonly personalDetailsSummary: SummaryList

  readonly equalityMonitoringSummary: SummaryList

  readonly additionalInformationSummary?: SummaryList

  readonly contactDetailsSummary: SummaryList

  readonly riskInformationSummary: SummaryList

  readonly additionalSupportNeedsSummary: SummaryList

  readonly personsNeedsSummary: SummaryList

  private constructor(
    page: Page,
    personalDetailsSummary: SummaryList,
    equalityMonitoringSummary: SummaryList,
    contactDetailsSummary: SummaryList,
    riskInformationSummary: SummaryList,
    additionalSupportNeedsSummary: SummaryList,
    personsNeedsSummary: SummaryList,
    additionalInformationSummary?: SummaryList,
  ) {
    super(page)
    this.submitButton = page.locator('button', { hasText: 'Submit referral' })
    this.header = page.locator('h1').first()
    this.personalDetailsSummary = personalDetailsSummary
    this.equalityMonitoringSummary = equalityMonitoringSummary
    this.additionalInformationSummary = additionalInformationSummary
    this.riskInformationSummary = riskInformationSummary
    this.additionalSupportNeedsSummary = additionalSupportNeedsSummary
    this.personsNeedsSummary = personsNeedsSummary
    this.contactDetailsSummary = contactDetailsSummary as SummaryList
  }

  static url(): string {
    return '/referral/check-referral-information'
  }

  static async verifyOnPage(page: Page): Promise<CheckReferralInformationPage> {
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const equalityMonitoringSummary = await SummaryList.create(page.locator('[data-testid="equality-monitoring"]'))
    const additionalInformationSummary = await SummaryList.create(
      page.locator('[data-testid="additional-information"]'),
    )
    const contactDetailsSummary = await SummaryList.create(page.locator('[data-testid="contact-details"]'))
    const riskInformationSummary = await SummaryList.create(page.locator('[data-testid="risk-information"]'))
    const additionalSupportNeedsSummary = await SummaryList.create(
      page.locator('[data-testid="additional-support-needs"]'),
    )
    const personsNeedsSummary = await SummaryList.create(page.locator('[data-testid="persons-needs"]'))

    const checkReferralInformationPage = new CheckReferralInformationPage(
      page,
      personalDetailsSummary,
      equalityMonitoringSummary,
      contactDetailsSummary,
      riskInformationSummary,
      additionalSupportNeedsSummary,
      personsNeedsSummary,
      additionalInformationSummary,
    )

    await expect(checkReferralInformationPage.personalDetailsSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.equalityMonitoringSummary.summaryLocator).toBeVisible()
    await expect(additionalInformationSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.riskInformationSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.personsNeedsSummary.summaryLocator).toBeVisible()
    await expect(checkReferralInformationPage.additionalSupportNeedsSummary.summaryLocator).toBeVisible()
    await expect(contactDetailsSummary.summaryLocator).toBeVisible()
    return checkReferralInformationPage
  }
}

import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class ReferralDetailsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly personalDetailsSummary: SummaryList,
    readonly equalityMonitoringSummary: SummaryList,
    readonly contactDetailsSummary: SummaryList,
    readonly referralDetailsSummary: SummaryList,
  ) {
    super(page)
  }

  static async verifyOnPage(page: Page): Promise<ReferralDetailsPage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const equalityMonitoringSummary = await SummaryList.create(page.locator('[data-testid="equality-details"]'))
    const contactDetailsSummary = await SummaryList.create(page.locator('[data-testid="contact-details"]'))
    const referralDetailsSummary = await SummaryList.create(page.locator('[data-testid="referral-details"]'))
    const referralDetailsPage = new ReferralDetailsPage(
      page,
      header,
      personalDetailsSummary,
      equalityMonitoringSummary,
      contactDetailsSummary,
      referralDetailsSummary,
    )
    return referralDetailsPage
  }
}

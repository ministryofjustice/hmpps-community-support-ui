import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class ReferralDetailsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly personalDetailsSummary: SummaryList,
    readonly equalityMonteringSummary: SummaryList,
    readonly contactDetailsSummary: SummaryList,
    readonly referralDetailsSummary: SummaryList,
  ) {
    super(page)
  }

  static async verifyOnPage(page: Page): Promise<ReferralDetailsPage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const equalityMonteringSummary = await SummaryList.create(page.locator('[data-testid="equality-details"]'))
    const contactDetailsSummary = await SummaryList.create(page.locator('[data-testid="contact-details"]'))
    const referralDetailsSummary = await SummaryList.create(page.locator('[data-testid="referral-details"]'))
    const referralDetailsPage = new ReferralDetailsPage(
      page,
      header,
      backLink,
      personalDetailsSummary,
      equalityMonteringSummary,
      contactDetailsSummary,
      referralDetailsSummary,
    )
    return referralDetailsPage
  }
}

import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class ConfirmContactDetailsPage extends AbstractPage {
  readonly heading: Locator

  readonly pageCaption: Locator

  readonly subHeading: Locator

  readonly backLink: Locator

  readonly continueButton: Locator

  // The "Change" action is rendered once at the summary card level (not per-row) since
  // generateSummaryList only sets a single card-level action, not per-row actions.
  readonly changeLink: Locator

  private constructor(
    page: Page,
    readonly summaryList: SummaryList,
  ) {
    super(page)
    this.heading = page.locator('h1.govuk-heading-xl')
    this.pageCaption = page.locator('span.govuk-caption-l')
    this.subHeading = page.getByRole('heading', { name: 'Check contact details' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.continueButton = page.getByRole('button', { name: 'Save and continue' })
    this.changeLink = page.locator('.govuk-summary-card__actions').getByRole('link', { name: 'Change' })
  }

  static url(fromPP = false): string {
    return fromPP ? '/referral/new/confirm-contact-details?fromPP=true' : '/referral/new/confirm-contact-details'
  }

  static async verifyOnPage(page: Page): Promise<ConfirmContactDetailsPage> {
    const summaryList = await SummaryList.create(page.locator('.govuk-summary-list'))
    const confirmContactDetailsPage = new ConfirmContactDetailsPage(page, summaryList)
    await expect(confirmContactDetailsPage.heading).toBeVisible()
    await expect(confirmContactDetailsPage.subHeading).toBeVisible()
    return confirmContactDetailsPage
  }

  async submit(): Promise<void> {
    await this.continueButton.click()
  }
}

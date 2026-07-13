import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class FoundPersonPage extends AbstractPage {
  readonly header: Locator

  readonly continueButton: Locator

  readonly personSummary: SummaryList

  readonly enterDifferentIdentifierLink: Locator

  private constructor(page: Page, personSummary: SummaryList) {
    super(page)
    this.header = page.locator('h1').first()
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.personSummary = personSummary
    this.enterDifferentIdentifierLink = page.getByRole('link', {
      name: 'Enter a different CRN or prison number',
      exact: true,
    })
  }

  static async verifyOnPage(page: Page): Promise<FoundPersonPage> {
    const personSummary = await SummaryList.create(page.locator('[data-testid="personsummary"]'))
    const foundPersonPage = new FoundPersonPage(page, personSummary)
    await expect(foundPersonPage.personSummary.summaryLocator).toBeVisible()
    await expect(foundPersonPage.enterDifferentIdentifierLink).toBeVisible()
    return foundPersonPage
  }
}

import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'
import ErrorSummary from './components/errorSummary'

export default class DidAttendPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly errorSummary: ErrorSummary,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly didAttendRadios: RadiosWithFieldSet,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  async selectDidAttend(option: string) {
    await this.didAttendRadios.select(option)
  }

  async clickContinue() {
    await this.continueButton.click()
  }

  async selectDidAttendAndContinue(option: string) {
    await this.selectDidAttend(option)
    await this.clickContinue()
  }

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/did-attend`
  }

  static async verifyOnPage(page: Page): Promise<DidAttendPage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const errorSummary = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const didAttend = await RadiosWithFieldSet.create(
      page.locator('[data-testid="didAttend"]'),
      page.locator('[data-testid="fieldset-didAttend"]'),
    )
    const submit = page.getByRole('button', { name: 'Continue' })
    return new DidAttendPage(page, errorSummary, header, backLink, didAttend, submit)
  }
}

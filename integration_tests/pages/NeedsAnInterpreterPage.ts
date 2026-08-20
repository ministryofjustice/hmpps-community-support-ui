import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'

export default class NeedsAnInterpreterPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly radios: RadiosWithFieldSet,
    readonly textArea: Locator,
    readonly button: Locator,
    readonly errorBanner: Locator,
  ) {
    super(page)
  }

  async select(value: string) {
    await this.radios.select(value)
  }

  async clickSaveAndContinue() {
    await this.button.click()
  }

  static url(): string {
    return `/referral/task-list/needs-an-interpreter`
  }

  static async verifyOnPage(page: Page, firstName: string): Promise<NeedsAnInterpreterPage> {
    const header = page.getByRole('heading', { name: `Does ${firstName} need an interpreter?` })
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const button = page.getByRole('button', { name: 'Save and Continue' })
    const radios = await RadiosWithFieldSet.create(
      page.locator('[data-testid="needs-interpreter"]'),
      page.locator('[data-testid="needs-interpreter-legend"]'),
    )
    const textArea = page.locator('[data-testid="language"]')
    const errorBanner = page.locator('[data-testid="error-messages"]')
    await expect(header).toBeVisible()
    return new NeedsAnInterpreterPage(page, header, backLink, radios, textArea, button, errorBanner)
  }

  async fill(text: string) {
    await this.textArea.fill(text)
  }
}

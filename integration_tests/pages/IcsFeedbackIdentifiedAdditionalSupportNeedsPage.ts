import { Locator, Page, expect } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'

export default class IcsFeedbackIdentifiedAdditionalSupportNeedsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly errorBanner: Locator,
    readonly header: Locator,
    readonly subheading: Locator,
    readonly backLink: Locator,
    readonly radios: RadiosWithFieldSet,
    readonly textArea: Locator,
    readonly button: Locator,
  ) {
    super(page)
  }

  async select(value: string) {
    await this.radios.select(value)
  }

  async clickSaveAndContinue() {
    await this.button.click()
  }

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/identified-additional-needs`
  }

  static async verifyOnPage(page: Page): Promise<IcsFeedbackIdentifiedAdditionalSupportNeedsPage> {
    const errorBanner = page.locator('[data-testid="error-messages"]')
    const header = page.getByRole('heading', { name: `Additional support needs` })
    const subheading = page.locator('[data-testid="subheading"]')
    const backLink = page.getByRole('link', { name: 'Back', exact: true })

    const button = page.getByRole('button', { name: 'Save and Continue' })
    const radios = await RadiosWithFieldSet.create(
      page.locator('[data-testid="didYouIdentify"]'),
      page.locator('[data-testid="didYouIdentify-legend"]'),
    )
    const textArea = page.locator('[id="identifyDetailsInput"]')

    await expect(header).toBeVisible()
    return new IcsFeedbackIdentifiedAdditionalSupportNeedsPage(
      page,
      errorBanner,
      header,
      subheading,
      backLink,
      radios,
      textArea,
      button,
    )
  }

  async fill(text: string) {
    await this.textArea.fill(text)
  }
}

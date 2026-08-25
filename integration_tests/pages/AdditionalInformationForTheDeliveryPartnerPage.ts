import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'

export default class AdditionalInformationForTheDeliveryPartnerPage extends AbstractPage {
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
    return '/referral/task-list/additional-information-for-the-delivery-partner'
  }

  static async verifyOnPage(page: Page, firstName: string): Promise<AdditionalInformationForTheDeliveryPartnerPage> {
    const header = page.getByRole('heading', {
      name: `Is there anything else the delivery partner should know about ${firstName}?`,
    })
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const button = page.getByRole('button', { name: 'Save and Continue' })
    const radios = await RadiosWithFieldSet.create(
      page.locator('[data-testid="additional-information"]'),
      page.locator('[data-testid="additional-information-legend"]'),
    )
    const textArea = page.locator('[data-testid="details"]')
    const errorBanner = page.locator('[data-testid="error-messages"]')
    await expect(header).toBeVisible()
    return new AdditionalInformationForTheDeliveryPartnerPage(
      page,
      header,
      backLink,
      radios,
      textArea,
      button,
      errorBanner,
    )
  }

  async fill(text: string) {
    await this.textArea.fill(text)
  }
}

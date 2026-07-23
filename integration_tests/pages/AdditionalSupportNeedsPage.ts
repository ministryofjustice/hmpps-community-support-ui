import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import CheckBoxWithFieldSet from './components/checkBoxWithFieldSet'

export default class AdditionalSupportNeedsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly subHeader: Locator,
    readonly backLink: Locator,
    readonly checkboxes: CheckBoxWithFieldSet,
    readonly button: Locator,
  ) {
    super(page)
  }

  async select(value: string) {
    await this.checkboxes.select(value)
  }

  async clickSaveAndContinue() {
    await this.button.click()
  }

  static url(): string {
    return `/referral/task-list/additional-support-needs`
  }

  static async verifyOnPage(page: Page, firstName: string, lastName: string): Promise<AdditionalSupportNeedsPage> {
    const header = page.getByRole('heading', { name: `${firstName} ${lastName}` })
    const subHeader = page.getByRole('heading', { name: `What does ${firstName} need support` })
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const button = page.getByRole('button', { name: 'Save and Continue' })
    const checkboxes = await CheckBoxWithFieldSet.create(
      page.locator('[test-id="additional-needs"]'),
      page.locator('[test-id="additional-needs-legend"]'),
    )
    await expect(header).toBeVisible()
    await expect(subHeader).toBeVisible()
    return new AdditionalSupportNeedsPage(page, header, subHeader, backLink, checkboxes, button)
  }
}

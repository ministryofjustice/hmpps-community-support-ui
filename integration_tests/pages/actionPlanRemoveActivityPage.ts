import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanRemoveActivityPage extends AbstractPage {
  readonly header: Locator

  readonly hint: Locator

  readonly yesOption: Locator

  readonly noOption: Locator

  readonly saveAndContinueButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.hint = page.locator('.govuk-fieldset .govuk-hint')
    this.yesOption = page.getByLabel('Yes', { exact: true })
    this.noOption = page.getByLabel('No', { exact: true })
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue', exact: true })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanRemoveActivityPage> {
    const removeActivityPage = new ActionPlanRemoveActivityPage(page)
    await expect(removeActivityPage.header).toHaveText('Are you sure you want to remove this activity?')
    return removeActivityPage
  }
}

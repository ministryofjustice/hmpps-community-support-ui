import { expect, Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import Input from './components/input'

export default class ServiceDaysPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly daysInput: Input

  readonly saveAndContinueButton: Locator

  readonly errorMessages: Locator

  private constructor(page: Page) {
    super(page)
    this.daysInput = Input.createFromTestDataId(page, 'service-days-input')
    this.header = page.getByRole('heading', { name: 'How many days will you use for this service?' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' })
    this.errorMessages = page.locator('[data-testid="error-messages"]')
  }

  static url(): string {
    return '/referral/task-list/service-days'
  }

  static async verifyOnPage(page: Page): Promise<ServiceDaysPage> {
    const serviceDaysPage = new ServiceDaysPage(page)
    await expect(serviceDaysPage.header).toBeVisible()
    return serviceDaysPage
  }

  async goto() {
    await this.page.goto(ServiceDaysPage.url())
  }

  async clickBackLink() {
    await this.backLink.click()
  }

  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click()
  }

  async fillServiceDays(value: string) {
    await this.daysInput.input.fill(value)
  }
}

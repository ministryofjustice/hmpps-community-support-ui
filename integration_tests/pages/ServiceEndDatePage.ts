import { expect, Locator, type Page } from '@playwright/test'
import { addMonths } from 'date-fns'
import AbstractPage from './abstractPage'

export default class ServiceEndDatePage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly dayInput: Locator

  readonly monthInput: Locator

  readonly yearInput: Locator

  readonly reasonInput: Locator

  readonly saveAndContinueButton: Locator

  readonly errorMessages: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'What date does the service need to be completed by?' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.dayInput = page.getByLabel('Day')
    this.monthInput = page.getByLabel('Month')
    this.yearInput = page.getByLabel('Year')
    this.reasonInput = page.getByLabel('Why does it need to be completed by this date?')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' })
    this.errorMessages = page.locator('[data-testid="error-messages"]')
  }

  static url(): string {
    return '/referral/task-list/service-end-date'
  }

  static async verifyOnPage(page: Page): Promise<ServiceEndDatePage> {
    const serviceEndDatePage = new ServiceEndDatePage(page)
    await expect(serviceEndDatePage.header).toBeVisible()
    return serviceEndDatePage
  }

  async goto() {
    await this.page.goto(ServiceEndDatePage.url())
  }

  async clickBackLink() {
    await this.backLink.click()
  }

  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click()
  }

  async fillReason(value: string) {
    await this.reasonInput.fill(value)
  }

  async fillTargetCompletionDate(date: Date) {
    await this.dayInput.fill(String(date.getDate()))
    // we add one because getMonth returns a zero-based month index (0 for January, 1 for February, etc.)
    await this.monthInput.fill(String(date.getMonth() + 1))
    await this.yearInput.fill(String(date.getFullYear()))
  }

  async fillTargetCompletionDateSixMonthsFromToday() {
    await this.fillTargetCompletionDate(addMonths(new Date(), 6))
  }
}

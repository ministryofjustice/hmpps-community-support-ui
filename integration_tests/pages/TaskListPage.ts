import { Page, expect, Locator } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class TaskListPage extends AbstractPage {
  readonly header: Locator

  readonly subHeader: Locator

  readonly backLink: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1.govuk-heading-xl')
    this.subHeader = page.locator('h2.govuk-heading-l', { hasText: 'Make a referral' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
  }

  static url(referralId: string): string {
    return `/referral/task-list/${referralId}`
  }

  get personalDetailsSection() {
    return this.page.getByRole('heading', { name: 'Personal details' }).locator('..')
  }

  get referralInformationSection() {
    return this.page.getByRole('heading', { name: 'Referral information' }).locator('..')
  }

  get contactDetailsSection() {
    return this.page.getByRole('heading', { name: 'Referral contact details' }).locator('..')
  }

  get checkAnswersSection() {
    return this.page.getByRole('heading', { name: 'Check answers and submit' }).locator('..')
  }

  async goto(referralId: string) {
    await this.page.goto(`/referral/${referralId}/task-list`)
  }

  async clickPersonalDetailsTask() {
    await this.personalDetailsSection.getByRole('link', { name: 'Confirm personal details' }).click()
  }

  async clickRiskInformationTask() {
    await this.referralInformationSection.getByRole('link', { name: 'Check risk information' }).click()
  }

  async clickCheckAnswers() {
    await this.checkAnswersSection.getByRole('link', { name: 'Check answers and submit' }).click()
  }

  static async verifyOnPage(page: Page): Promise<TaskListPage> {
    const taskListPage = new TaskListPage(page)
    await expect(taskListPage.header).toBeVisible()
    await expect(taskListPage.subHeader).toBeVisible()
    await expect(taskListPage.personalDetailsSection).toBeVisible()
    await expect(taskListPage.referralInformationSection).toBeVisible()
    await expect(taskListPage.contactDetailsSection).toBeVisible()
    await expect(taskListPage.checkAnswersSection).toBeVisible()

    return taskListPage
  }

  async verifyTaskStatus(sectionHeading: string, taskName: string, expectedStatus: string) {
    const section = this.page.locator('h3', { hasText: sectionHeading }).locator('..')

    const statusLocator = section
      .locator('.govuk-task-list__item')
      .filter({ has: this.page.locator(`a:has-text("${taskName}")`) })
      .locator('.govuk-task-list__status')

    await expect(statusLocator).toContainText(expectedStatus)
  }

  async verifyCheckAnswersLink(referralId: string) {
    const link = this.checkAnswersSection.getByRole('link', { name: 'Check answers and submit' })
    await expect(link).toHaveAttribute('href', new RegExp(referralId))
  }
}

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

  static url(): string {
    return `/referral/task-list`
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

  get confirmPersonalDetailsTask() {
    return this.personalDetailsSection.getByRole('link', { name: 'Confirm personal details' })
  }

  get checkRiskInformationTask() {
    return this.referralInformationSection.getByRole('link', { name: 'Check risk information' })
  }

  get selectPersonNeedsTask() {
    return this.referralInformationSection.getByRole('link', { name: `Select the person's needs` })
  }

  get addSupportNeedsTask() {
    return this.referralInformationSection.getByRole('link', { name: 'Add details of any additional support needs' })
  }

  get additionalReferralInformationTask() {
    return this.referralInformationSection.getByRole('link', { name: 'Additional referral information' })
  }

  get addContactDetailsTask() {
    return this.contactDetailsSection.getByRole('link', { name: 'Add details of main point of contact' })
  }

  get checkAnswersTask() {
    return this.checkAnswersSection.getByRole('link', { name: 'Check answers and submit' })
  }

  async clickPersonalDetailsTask() {
    await this.confirmPersonalDetailsTask.click()
  }

  async clickCheckRiskInformationTask() {
    await this.checkRiskInformationTask.click()
  }

  async clickSelectPersonNeedsTask() {
    await this.selectPersonNeedsTask.click()
  }

  async clickAddSupportNeedsTask() {
    await this.addSupportNeedsTask.click()
  }

  async clickAdditionalReferralInformationTask() {
    await this.additionalReferralInformationTask.click()
  }

  async clickConfirmPersonalDetailsTask() {
    await this.confirmPersonalDetailsTask.click()
  }

  async clickCheckAnswersTask() {
    await this.checkAnswersTask.click()
  }

  async goto() {
    await this.page.goto(TaskListPage.url())
  }

  static async verifyOnPage(page: Page): Promise<TaskListPage> {
    const taskListPage = new TaskListPage(page)
    await expect(taskListPage.header).toBeVisible()
    await expect(taskListPage.subHeader).toBeVisible()
    await expect(taskListPage.personalDetailsSection).toBeVisible()
    await expect(taskListPage.confirmPersonalDetailsTask).toBeVisible()
    await expect(taskListPage.referralInformationSection).toBeVisible()
    await expect(taskListPage.checkRiskInformationTask).toBeVisible()
    await expect(taskListPage.selectPersonNeedsTask).toBeVisible()
    await expect(taskListPage.addSupportNeedsTask).toBeVisible()
    await expect(taskListPage.additionalReferralInformationTask).toBeVisible()
    await expect(taskListPage.contactDetailsSection).toBeVisible()
    await expect(taskListPage.addContactDetailsTask).toBeVisible()
    await expect(taskListPage.checkAnswersSection).toBeVisible()
    await expect(taskListPage.checkAnswersTask).toBeVisible()

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
    await expect(this.checkAnswersTask).toHaveAttribute('href', new RegExp(referralId))
  }

  async clickBackLink() {
    await this.backLink.click()
  }
}

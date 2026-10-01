import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanAddActivityPage extends AbstractPage {
  readonly header: Locator

  readonly insetText: Locator

  readonly activityProvider: Locator

  readonly activityDescription: Locator

  readonly saveAndContinueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/activities/add`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.insetText = page.locator('.govuk-inset-text')
    this.activityProvider = page.getByLabel('Who will deliver the activity?')
    this.activityDescription = page.getByLabel('What does the activity involve?')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue', exact: true })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanAddActivityPage> {
    const addActivityPage = new ActionPlanAddActivityPage(page)
    await expect(addActivityPage.header).toHaveText('Add An Activity')
    return addActivityPage
  }
}

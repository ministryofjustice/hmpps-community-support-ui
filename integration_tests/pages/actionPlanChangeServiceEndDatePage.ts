import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanChangeServiceEndDatePage extends AbstractPage {
  readonly header: Locator

  readonly dayInput: Locator

  readonly monthInput: Locator

  readonly yearInput: Locator

  readonly reasonInput: Locator

  readonly continueButton: Locator

  readonly errorMessages: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/update-service-end-date`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Change the service end date' })
    this.dayInput = page.getByLabel('Day')
    this.monthInput = page.getByLabel('Month')
    this.yearInput = page.getByLabel('Year')
    this.reasonInput = page.getByLabel('Why are you changing the service end date?')
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.errorMessages = page.locator('[data-testid="error-messages"]')
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanChangeServiceEndDatePage> {
    const actionPlanChangeServiceEndDatePage = new ActionPlanChangeServiceEndDatePage(page)
    await expect(actionPlanChangeServiceEndDatePage.header).toBeVisible()
    return actionPlanChangeServiceEndDatePage
  }
}

import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanPage> {
    const actionPlanPage = new ActionPlanPage(page)
    await expect(actionPlanPage.header).toBeVisible()
    return actionPlanPage
  }
}

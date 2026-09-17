import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanSessionDeliveryDetailsPage extends AbstractPage {
  readonly header: Locator

  readonly continueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/session-delivery-details`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
  }

  questionByLegend(text: string): Locator {
    return this.page.locator('fieldset', { has: this.page.getByText(text, { exact: true }) })
  }

  questionByLabel(text: string): Locator {
    return this.page.locator('.govuk-form-group', { has: this.page.getByLabel(text, { exact: true }) })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanSessionDeliveryDetailsPage> {
    const sessionDeliveryDetailsPage = new ActionPlanSessionDeliveryDetailsPage(page)
    await expect(sessionDeliveryDetailsPage.header).toBeVisible()
    return sessionDeliveryDetailsPage
  }
}

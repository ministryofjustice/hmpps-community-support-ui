import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanServiceUserInvolvementPage extends AbstractPage {
  readonly header: Locator

  readonly continueButton: Locator

  readonly yesRadio: Locator

  readonly noRadio: Locator

  readonly whyNotInvolvedTextBox: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/person-involvement`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.yesRadio = page.getByRole('radio', { name: 'Yes', exact: true })
    this.noRadio = page.getByRole('radio', { name: 'No', exact: true })
    this.whyNotInvolvedTextBox = page.locator('#WHY_NOT_INVOLVED')
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanServiceUserInvolvementPage> {
    const serviceUserInvolvementPage = new ActionPlanServiceUserInvolvementPage(page)
    await expect(serviceUserInvolvementPage.header).toBeVisible()
    return serviceUserInvolvementPage
  }
}

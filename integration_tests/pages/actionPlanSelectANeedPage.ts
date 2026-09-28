import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'

export default class ActionPlanSelectANeedPage extends AbstractPage {
  readonly header: Locator

  readonly continueButton: Locator

  readonly needs: RadiosWithFieldSet

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/select-a-need`
  }

  private constructor(page: Page, needs: RadiosWithFieldSet) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true })
    this.needs = needs
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanSelectANeedPage> {
    const needs = await RadiosWithFieldSet.create(page.locator('.govuk-radios'), page.locator('fieldset'))
    const selectANeedPage = new ActionPlanSelectANeedPage(page, needs)
    await expect(selectANeedPage.header).toHaveText('Area of Need')
    return selectANeedPage
  }
}

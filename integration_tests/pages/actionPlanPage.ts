import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ReferralNavigation from './components/referralNavigation'

export default class ActionPlanPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly submitActionPlanButton: Locator

  readonly navigation: ReferralNavigation

  readonly sidebarColumn: Locator

  readonly mainContentColumn: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.submitActionPlanButton = page.getByRole('button', { name: 'Submit Action plan' })
    this.navigation = new ReferralNavigation(page)
    this.sidebarColumn = page.locator('.govuk-grid-row > div').filter({ has: page.locator('.moj-side-navigation') })
    this.mainContentColumn = page.locator('.govuk-grid-row > div').filter({
      has: page.locator('.actionplan-summary, form'),
    })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanPage> {
    const actionPlanPage = new ActionPlanPage(page)
    await expect(actionPlanPage.header).toBeVisible()
    return actionPlanPage
  }
}

import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanViewActivitiesPage extends AbstractPage {
  readonly header: Locator

  readonly addAnotherActivityRadios: Locator

  readonly saveAndContinueButton: Locator

  readonly activitiesTable: Locator

  readonly activityRows: Locator

  readonly removeLinks: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/activities`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.addAnotherActivityRadios = page.locator('.govuk-radios')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue', exact: true })
    this.activitiesTable = page.getByTestId('action-plan-activities-table')
    this.activityRows = this.activitiesTable.locator('tbody tr')
    this.removeLinks = this.activitiesTable.getByRole('link', { name: 'Remove', exact: true })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanViewActivitiesPage> {
    const viewActivitiesPage = new ActionPlanViewActivitiesPage(page)
    await expect(viewActivitiesPage.header).toHaveText('Activities')
    return viewActivitiesPage
  }
}

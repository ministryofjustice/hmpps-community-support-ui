import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class IcsFeedbackIssuesOrConcernsPage extends AbstractPage {
  readonly header: Locator

  readonly issuesOrConcernsInput: Locator

  readonly notifyProbationPractitionerYes: Locator

  readonly notifyProbationPractitionerNo: Locator

  readonly continueButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Issues or concerns', exact: true })
    this.issuesOrConcernsInput = page.locator('textarea[name="issuesOrConcerns"]')
    this.notifyProbationPractitionerYes = page.getByRole('radio', { name: 'Yes', exact: true })
    this.notifyProbationPractitionerNo = page.getByRole('radio', { name: 'No', exact: true })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
  }

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/issues-or-concerns`
  }

  static async verifyOnPage(page: Page): Promise<IcsFeedbackIssuesOrConcernsPage> {
    const issuesOrConcernsPage = new IcsFeedbackIssuesOrConcernsPage(page)
    await expect(issuesOrConcernsPage.header).toBeVisible()
    await expect(issuesOrConcernsPage.issuesOrConcernsInput).toBeVisible()
    await expect(issuesOrConcernsPage.notifyProbationPractitionerYes).toBeVisible()
    await expect(issuesOrConcernsPage.notifyProbationPractitionerNo).toBeVisible()
    await expect(issuesOrConcernsPage.continueButton).toBeVisible()
    return issuesOrConcernsPage
  }
}

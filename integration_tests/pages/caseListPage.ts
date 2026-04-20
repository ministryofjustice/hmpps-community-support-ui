import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class CaseListPage extends AbstractPage {
  readonly header: Locator

  readonly pagination: Locator

  readonly caseListTable: Locator

  readonly noCasesMessage: Locator

  readonly noCasesTitle: Locator

  readonly subNavTitle: Locator

  static url(screen: 'unassigned' | 'in-progress'): string {
    // Don't like that there's a shared POM between two URLs, but shrug
    switch (screen) {
      case 'unassigned':
        return '/unassigned-cases'
      case 'in-progress':
        return '/cases-in-progress'
      default:
        return ''
    }
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Cases' })
    this.pagination = page.locator('.govuk-pagination')
    this.caseListTable = page.locator('.govuk-table')
    this.noCasesMessage = page.locator('[data-testid="no-cases-message"]')
    this.noCasesTitle = page.locator('[data-testid="no-cases-title"]')
    this.subNavTitle = page.locator('.govuk-table__caption')
  }

  static async verifyOnPage(page: Page): Promise<CaseListPage> {
    const caseListPage = new CaseListPage(page)
    await expect(caseListPage.header).toBeVisible()
    return caseListPage
  }
}

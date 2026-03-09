import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AssignedPage extends AbstractPage {
  public readonly header: Locator

  public readonly subheader: Locator

  public readonly singleAssignmentMessage: Locator

  public readonly multipleAssignmentsMessage: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h2', { hasText: 'Success' })
    this.subheader = page.locator('h3', { hasText: 'Case assigned' })
    this.singleAssignmentMessage = page
      .locator('[data-testid="success-message"] p')
      .filter({ hasText: 'The case has been assigned to a caseworker' })
    this.multipleAssignmentsMessage = page
      .locator('[data-testid="success-message"] p')
      .filter({ hasText: 'The case has been assigned to caseworkers' })
  }

  static async verifyAssignmentOnPage(page: Page, messageType: string = 'single'): Promise<AssignedPage> {
    const assignedPage = new AssignedPage(page)
    await expect(assignedPage.header).toBeVisible()
    await expect(assignedPage.subheader).toBeVisible()
    if (messageType === 'single') {
      await expect(
        assignedPage.singleAssignmentMessage,
        `Expected ${messageType} assignment message to be visible`,
      ).toBeVisible()
    } else {
      await expect(
        assignedPage.multipleAssignmentsMessage,
        `Expected ${messageType} assignment message to be visible`,
      ).toBeVisible()
    }

    return assignedPage
  }
}

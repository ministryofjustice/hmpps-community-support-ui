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
    this.singleAssignmentMessage = page.locator('p', { hasText: 'The case has been assigned to a caseworker' })
    this.multipleAssignmentsMessage = page.locator('p', { hasText: 'The case has been assigned to caseworkers' })
  }

  static async verifySingleAssignmentOnPage(page: Page): Promise<AssignedPage> {
    const assignedPage = new AssignedPage(page)
    await expect(assignedPage.header).toBeVisible()
    await expect(assignedPage.subheader).toBeVisible()
    await expect(assignedPage.singleAssignmentMessage).toBeVisible()
    return assignedPage
  }

  static async verifyMultipleAssignmentOnPage(page: Page): Promise<AssignedPage> {
    const assignedPage = new AssignedPage(page)
    await expect(assignedPage.header).toBeVisible()
    await expect(assignedPage.subheader).toBeVisible()
    await expect(assignedPage.multipleAssignmentsMessage).toBeVisible()
    return assignedPage
  }
}

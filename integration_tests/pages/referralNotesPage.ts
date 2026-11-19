import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralNotesPage extends AbstractPage {
  readonly header: Locator

  readonly addNoteButton: Locator

  readonly notesTable: Locator

  readonly noNotesMessage: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/notes`
  }

  constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.addNoteButton = page.getByTestId('add-note-button')
    this.notesTable = page.getByTestId('referral-notes-table')
    this.noNotesMessage = page.getByTestId('no-notes-message')
  }

  async verifyOnPage(): Promise<void> {
    await expect(this.header).toBeVisible()
    await expect(this.addNoteButton).toBeVisible()
    await expect(this.notesTable.or(this.noNotesMessage)).toBeVisible()
  }
}

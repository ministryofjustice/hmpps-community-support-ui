import AbstractPage from './abstractPage'
import { expect, Locator, Page } from '@playwright/test'

export default class ReferralCaseNoteDetailsPage extends AbstractPage {
  readonly header: Locator

  readonly titleInput: Locator

  readonly detailsInput: Locator

  readonly shouldNotifyRadio: Locator

  readonly continueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/notes/case-note-details`
  }

  constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: `Details of the case note`, exact: true })
    this.titleInput = page.getByLabel('Case note title', { exact: true })
    this.detailsInput = page.getByLabel('Case note details', { exact: true })
    this.shouldNotifyRadio = page.locator('[data-testid="shouldNotifyRadio"]')
    this.continueButton = page.getByRole('button', { name: `Continue`, exact: true })
  }

  async verifyOnPage(): Promise<void> {
    await expect(this.header).toBeVisible()
    await expect(this.titleInput).toBeVisible()
    await expect(this.detailsInput).toBeVisible()
    await expect(this.shouldNotifyRadio).toBeVisible()
    await expect(this.continueButton).toBeVisible()
  }

  async shouldNotify(yes: boolean = true): Promise<void> {
    await this.shouldNotifyRadio.getByRole('radio', { name: yes ? 'Yes' : 'No' }).check()
  }

  async continue(): Promise<void> {
    await this.continueButton.click()
  }
}

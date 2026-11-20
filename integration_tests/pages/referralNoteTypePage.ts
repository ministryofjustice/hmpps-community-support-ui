import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralNoteTypePage extends AbstractPage {
  readonly header: Locator

  readonly caseNoteRadio: Locator

  readonly nonContactActivityRadio: Locator

  readonly continueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/notes/type`
  }

  constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Note type', exact: true })
    this.caseNoteRadio = page.getByLabel('Case note', { exact: true })
    this.nonContactActivityRadio = page.getByLabel('Non-contact activity note', { exact: true })
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true })
  }

  async verifyOnPage(): Promise<void> {
    await expect(this.header).toBeVisible()
    await expect(this.caseNoteRadio).toBeVisible()
    await expect(this.nonContactActivityRadio).toBeVisible()
  }

  async selectCaseNote(): Promise<void> {
    await this.caseNoteRadio.check()
  }

  async continue(): Promise<void> {
    await this.continueButton.click()
  }
}

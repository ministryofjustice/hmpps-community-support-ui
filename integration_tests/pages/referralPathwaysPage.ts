import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralPathwaysPage extends AbstractPage {
  readonly caseNoteHeader: Locator

  readonly nonContactSessionHeader: Locator

  readonly orDivider: Locator

  readonly noPathwayOption: Locator

  readonly continueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/notes/pathways`
  }

  constructor(page: Page) {
    super(page)
    this.caseNoteHeader = page.getByRole('heading', { name: 'What pathway does this note relate to?', exact: true })
    this.nonContactSessionHeader = page.getByRole('heading', {
      name: 'What pathway does this non-contact activity note relate to?',
      exact: true,
    })
    this.orDivider = page.locator('.govuk-checkboxes__divider', { hasText: 'or' })
    this.noPathwayOption = page.getByLabel('It does not relate to a pathway option', { exact: true })
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true })
  }

  pathwayCheckbox(name: string): Locator {
    return this.page.getByLabel(name, { exact: true })
  }

  async verifyCaseNoteOnPage(): Promise<void> {
    await this.verifyCommonElements(this.caseNoteHeader)
    await expect(this.orDivider).toBeVisible()
    await expect(this.noPathwayOption).toBeVisible()
  }

  async verifyNonContactSessionOnPage(): Promise<void> {
    await this.verifyCommonElements(this.nonContactSessionHeader)
    await expect(this.orDivider).toHaveCount(0)
    await expect(this.noPathwayOption).toHaveCount(0)
  }

  private async verifyCommonElements(header: Locator): Promise<void> {
    await expect(header).toBeVisible()
    await expect(this.continueButton).toBeVisible()
  }
}

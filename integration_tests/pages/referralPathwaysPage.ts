import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralPathwaysPage extends AbstractPage {
  readonly header: Locator

  readonly orDivider: Locator

  readonly noPathwayOption: Locator

  readonly continueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/notes/pathways`
  }

  constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'What pathway does this note relate to?' })
    this.orDivider = page.locator('.govuk-checkboxes__divider', { hasText: 'or' })
    this.noPathwayOption = page.getByLabel('It does not relate to a pathway option', { exact: true })
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true })
  }

  pathwayCheckbox(name: string): Locator {
    return this.page.getByLabel(name, { exact: true })
  }

  async verifyOnPage(): Promise<void> {
    await expect(this.header).toBeVisible()
    await expect(this.orDivider).toBeVisible()
    await expect(this.noPathwayOption).toBeVisible()
    await expect(this.continueButton).toBeVisible()
  }
}

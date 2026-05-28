import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ErrorSummary from './components/errorSummary'
import RadiosWithFieldSet from './components/radiosWithFieldSet'
import TextArea from './components/textArea'

export default class ChangeIcsDetailsReasonPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly errorSummary: ErrorSummary,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly whoRequestedRadios: RadiosWithFieldSet,
    readonly reasonTextarea: TextArea,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  static url(caseRefId: string): string {
    return `/referral/${caseRefId}/ics-change-details/reason`
  }

  static async verifyOnPage(page: Page): Promise<ChangeIcsDetailsReasonPage> {
    const header = page.locator('h1', { hasText: 'Reason for changing the session details' })
    await expect(header).toBeVisible()
    const errorSummary = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const whoRequestedRadios = await RadiosWithFieldSet.create(
      page.locator('[data-testid="requestedBy"]'),
      page.locator('[data-testid="fieldset-requestedBy"]'),
    )
    const reasonTextarea = await TextArea.create(page.locator('[data-testid="reasonForChange"]'))
    const submit = page.getByRole('button', { name: 'Save and continue', exact: true })
    return new ChangeIcsDetailsReasonPage(
      page,
      errorSummary,
      header,
      backLink,
      whoRequestedRadios,
      reasonTextarea,
      submit,
    )
  }
}

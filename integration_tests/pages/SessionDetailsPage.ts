import { expect, Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ErrorSummary from './components/errorSummary'
import SummaryList from './components/summaryList'
import RadiosWithFieldSet from './components/radiosWithFieldSet'
import TimeInput from './components/timeInput'
import TextArea from './components/textArea'

export default class SessionDetailsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly errorSummary: ErrorSummary,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly summary: SummaryList,
    readonly wasPersonLateRadios: RadiosWithFieldSet,
    readonly lateReason: TextArea,
    readonly duration: TimeInput,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/session-details`
  }

  static async verifyOnPage(page: Page): Promise<SessionDetailsPage> {
    const header = page.locator('h1', { hasText: 'Session Details' })
    await expect(header).toBeVisible()
    const errorSummary = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const summary = await SummaryList.create(page.locator('[data-testid="appointment-details"]'))
    const wasPersonLate = await RadiosWithFieldSet.create(
      page.locator('[data-testid="wasPersonLate"]'),
      page.locator('[data-testid="fieldset-wasPersonLate"]'),
    )
    const lateReason = await TextArea.create(page.locator('[data-testid="lateReason"]'))
    const duration = await TimeInput.create(
      page.locator('[data-testid="sessionDuration"]'),
      page.locator('[data-testid="fieldset-sessionDuration"]'),
    )
    const submit = page.getByRole('button', { name: 'Continue', exact: true })

    return new SessionDetailsPage(
      page,
      errorSummary,
      header,
      backLink,
      summary,
      wasPersonLate,
      lateReason,
      duration,
      submit,
    )
  }
}

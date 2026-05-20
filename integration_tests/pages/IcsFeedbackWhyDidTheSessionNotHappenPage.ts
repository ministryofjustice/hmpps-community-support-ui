import AbstractPage from './abstractPage'
import { expect, Locator, Page } from '@playwright/test'
import ErrorSummary from './components/errorSummary'
import RadiosWithFieldSet from './components/radiosWithFieldSet'
import TextArea from './components/textArea'

export default class IcsFeedbackWhyDidTheSessionNotHappenPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly errorSummary: ErrorSummary,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly whyDidSessionNotHappenRadios: RadiosWithFieldSet,
    readonly serviceProviderIssueTextArea: TextArea,
    readonly referralCouldNotTakePartTextArea: TextArea,
    readonly referralDidNotComplyTextArea: TextArea,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/why-did-the-session-not-happen`
  }

  static async verifyOnPage(page: Page): Promise<IcsFeedbackWhyDidTheSessionNotHappenPage> {
    const header = page.locator('h1', { hasText: 'Why did the session not happen?' })
    await expect(header).toBeVisible()
    const errorSummary = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const whyDidSessionNotHappen = await RadiosWithFieldSet.create(
      page.locator('[data-testid="whyDidSessionNotHappen"]'),
      page.locator('[data-testid="fieldset-whyDidSessionNotHappen"]'),
    )
    const serviceProviderIssue = new TextArea(
      page.locator('[data-testid="serviceProviderIssueInput"]'),
      page.locator('[data-testid="serviceProviderIssueHint"]'),
    )
    const referralCouldNotTakePart = new TextArea(
      page.locator('[data-testid="referralCouldNotTakePartInput"]'),
      page.locator('[data-testid="referralCouldNotTakePartHint"]'),
    )
    const referralDidNotComply = new TextArea(
      page.locator('[data-testid="referralDidNotComplyInput"]'),
      page.locator('[data-testid="referralDidNotComplyHint"]'),
    )
    const submit = page.getByRole('button', { name: 'Continue', exact: true })

    return new IcsFeedbackWhyDidTheSessionNotHappenPage(
      page,
      errorSummary,
      header,
      backLink,
      whyDidSessionNotHappen,
      serviceProviderIssue,
      referralCouldNotTakePart,
      referralDidNotComply,
      submit
    )
  }
}

import { Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import TextArea from './components/textArea'
import ErrorSummary from './components/errorSummary'

export default class IcsFeedbackHowTheyTriedToContactThePersionPage extends AbstractPage {
  static url(caseRefId: string) {
    return `/ics-feedback/${caseRefId}/how-they-tried-to-contact-the-person`
  }

  static async create(page: Page): Promise<IcsFeedbackHowTheyTriedToContactThePersionPage> {
    const errors = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const textArea = new TextArea(page.locator('[data-testid="textarea-input"]'))
    const continueButton = page.getByRole('button', { name: 'Continue' })
    return new IcsFeedbackHowTheyTriedToContactThePersionPage(page, errors, backLink, textArea, continueButton)
  }

  private constructor(
    page: Page,
    public readonly errors: ErrorSummary,
    public readonly backLink: Locator,
    public readonly textArea: TextArea,
    public readonly continueButton: Locator,
  ) {
    super(page)
  }

  async clickContinue() {
    await this.continueButton.click()
  }

  async clickBackLink() {
    await this.backLink.click()
  }
}

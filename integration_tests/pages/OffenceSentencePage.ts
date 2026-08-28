import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ErrorSummary from './components/errorSummary'

export default class OffenceSentencePage extends AbstractPage {
  private constructor(
    page: Page,
    readonly errorSummary: ErrorSummary,
    readonly personSummary: Locator,
    readonly crn: Locator,
    readonly dateOfBirth: Locator,
    readonly heading: Locator,
    readonly subHeader: Locator,
    readonly bodyText: Locator,
    readonly backLink: Locator,
    readonly summaryHeading: Locator,
    readonly summaryRows: Locator,
    readonly yesRadio: Locator,
    readonly noRadio: Locator,
    readonly licenceConditionsDetailsTextArea: Locator,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  static url(): string {
    return '/referral/task-list/offence-sentence'
  }

  static async verifyOnPage(page: Page): Promise<OffenceSentencePage> {
    const personSummary = page.locator('[data-qa="person-summary"]')
    const crn = page.locator('[data-qa="crn"]')
    const dateOfBirth = page.locator('[data-qa="date-of-birth"]')
    const heading = page.locator('[data-qa="heading"]')
    const subHeader = page.getByRole('heading', { name: 'Check offence and sentence information', exact: true })
    const bodyText = page.getByText('This is the offence associated with this referral.')
    const errorSummary = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const summaryHeading = page.getByRole('heading', { name: 'Offence and sentence information', exact: true })
    const summaryRows = page.locator('.govuk-summary-list__row')
    const yesRadio = page.locator('input[name="hasLicenceConditionsOrZones"][value="Yes"]')
    const noRadio = page.locator('input[name="hasLicenceConditionsOrZones"][value="No"]')
    const licenceConditionsDetailsTextArea = page.locator('textarea[name="licenceConditionsOrZonesDetails"]')
    const continueButton = page.getByRole('button', { name: 'Save and continue' })

    return new OffenceSentencePage(
      page,
      errorSummary,
      personSummary,
      crn,
      dateOfBirth,
      heading,
      subHeader,
      bodyText,
      backLink,
      summaryHeading,
      summaryRows,
      yesRadio,
      noRadio,
      licenceConditionsDetailsTextArea,
      continueButton,
    )
  }

  async selectYes() {
    await this.yesRadio.check()
  }

  async selectNo() {
    await this.noRadio.check()
  }

  async fillDetails(value: string) {
    await this.licenceConditionsDetailsTextArea.fill(value)
  }

  async clickSaveAndContinue() {
    await this.continueButton.click()
  }

  async clickBackLink() {
    await this.backLink.click()
  }
}

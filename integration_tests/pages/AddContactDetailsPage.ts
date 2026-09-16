import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ErrorSummary from './components/errorSummary'

export default class AddContactDetailsPage extends AbstractPage {
  readonly heading: Locator

  readonly pageCaption: Locator

  readonly subHeading: Locator

  readonly backLink: Locator

  readonly nameInput: Locator

  readonly emailInput: Locator

  readonly jobRoleInput: Locator

  readonly phoneNumberInput: Locator

  readonly teamPhoneNumberInput: Locator

  readonly continueButton: Locator

  private constructor(
    page: Page,
    readonly errorSummary: ErrorSummary,
  ) {
    super(page)
    this.heading = page.locator('h1.govuk-heading-xl')
    this.pageCaption = page.locator('span.govuk-caption-l')
    this.subHeading = page.getByRole('heading', { name: 'Add details of the main point of contact' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.nameInput = page.locator('#name')
    this.emailInput = page.locator('#emailAddress')
    this.jobRoleInput = page.locator('#jobRole')
    this.phoneNumberInput = page.locator('#phoneNumber')
    this.teamPhoneNumberInput = page.locator('#teamPhoneNumber')
    this.continueButton = page.getByRole('button', { name: 'Save and continue' })
  }

  static url(fromPP = false): string {
    return fromPP ? '/referral/new/add-contact-details?fromPP=true' : '/referral/new/add-contact-details'
  }

  static async verifyOnPage(page: Page): Promise<AddContactDetailsPage> {
    const errorSummary = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const addContactDetailsPage = new AddContactDetailsPage(page, errorSummary)
    await expect(addContactDetailsPage.heading).toBeVisible()
    await expect(addContactDetailsPage.subHeading).toBeVisible()
    await expect(addContactDetailsPage.nameInput).toBeVisible()
    await expect(addContactDetailsPage.emailInput).toBeVisible()
    await expect(addContactDetailsPage.continueButton).toBeVisible()
    return addContactDetailsPage
  }

  // The pdu/probationOffice auto completed fall back to select elements which is more reliable for playwright tests
  private async selectHiddenOption(selectId: string, optionLabel: string): Promise<void> {
    await this.page.locator(`#${selectId}-select`).selectOption({ label: optionLabel }, { force: true })
  }

  async selectPdu(name: string): Promise<void> {
    await this.selectHiddenOption('pdu', name)
  }

  async selectProbationOffice(name: string): Promise<void> {
    await this.selectHiddenOption('probationOffice', name)
  }

  async fillForm({
    name,
    emailAddress,
    jobRole,
    phoneNumber,
    teamPhoneNumber,
  }: {
    name?: string
    emailAddress?: string
    jobRole?: string
    phoneNumber?: string
    teamPhoneNumber?: string
  }): Promise<void> {
    if (name !== undefined) await this.nameInput.fill(name)
    if (emailAddress !== undefined) await this.emailInput.fill(emailAddress)
    if (jobRole !== undefined) await this.jobRoleInput.fill(jobRole)
    if (phoneNumber !== undefined) await this.phoneNumberInput.fill(phoneNumber)
    if (teamPhoneNumber !== undefined) await this.teamPhoneNumberInput.fill(teamPhoneNumber)
  }

  async submit(): Promise<void> {
    await this.continueButton.click()
  }
}

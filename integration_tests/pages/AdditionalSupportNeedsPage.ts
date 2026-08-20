import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import CheckBoxWithFieldSet from './components/checkBoxWithFieldSet'

interface TextEntryFields {
  'Physical health': Locator
  'Mental or emotional health': Locator
  Neurodiversity: Locator
  'Location and travel': Locator
  'Caring responsibilities': Locator
  'Employment responsibilities': Locator
  Diversity: Locator
  'Anything else': Locator
}
const textAreasKeys: (keyof TextEntryFields)[] = [
  'Physical health',
  'Mental or emotional health',
  'Neurodiversity',
  'Location and travel',
  'Caring responsibilities',
  'Employment responsibilities',
  'Diversity',
  'Anything else',
] as const

export default class AdditionalSupportNeedsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly subHeader: Locator,
    readonly backLink: Locator,
    readonly checkboxes: CheckBoxWithFieldSet,
    readonly button: Locator,
    readonly textAreas: TextEntryFields,
    readonly errorSummary: Locator,
  ) {
    super(page)
  }

  async select(value: string) {
    await this.checkboxes.select(value)
  }

  async clickSaveAndContinue() {
    await this.button.click()
  }

  async fill(field: keyof TextEntryFields, value: string) {
    await this.textAreas[field].fill(value)
  }

  static url(): string {
    return `/referral/task-list/additional-support-needs`
  }

  static async verifyOnPage(page: Page, firstName: string, lastName: string): Promise<AdditionalSupportNeedsPage> {
    const header = page.getByRole('heading', { name: `${firstName} ${lastName}` })
    const subHeader = page.getByRole('heading', { name: `What does ${firstName} need support` })
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const button = page.getByRole('button', { name: 'Save and Continue' })
    const checkboxes = await CheckBoxWithFieldSet.create(
      page.locator('[data-testid="additional-needs"]'),
      page.locator('[data-testid="additional-needs-legend"]'),
    )
    const textAreas = Object.fromEntries(
      textAreasKeys.map(id => [id, page.locator(`[data-testid="${id}"]`)]),
    ) as unknown as TextEntryFields
    const errorSummary = page.locator('[data-testid="error-messages"]')
    await expect(header).toBeVisible()
    await expect(subHeader).toBeVisible()
    return new AdditionalSupportNeedsPage(
      page,
      header,
      subHeader,
      backLink,
      checkboxes,
      button,
      textAreas,
      errorSummary,
    )
  }
}

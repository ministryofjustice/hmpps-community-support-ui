import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class EditRiskSummaryPage extends AbstractPage {
  readonly heading: Locator

  readonly subHeading: Locator

  readonly lastUpdated: Locator

  readonly saveAndContinueButton: Locator

  readonly backLink: Locator

  readonly whoIsAtRisk: Locator

  readonly natureOfRisk: Locator

  readonly riskImminence: Locator

  readonly selfHarm: Locator

  readonly suicide: Locator

  readonly hostelSetting: Locator

  readonly vulnerability: Locator

  readonly additionalInformation: Locator

  readonly selfHarmIndicator: Locator

  readonly suicideIndicator: Locator

  readonly hostelSettingIndicator: Locator

  readonly vulnerabilityIndicator: Locator

  private constructor(page: Page) {
    super(page)
    this.heading = page.getByTestId('heading')
    this.subHeading = page.locator('h2', { hasText: 'Edit OASys risk information' })
    this.lastUpdated = page.getByTestId('last-updated')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.whoIsAtRisk = page.locator('#riskSummaryWhoIsAtRisk')
    this.natureOfRisk = page.locator('#riskSummaryNatureOfRisk')
    this.riskImminence = page.locator('#riskSummaryRiskImminence')
    this.selfHarm = page.locator('#riskToSelfSelfHarm')
    this.suicide = page.locator('#riskToSelfSuicide')
    this.hostelSetting = page.locator('#riskToSelfHostelSetting')
    this.vulnerability = page.locator('#riskToSelfVulnerability')
    this.additionalInformation = page.locator('#additionalInformation')
    this.selfHarmIndicator = page.locator('#riskToSelfSelfHarm-hint')
    this.suicideIndicator = page.locator('#riskToSelfSuicide-hint')
    this.hostelSettingIndicator = page.locator('#riskToSelfHostelSetting-hint')
    this.vulnerabilityIndicator = page.locator('#riskToSelfVulnerability-hint')
  }

  static url(): string {
    return `/referral/task-list/edit-risk-summary`
  }

  static async verifyOnPage(page: Page): Promise<EditRiskSummaryPage> {
    const editRiskSummaryPage = new EditRiskSummaryPage(page)
    await expect(editRiskSummaryPage.heading).toBeVisible()
    await expect(editRiskSummaryPage.subHeading).toBeVisible()
    return editRiskSummaryPage
  }
}

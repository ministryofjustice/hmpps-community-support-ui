import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class ReferralDetailsPage extends AbstractPage {
  private readonly successHeader: Locator

  private readonly singleAssignmentMessage: Locator

  private readonly multipleAssignmentsMessage: Locator

  private constructor(
    page: Page,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly personalDetailsSummary: SummaryList,
    readonly equalityMonitoringSummary: SummaryList,
    readonly contactDetailsSummary: SummaryList,
    readonly referralDetailsSummary: SummaryList,
  ) {
    super(page)
    this.successHeader = page.locator('h3', { hasText: 'Case assigned' })
    this.singleAssignmentMessage = page
      .locator('[data-testid="success-message"] p')
      .filter({ hasText: 'The case has been assigned to a caseworker' })
    this.multipleAssignmentsMessage = page
      .locator('[data-testid="success-message"] p')
      .filter({ hasText: 'The case has been assigned to caseworkers' })
  }

  static async verifyOnPage(page: Page): Promise<ReferralDetailsPage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const equalityMonitoringSummary = await SummaryList.create(page.locator('[data-testid="equality-details"]'))
    const contactDetailsSummary = await SummaryList.create(page.locator('[data-testid="contact-details"]'))
    const referralDetailsSummary = await SummaryList.create(page.locator('[data-testid="referral-details"]'))
    const referralDetailsPage = new ReferralDetailsPage(
      page,
      header,
      backLink,
      personalDetailsSummary,
      equalityMonitoringSummary,
      contactDetailsSummary,
      referralDetailsSummary,
    )
    return referralDetailsPage
  }

  static async verifyAssignmentOnPage(page: Page, messageType: string = 'single'): Promise<ReferralDetailsPage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const personalDetailsSummary = await SummaryList.create(page.locator('[data-testid="personal-details"]'))
    const equalityMonitoringSummary = await SummaryList.create(page.locator('[data-testid="equality-details"]'))
    const contactDetailsSummary = await SummaryList.create(page.locator('[data-testid="contact-details"]'))
    const referralDetailsSummary = await SummaryList.create(page.locator('[data-testid="referral-details"]'))
    const assignedPage = new ReferralDetailsPage(
      page,
      header,
      backLink,
      personalDetailsSummary,
      equalityMonitoringSummary,
      contactDetailsSummary,
      referralDetailsSummary,
    )
    await expect(assignedPage.successHeader).toBeVisible()
    if (messageType === 'single') {
      await expect(
        assignedPage.singleAssignmentMessage,
        `Expected ${messageType} assignment message to be visible`,
      ).toBeVisible()
    } else {
      await expect(
        assignedPage.multipleAssignmentsMessage,
        `Expected ${messageType} assignment message to be visible`,
      ).toBeVisible()
    }

    return assignedPage
  }
}

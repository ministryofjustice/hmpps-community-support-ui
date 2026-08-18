import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ConfirmAnAreaForReferralPage extends AbstractPage {
  readonly heading: Locator

  readonly cardHeading: Locator

  readonly crn: Locator

  readonly dateOfBirth: Locator

  readonly deliveryPartner: Locator

  readonly areaCovered: Locator

  readonly pdus: Locator

  readonly saveAndContinueButton: Locator

  readonly selectDifferentAreaLink: Locator

  private constructor(page: Page) {
    super(page)
    this.heading = page.getByTestId('heading')
    this.cardHeading = page.locator('h1.moj-interruption-card__heading')
    this.crn = page.getByTestId('crn')
    this.dateOfBirth = page.getByTestId('date-of-birth')
    this.deliveryPartner = page.getByTestId('delivery-partner')
    this.areaCovered = page.getByTestId('area-covered')
    this.pdus = page.getByTestId('pdus')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' })
    this.selectDifferentAreaLink = page.getByRole('link', { name: 'Select a different area' })
  }

  static url(providerId: string): string {
    return `/referral/task-list/confirm-an-area-for-referral/${providerId}`
  }

  static async verifyOnPage(page: Page): Promise<ConfirmAnAreaForReferralPage> {
    const confirmAnAreaForReferralPage = new ConfirmAnAreaForReferralPage(page)
    await expect(confirmAnAreaForReferralPage.heading).toBeVisible()
    await expect(confirmAnAreaForReferralPage.cardHeading).toBeVisible()
    return confirmAnAreaForReferralPage
  }
}

import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class CommunityServiceProvidersPage extends AbstractPage {
  readonly header: Locator

  readonly accommodationSupportLink: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Select a Community Service Provider to make a referral' })
    this.accommodationSupportLink = page.getByRole('link', { name: 'Accommodation support' })
  }

  static async verifyOnPage(page: Page): Promise<CommunityServiceProvidersPage> {
    const communityServiceProvidersPage = new CommunityServiceProvidersPage(page)
    await expect(communityServiceProvidersPage.header).toBeVisible()
    await expect(communityServiceProvidersPage.accommodationSupportLink).toBeVisible()
    return communityServiceProvidersPage
  }
}

import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

interface FindPersonContent {
  pageTitle: string
  pageHeader: string
  errorMessages: {
    nothingEntered: string
    incorrectFormat: string
    noRecord: string
  }
}

const pageContent: FindPersonContent = {
  pageTitle: 'Community Support - Find a Person',
  pageHeader: 'Find a Person',
  errorMessages: {
    nothingEntered: 'Enter a CRN or prison number',
    incorrectFormat:
      'Enter a CRN or prison number in the correct format, like X123456 for a CRN or D0168GH for a prison number',
    noRecord: 'No person with that CRN or prison number found',
  },
} as const

export default class FindPersonPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly identifierLabel: Locator

  readonly identifierInput: Locator

  readonly continueButton: Locator

  readonly submitButton: Locator

  readonly personIdentifierErrorMessage: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Find a Person' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.identifierLabel = page.locator('label[for="personIdentifier"]')
    this.identifierInput = page.locator('#personIdentifier')
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.submitButton = page.locator('button[type="submit"]')
    this.personIdentifierErrorMessage = page.locator('#personIdentifier-error')
  }

  static async verifyOnPage(page: Page): Promise<FindPersonPage> {
    const findPersonPage = new FindPersonPage(page)
    await expect(findPersonPage.header).toBeVisible()
    await expect(findPersonPage.backLink).toBeVisible()
    await expect(findPersonPage.identifierLabel).toBeVisible()
    await expect(findPersonPage.identifierInput).toBeVisible()
    await expect(findPersonPage.continueButton).toBeVisible()
    return findPersonPage
  }

  static url(): string {
    return '/referral/new/find-a-person'
  }

  // example usage findPersonPage.content().pageTitle
  static content(): FindPersonContent {
    return pageContent
  }
}

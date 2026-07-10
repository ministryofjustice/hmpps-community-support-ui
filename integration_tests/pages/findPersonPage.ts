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
  pageTitle: 'my page title',
  pageHeader: 'find person page header',
  errorMessages: {
    nothingEntered: 'nothing entered errror',
    incorrectFormat: 'incorrect format error',
    noRecord: 'no record ',
  },
} as const

export default class FindPersonPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly identifierInput: Locator

  readonly submitButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Find a Person' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.identifierInput = page.locator('#personIdentifier')
    this.submitButton = page.locator('button[type="submit"]')
  }

  static async verifyOnPage(page: Page): Promise<FindPersonPage> {
    const findPersonPage = new FindPersonPage(page)
    await expect(findPersonPage.header).toBeVisible()
    await expect(findPersonPage.backLink).toBeVisible()
    await expect(findPersonPage.identifierInput).toBeVisible()
    await expect(findPersonPage.submitButton).toBeVisible()
    return findPersonPage
  }

  // example usage findPersonPage.content().pageTitle
  static content(): FindPersonContent {
    return pageContent
  }
}

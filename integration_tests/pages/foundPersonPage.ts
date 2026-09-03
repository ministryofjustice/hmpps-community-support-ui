import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

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

  readonly continueButton: Locator

  readonly submitButton: Locator

  readonly personIdentifierErrorMessage: Locator

  readonly enterDifferentIdentifierLink: Locator

  private constructor(
    page: Page,
    readonly personSummary: SummaryList,
    readonly equalityMonitoring: SummaryList,
    readonly additionalInformation: SummaryList,
    readonly contactDetails: SummaryList,
  ) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Confirm this is the correct person for referral' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.personSummary = personSummary
    this.equalityMonitoring = equalityMonitoring
    this.additionalInformation = additionalInformation
    this.contactDetails = contactDetails
    this.enterDifferentIdentifierLink = page.getByRole('link', {
      name: 'Enter a different CRN or prison number',
      exact: true,
    })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.submitButton = page.locator('button[type="submit"]')
    this.personIdentifierErrorMessage = page.locator('#personIdentifier-error')
  }

  static async verifyOnPage(page: Page): Promise<FindPersonPage> {
    const personSummary = await SummaryList.create(page.locator('[data-testid="personsummary"]'))
    const equalityMonitoring = await SummaryList.create(page.locator('[data-testid="equalityMonitoring"]'))
    const additionalInformation = await SummaryList.create(page.locator('[data-testid="additionalInformation"]'))
    const contactDetails = await SummaryList.create(page.locator('[data-testid="contactDetails"]'))
    const findPersonPage = new FindPersonPage(
      page,
      personSummary,
      equalityMonitoring,
      additionalInformation,
      contactDetails,
    )
    await expect(findPersonPage.header).toBeVisible()
    await expect(findPersonPage.backLink).toBeVisible()
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

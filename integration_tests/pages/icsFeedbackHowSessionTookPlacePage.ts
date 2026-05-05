import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class IcsFeedbackHowSessionTookPlacePage extends AbstractPage {
  readonly header: Locator

  readonly sessionLocation: Locator

  readonly errorHeader: Locator

  readonly phoneCallYesRadio: Locator

  readonly phoneCallNoRadio: Locator

  readonly videoCallRadio: Locator

  readonly videoCallReasonInput: Locator

  readonly phoneCallHowRadio: Locator

  readonly phoneCallReasonInput: Locator

  readonly probationOfficeRadio: Locator

  readonly probationDeliveryUnitSelect: Locator

  readonly somewhereElseRadio: Locator

  readonly addressLine1Input: Locator

  readonly addressLine2Input: Locator

  readonly townOrCityInput: Locator

  readonly countyInput: Locator

  readonly postcodeInput: Locator

  readonly continueButton: Locator

  static url(caseRefId: string) {
    return `/ics-feedback/didSessionTookPlace/${caseRefId}`
  }

  static sessionDetailsUrl(caseRefId: string) {
    return `/ics-feedback/${caseRefId}/session-details`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.sessionLocation = page.locator('[data-testid="session-location"]')
    this.errorHeader = page.locator('h2', { hasText: 'There is a problem' })
    this.phoneCallYesRadio = page.locator('input[type="radio"][name="phoneCall"][value="yes"]')
    this.phoneCallNoRadio = page.locator('input[type="radio"][name="phoneCall"][value="no"]')
    this.videoCallRadio = page.locator('input[type="radio"][name="howSessionTookPlace"][value="VIDEO"]')
    this.videoCallReasonInput = page.locator('input[type="text"][name="videoCallReason"]')
    this.phoneCallHowRadio = page.locator('input[type="radio"][name="howSessionTookPlace"][value="PHONE"]')
    this.phoneCallReasonInput = page.locator('input[type="text"][name="phoneCallReason"]')
    this.probationOfficeRadio = page.locator(
      'input[type="radio"][name="howSessionTookPlace"][value="IN_PERSON_PROBATION_OFFICE"]',
    )
    this.probationDeliveryUnitSelect = page.locator('select[name="probationDeliveryUnit"]')
    this.somewhereElseRadio = page.locator(
      'input[type="radio"][name="howSessionTookPlace"][value="IN_PERSON_OTHER_LOCATION"]',
    )
    this.addressLine1Input = page.locator('input[name="addressLine1"]')
    this.addressLine2Input = page.locator('input[name="addressLine2"]')
    this.townOrCityInput = page.locator('input[name="townOrCity"]')
    this.countyInput = page.locator('input[name="county"]')
    this.postcodeInput = page.locator('input[name="postcode"]')
    this.continueButton = page.locator('[data-qa="continue-button"]')
  }

  static async verifyOnPage(page: Page): Promise<IcsFeedbackHowSessionTookPlacePage> {
    const icsFeedbackPage = new IcsFeedbackHowSessionTookPlacePage(page)
    await expect(icsFeedbackPage.header).toBeVisible()
    await expect(icsFeedbackPage.phoneCallYesRadio).toBeVisible()
    await expect(icsFeedbackPage.phoneCallNoRadio).toBeVisible()
    await expect(icsFeedbackPage.continueButton).toBeVisible()
    return icsFeedbackPage
  }

  static async verifyFieldErrorOnPage(
    page: Page,
    fieldName: string,
    expectedErrorMessage: string,
  ): Promise<IcsFeedbackHowSessionTookPlacePage> {
    const icsFeedbackPage = new IcsFeedbackHowSessionTookPlacePage(page)
    await expect(icsFeedbackPage.header).toBeVisible()
    await expect(icsFeedbackPage.errorHeader).toBeVisible()
    const errorLink = page
      .locator(`[data-testid="error-messages"] a[href*="#${fieldName}"]`)
      .filter({ hasText: expectedErrorMessage })
    await expect(errorLink).toBeVisible()
    return icsFeedbackPage
  }
}

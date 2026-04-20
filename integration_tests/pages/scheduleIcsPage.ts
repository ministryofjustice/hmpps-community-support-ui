import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ScheduleIcsPage extends AbstractPage {
  readonly header: Locator

  readonly errorHeader: Locator

  readonly dateInput: Locator

  readonly timeHourInput: Locator

  readonly timeMinuteInput: Locator

  readonly timeMeridiemInput: Locator

  readonly phoneCallRadioButton: Locator

  readonly phoneCallReasonInput: Locator

  readonly videoCallRadioButton: Locator

  readonly videoCallReasonInput: Locator

  readonly inProbationOfficeRadioButton: Locator

  readonly probationOfficeSelect: Locator

  readonly inSomewhereElseRadioButton: Locator

  readonly addressLine1Input: Locator

  readonly addressLine2Input: Locator

  readonly townInput: Locator

  readonly countyInput: Locator

  readonly postcodeInput: Locator

  readonly inPrisonRadioButton: Locator

  readonly prisonListSelect: Locator

  readonly informedByPhoneCheckbox: Locator

  readonly informedByTextMessageCheckbox: Locator

  readonly informedByEmailCheckbox: Locator

  readonly informedByOtherMethodCheckbox: Locator

  readonly saveAndContinueButton: Locator

  readonly informedByOtherMethodInput: Locator

  static url(referralId: string): string {
    return `/referral/${referralId}/appointment/schedule-ics`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Schedule the ICS' })
    this.errorHeader = page.locator('h2', { hasText: 'There is a problem' })
    this.dateInput = page.locator('input[type="text"][name="sessionDate"]')
    this.timeHourInput = page.locator('input[type="text"][name="sessionTime-hour"]')
    this.timeMinuteInput = page.locator('input[type="text"][name="sessionTime-minute"]')
    this.timeMeridiemInput = page.locator('[name="sessionTime-meridiem"]')
    this.phoneCallRadioButton = page.locator('input[type="radio"][value="ByPhone"]')
    this.phoneCallReasonInput = page.locator('input[type="text"][name="ByPhone"]')
    this.videoCallRadioButton = page.locator('input[type="radio"][value="ByVideo"]')
    this.videoCallReasonInput = page.locator('input[type="text"][name="ByVideo"]')
    this.inProbationOfficeRadioButton = page.locator('input[type="radio"][value="InProbationOffice"]')
    this.probationOfficeSelect = page.locator('[name="probationOfficeList"]')
    this.inSomewhereElseRadioButton = page.locator('input[type="radio"][value="InSomewhereElse"]')
    this.addressLine1Input = page.locator('input[type="text"][name="addressLine1"]')
    this.addressLine2Input = page.locator('input[type="text"][name="addressLine2"]')
    this.townInput = page.locator('input[type="text"][name="addressTown"]')
    this.countyInput = page.locator('input[type="text"][name="addressCounty"]')
    this.postcodeInput = page.locator('input[type="text"][name="addressPostcode"]')
    this.inPrisonRadioButton = page.locator('input[type="radio"][value="InPrison"]')
    this.prisonListSelect = page.locator('[name="prisonList"]')
    this.informedByPhoneCheckbox = page.locator('input[type="checkbox"][value="informedByPhone"]')
    this.informedByTextMessageCheckbox = page.locator('input[type="checkbox"][value="informedByTextMessage"]')
    this.informedByEmailCheckbox = page.locator('input[type="checkbox"][value="informedByEmail"]')
    this.informedByOtherMethodCheckbox = page.locator('input[type="checkbox"][value="informedByOtherMethod"]')
    this.informedByOtherMethodInput = page.locator('input[type="text"][name="otherMethodOfContact"]')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and Continue' })
  }

  static async verifyInactionOnPage(page: Page, isPersonInCommunity: boolean = true): Promise<ScheduleIcsPage> {
    const scheduleIcsPage = new ScheduleIcsPage(page)
    await expect(scheduleIcsPage.header).toBeVisible()
    await expect(scheduleIcsPage.saveAndContinueButton).toBeVisible()
    await scheduleIcsPage.phoneCallRadioButton.click()
    await expect(scheduleIcsPage.phoneCallReasonInput).toBeVisible()
    await scheduleIcsPage.videoCallRadioButton.click()
    await expect(scheduleIcsPage.videoCallReasonInput).toBeVisible()
    if (isPersonInCommunity) {
      await scheduleIcsPage.inProbationOfficeRadioButton.click()
      await expect(scheduleIcsPage.probationOfficeSelect).toBeVisible()
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await expect(scheduleIcsPage.addressLine1Input).toBeVisible()
      await expect(scheduleIcsPage.addressLine2Input).toBeVisible()
      await expect(scheduleIcsPage.townInput).toBeVisible()
      await expect(scheduleIcsPage.countyInput).toBeVisible()
      await expect(scheduleIcsPage.postcodeInput).toBeVisible()
      await scheduleIcsPage.informedByPhoneCheckbox.check()
      await scheduleIcsPage.informedByPhoneCheckbox.uncheck()
      await scheduleIcsPage.informedByTextMessageCheckbox.check()
      await scheduleIcsPage.informedByTextMessageCheckbox.uncheck()
      await scheduleIcsPage.informedByEmailCheckbox.check()
      await scheduleIcsPage.informedByEmailCheckbox.uncheck()
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await expect(scheduleIcsPage.informedByOtherMethodInput).toBeVisible()
      await scheduleIcsPage.informedByOtherMethodCheckbox.uncheck()
    } else {
      await scheduleIcsPage.inPrisonRadioButton.click()
      await expect(scheduleIcsPage.prisonListSelect).toBeVisible()
      await scheduleIcsPage.phoneCallRadioButton.click()
      await expect(scheduleIcsPage.phoneCallReasonInput).toBeVisible()
    }
    return scheduleIcsPage
  }

  static async verifyOnPage(page: Page, isPersonInCommunity: boolean = true): Promise<ScheduleIcsPage> {
    const scheduleIcsPage = new ScheduleIcsPage(page)
    await expect(scheduleIcsPage.header).toBeVisible()
    await expect(scheduleIcsPage.saveAndContinueButton).toBeVisible()
    await expect(scheduleIcsPage.phoneCallRadioButton).toBeVisible()
    await expect(scheduleIcsPage.videoCallRadioButton).toBeVisible()
    if (isPersonInCommunity) {
      await expect(scheduleIcsPage.inProbationOfficeRadioButton).toBeVisible()
      await expect(scheduleIcsPage.inSomewhereElseRadioButton).toBeVisible()
      await expect(scheduleIcsPage.informedByPhoneCheckbox).toBeVisible()
      await expect(scheduleIcsPage.informedByTextMessageCheckbox).toBeVisible()
      await expect(scheduleIcsPage.informedByEmailCheckbox).toBeVisible()
      await expect(scheduleIcsPage.informedByOtherMethodCheckbox).toBeVisible()
    } else {
      await expect(scheduleIcsPage.inPrisonRadioButton).toBeVisible()
    }
    return scheduleIcsPage
  }

  static async verifyFieldErrorOnPage(
    page: Page,
    fieldName: string,
    expectedInputErrorMessage: string,
    isPersonInCommunity: boolean = true,
  ): Promise<ScheduleIcsPage> {
    const errorMessageLocator = page
      .locator(`[data-testid="error-messages"] a[href*="#${fieldName}"]`)
      .filter({ hasText: expectedInputErrorMessage })
    const scheduleIcsPage = new ScheduleIcsPage(page)
    await expect(scheduleIcsPage.header).toBeVisible()
    await expect(scheduleIcsPage.errorHeader).toBeVisible()
    await expect(scheduleIcsPage.saveAndContinueButton).toBeVisible()
    await expect(errorMessageLocator).toBeVisible()
    if (isPersonInCommunity) {
      // TBD
    }
    return scheduleIcsPage
  }
}

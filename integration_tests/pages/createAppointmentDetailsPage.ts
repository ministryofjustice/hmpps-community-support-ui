import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export type SessionType = 'CONTACT_SESSION' | 'PRE_RELEASE_SESSION' | 'POST_RELEASE_SESSION' | 'HANDOVER_SESSION'

const headers: Record<SessionType, string> = {
  CONTACT_SESSION: 'Schedule the contact session',
  PRE_RELEASE_SESSION: 'Schedule the pre-release session',
  POST_RELEASE_SESSION: 'Schedule the post-release session',
  HANDOVER_SESSION: 'Schedule the handover session',
}

export default class CreateAppointmentDetailsPage extends AbstractPage {
  readonly header: Locator

  readonly errorHeader: Locator

  readonly backLink: Locator

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

  readonly townInput: Locator

  readonly postcodeInput: Locator

  readonly inPersonRadioButton: Locator

  readonly meetAtTheGateYesRadioButton: Locator

  readonly meetAtTheGateNoRadioButton: Locator

  readonly meetAtTheGateFieldset: Locator

  readonly informedByPhoneCheckbox: Locator

  readonly informedByTextMessageCheckbox: Locator

  readonly informedByEmailCheckbox: Locator

  readonly informedByOtherMethodCheckbox: Locator

  readonly informedByOtherMethodInput: Locator

  readonly saveAndContinueButton: Locator

  static url(referralId: string, session: SessionType): string {
    return `/referral/${referralId}/create-an-appointment/appointment-details?session=${session}`
  }

  private constructor(page: Page, session: SessionType) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: headers[session], exact: true })
    this.errorHeader = page.locator('h2', { hasText: 'There is a problem' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.dateInput = page.locator('input[type="text"][name="sessionDate"]')
    this.timeHourInput = page.locator('input[type="text"][name="sessionTime-hour"]')
    this.timeMinuteInput = page.locator('input[type="text"][name="sessionTime-minute"]')
    this.timeMeridiemInput = page.locator('[name="sessionTime-meridiem"]')
    this.phoneCallRadioButton = page.locator('input[type="radio"][value="ByPhone"]')
    this.phoneCallReasonInput = page.locator('input[type="text"][name="ByPhone"]')
    this.videoCallRadioButton = page.locator('input[type="radio"][value="ByVideo"]')
    this.videoCallReasonInput = page.locator('input[type="text"][name="ByVideo"]')
    this.inProbationOfficeRadioButton = page.locator('input[type="radio"][value="InProbationOffice"]')
    this.probationOfficeSelect = page.locator('#probationOfficeList')
    this.inSomewhereElseRadioButton = page.locator('input[type="radio"][value="InSomewhereElse"]')
    this.addressLine1Input = page.locator('input[type="text"][name="addressLine1"]')
    this.townInput = page.locator('input[type="text"][name="addressTown"]')
    this.postcodeInput = page.locator('input[type="text"][name="addressPostcode"]')
    this.inPersonRadioButton = page.locator('input[type="radio"][value="InPerson"]')
    this.meetAtTheGateFieldset = page.locator('input[type="radio"][name="meetAtTheGate"]')
    this.meetAtTheGateYesRadioButton = page.locator('input[type="radio"][name="meetAtTheGate"][value="yes"]')
    this.meetAtTheGateNoRadioButton = page.locator('input[type="radio"][name="meetAtTheGate"][value="no"]')
    this.informedByPhoneCheckbox = page.locator('input[type="checkbox"][value="informedByPhone"]')
    this.informedByTextMessageCheckbox = page.locator('input[type="checkbox"][value="informedByTextMessage"]')
    this.informedByEmailCheckbox = page.locator('input[type="checkbox"][value="informedByEmail"]')
    this.informedByOtherMethodCheckbox = page.locator('input[type="checkbox"][value="informedByOtherMethod"]')
    this.informedByOtherMethodInput = page.locator('input[type="text"][name="otherMethodOfContact"]')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue', exact: true })
  }

  static async verifyOnPage(page: Page, session: SessionType): Promise<CreateAppointmentDetailsPage> {
    const appointmentPage = new CreateAppointmentDetailsPage(page, session)
    await expect(appointmentPage.header).toBeVisible()
    await expect(appointmentPage.saveAndContinueButton).toBeVisible()
    return appointmentPage
  }

  async fillDateAndTime(date: string, hour: string, minute: string, meridiem: string): Promise<void> {
    await this.dateInput.fill(date)
    await this.timeHourInput.fill(hour)
    await this.timeMinuteInput.fill(minute)
    await this.timeMeridiemInput.selectOption(meridiem)
  }
}

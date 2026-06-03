import { Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'
import Input from './components/input'
import CheckBoxWithFieldSet from './components/checkBoxWithFieldSet'

export default class ChangeIcsDetailsPage extends AbstractPage {
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

  static url(caseRefId: string): string {
    return `/referral/${caseRefId}/ics-change-details`
  }

  static async createModel(page: Page): Promise<ChangeIcsDetailsPage> {
    const howSessionTookPlaceRadios = await RadiosWithFieldSet.create(
      page.locator('[data-testid="sessionTakePlace-radios"]'),
      page.locator('[data-testid="sessionTakePlace-fieldset"]'),
    )
    const whyIsSessionNotInPersonDropDown = Input.createFromTestDataId(page, 'why-is-session-not-in-person')
    const howWasTheyInformedAboutTheSession = await CheckBoxWithFieldSet.create(
      page.locator('[data-testid="informed-radios"]'),
      page.locator('[data-testid="informed-fieldset"]'),
    )

    return new ChangeIcsDetailsPage(
      page,
      howSessionTookPlaceRadios,
      whyIsSessionNotInPersonDropDown,
      howWasTheyInformedAboutTheSession,
    )
  }

  private constructor(
    page: Page,
    readonly howSessionTookPlaceRadios: RadiosWithFieldSet,
    readonly whyIsSessionNotInPersonDropDown: Input,
    readonly howWasTheyInformedAboutTheSession: CheckBoxWithFieldSet, // needs to be a check list
  ) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Change session details' })
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
    this.addressLine2Input = page.locator('input[type="text"][name="addressLine2"]')
    this.townInput = page.locator('input[type="text"][name="addressTown"]')
    this.countyInput = page.locator('input[type="text"][name="addressCounty"]')
    this.postcodeInput = page.locator('input[type="text"][name="addressPostcode"]')
    this.inPrisonRadioButton = page.locator('input[type="radio"][value="InPrison"]')
    this.prisonListSelect = page.locator('#prisonList')
    this.informedByPhoneCheckbox = page.locator('input[type="checkbox"][value="informedByPhone"]')
    this.informedByTextMessageCheckbox = page.locator('input[type="checkbox"][value="informedByTextMessage"]')
    this.informedByEmailCheckbox = page.locator('input[type="checkbox"][value="informedByEmail"]')
    this.informedByOtherMethodCheckbox = page.locator('input[type="checkbox"][value="informedByOtherMethod"]')
    this.informedByOtherMethodInput = page.locator('input[type="text"][name="otherMethodOfContact"]')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and Continue' })
  }
}

import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendInput, GovukFrontendSelect } from '@govuk-frontend'

export interface AddContactDetailsContent {
  buttonText: string
  backLinkText: string
  backLinkHref: string
  heading: string
  pageCaption: string
  subHeading: string
  nameInputLabel: string
  emailAddressInputLabel: string
  jobRoleInputLabel: string
  phoneNumberInputLabel: string
  pduInputLabel: string
  probationOfficeInputLabel: string
  teamPhoneNumberInputLabel: string
  hintText: string
  insetText: string
}

export interface AddContactDetailsViewModel {
  heading: string
  pageCaption: string
  backLinkArgs: GovukFrontendBackLink
  buttonArgs: GovukFrontendButton
  subHeading: string
  nameInputArgs: GovukFrontendInput
  emailInputArgs: GovukFrontendInput
  jobRoleInputArgs: GovukFrontendInput
  phoneNumberInputArgs: GovukFrontendInput
  pduSelectArgs: GovukFrontendSelect
  probationOfficeSelectArgs: GovukFrontendSelect
  teamPhoneNumberInputArgs: GovukFrontendInput
}

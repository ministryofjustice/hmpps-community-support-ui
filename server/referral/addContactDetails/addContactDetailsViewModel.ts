import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendInput, GovukFrontendSelect } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type AddContactDetailsContent = GlobalContent['/referral/new/add-contact-details']

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

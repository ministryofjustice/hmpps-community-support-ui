import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendInput, GovukFrontendSelect } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type AddContactDetailsContent = GlobalContent['referral']['new']['addContactDetails']

export interface AddContactDetailsViewModel {
  pageTitle: string
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

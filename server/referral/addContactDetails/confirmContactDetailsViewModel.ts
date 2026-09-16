import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ConfirmContactDetailsContent = GlobalContent['/referral/new/confirm-contact-details']

export interface ConfirmContactDetailsViewModel {
  heading: string
  pageCaption: string
  backLinkArgs: GovukFrontendBackLink
  buttonArgs: GovukFrontendButton
  subHeading: string
}

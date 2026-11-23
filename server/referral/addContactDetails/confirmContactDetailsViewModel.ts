import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ConfirmContactDetailsContent = GlobalContent['referral']['new']['confirmContactDetails']

export interface ConfirmContactDetailsViewModel {
  pageTitle: string
  heading: string
  pageCaption: string
  backLinkArgs: GovukFrontendBackLink
  buttonArgs: GovukFrontendButton
  subHeading: string
}

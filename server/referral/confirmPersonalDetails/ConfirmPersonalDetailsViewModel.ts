import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendSummaryList,
  GovukFrontendWarningText,
} from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface ConfirmPersonalDetailsViewModel {
  backLink: GovukFrontendBackLink
  heading: string
  subheading: string
  personal: GovukFrontendSummaryList
  equality: GovukFrontendSummaryList
  contact: GovukFrontendSummaryList
  warning: GovukFrontendWarningText
  button: GovukFrontendButton
}

export type ConfirmPersonalDetailsContent = GlobalContent['/referral/task-list/confirm-personal-details']
export type PersonalDetailsCard = ConfirmPersonalDetailsContent['personalDetailsCard']
export type EqualityMonitoringCard = ConfirmPersonalDetailsContent['equalityMonitoringCard']
export type ContactDetailsCard = ConfirmPersonalDetailsContent['contactDetailsCard']

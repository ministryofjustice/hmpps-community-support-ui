import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendSummaryList,
  GovukFrontendWarningText,
} from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface PersonalDetailsCard {
  heading: string
  nameLabel: string
  crnLabel: string
  prisonLabel: string
  dobLabel: string
  languageLabel: string
  circumstancesLabel: string
  disabilitiesLabel: string
}

export interface EqualityMonitoringCard {
  heading: string
  nationalityLabel: string
  ethnicityLabel: string
  religionLabel: string
  sexLabel: string
}

export interface ContactDetailsCard {
  heading: string
  phoneNumberLabel: string
  mobileNumberLabel: string
  emailAddressLabel: string
  mainAddressLabel: string
}

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

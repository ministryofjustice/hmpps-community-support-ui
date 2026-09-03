import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendSummaryList,
} from '@govuk-frontend'

export interface CheckPPDetailsContent {
  heading: string
  pageCaption: string
  subHeading: string
  backLinkText: string
  backLinkHref: string
  buttonText: string
  insetText: string
  nameLabel: string
  emailAddressLabel: string
  jobRoleLabel: string
  pduLabel: string
  probationOfficeLabel: string
  teamPhoneNumberLabel: string
  radioQuestion: string
  radioYes: string
  radioNo: string
}

export interface CheckPPDetailsViewModel {
  heading: string
  pageCaption: string
  subHeading: string
  backLinkArgs: GovukFrontendBackLink
  buttonArgs: GovukFrontendButton
  insetText: string
  summaryListArgs: GovukFrontendSummaryList
  radioArgs: GovukFrontendRadios
}

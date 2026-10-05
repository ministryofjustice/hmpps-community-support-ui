import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type CheckReferralInformationViewModel = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  personalDetailsHeader: string
  additionalSupportNeedsSummary: GovukFrontendSummaryList
  additionalReferralInformationSummary: GovukFrontendSummaryList
  personsNeedsSummary: GovukFrontendSummaryList
  riskInformationHeader: string
  contactDetailsSummary: GovukFrontendSummaryList
  additionalInformationSummary?: GovukFrontendSummaryList
  riskInformationSummary: GovukFrontendSummaryList
  referralDetailsHeader: string
  referralDetailsSummary: GovukFrontendSummaryList
  referralContactDetailsHeader: string
  submitButton: GovukFrontendButton
  backLink: GovukFrontendBackLink
  submitHref: string
  personalDetailsSummary: GovukFrontendSummaryList
  probationPractitionersDetailsSummary: GovukFrontendSummaryList
  equalityMonitoringSummary?: GovukFrontendSummaryList
}

export type PersonalDetailsCard = GlobalContent['/referral/check-referral-information']['personalDetailsCard']

export type EqualityMonitoringCard = GlobalContent['/referral/check-referral-information']['equalityMonitoringCard']

export type AdditionalInformationCard =
  GlobalContent['/referral/check-referral-information']['additionalInformationCard']

export type ContactDetailsCard = GlobalContent['/referral/check-referral-information']['contactDetailsCard']

export type RiskInformationCard = GlobalContent['/referral/check-referral-information']['riskInformationCard']

export type AdditionalSupportNeedsCard =
  GlobalContent['/referral/check-referral-information']['additionalSupportNeedsCard']

export type AdditionalReferralInformationCard =
  GlobalContent['/referral/check-referral-information']['additionalReferralInformationCard']

export type ProbationPractitionerDetailsCard =
  GlobalContent['/referral/check-referral-information']['probationPractitionerDetailsCard']

export type PersonsNeedsCard = GlobalContent['/referral/check-referral-information']['personsNeedsCard']

export type CheckReferralInformationContent = GlobalContent['/referral/check-referral-information']

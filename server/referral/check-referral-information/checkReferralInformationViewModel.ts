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

export type PersonalDetailsCard = GlobalContent['referral']['checkReferralInformation']['personalDetailsCard']

export type EqualityMonitoringCard = GlobalContent['referral']['checkReferralInformation']['equalityMonitoringCard']

export type AdditionalInformationCard =
  GlobalContent['referral']['checkReferralInformation']['additionalInformationCard']

export type ContactDetailsCard = GlobalContent['referral']['checkReferralInformation']['contactDetailsCard']

export type RiskInformationCard = GlobalContent['referral']['checkReferralInformation']['riskInformationCard']

export type AdditionalSupportNeedsCard =
  GlobalContent['referral']['checkReferralInformation']['additionalSupportNeedsCard']

export type AdditionalReferralInformationCard =
  GlobalContent['referral']['checkReferralInformation']['additionalReferralInformationCard']

export type ProbationPractitionerDetailsCard =
  GlobalContent['referral']['checkReferralInformation']['probationPractitionerDetailsCard']

export type PersonsNeedsCard = GlobalContent['referral']['checkReferralInformation']['personsNeedsCard']

export type CheckReferralInformationContent = GlobalContent['referral']['checkReferralInformation']

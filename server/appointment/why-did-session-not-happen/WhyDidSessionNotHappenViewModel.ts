import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { components } from '../../@types/communitySupportApi/imported'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export type WhyDidSessionNotHappenViewModel = {
  pageHeader: string
  whyDidSessionNotHappenRadio: GovukFrontendRadiosWithConditional
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  formData: Partial<components['schemas']['SessionNotHappenReasonRequest']>
}

export type ConditionalTextAreaDetailsContent = {
  name: string
  hint: string
}

export type WhyDidSessionNotHappenRadioItemsContent = {
  serviceProviderIssueText: string
  serviceProviderIssueDetails: ConditionalTextAreaDetailsContent
  referralCouldNotTakePartText: string
  referralCouldNotTakePartDetails: ConditionalTextAreaDetailsContent
  referralDidNotComplyText: string
  referralDidNotComplyDetails: ConditionalTextAreaDetailsContent
}

export type WhyDidSessionNotHappenRadioContent = {
  name: string
  items: WhyDidSessionNotHappenRadioItemsContent
}

export type WhyDidSessionNotHappenContent = {
  pageHeader: string
  whyDidSessionNotHappenRadio: WhyDidSessionNotHappenRadioContent
  submitButtonText: string
  backLinkHref: string
}

import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { components } from '../../@types/communitySupportApi/imported'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ConditionalHtml = {
  serviceProviderIssue: string
  referralCouldNotTakePart: string
  referralDidNotComply: string
}

export type WhyDidSessionNotHappenViewModel = {
  pageHeader: string
  whyDidSessionNotHappenRadio: (conditionalHtml: ConditionalHtml) => GovukFrontendRadiosWithConditional
  serviceProviderIssueHtmlTextBoxArgs: GovukFrontendTextarea
  referralCouldNotTakePartHtmlTextBoxArgs: GovukFrontendTextarea
  referralDidNotComplyHtmlTextBoxArgs: GovukFrontendTextarea
  submitButton: GovukFrontendButton
  backLink: GovukFrontendBackLink
  formData: Partial<components['schemas']['SessionNotHappenReasonRequest']>
}

export type WhyDidSessionNotHappenRadioContent = WhyDidSessionNotHappenContent['whyDidSessionNotHappenRadio']
export type WhyDidSessionNotHappenRadioItemsContent = WhyDidSessionNotHappenRadioContent['items']
export type ConditionalTextAreaDetailsContent = WhyDidSessionNotHappenRadioItemsContent['serviceProviderIssueDetails']

export type WhyDidSessionNotHappenContent = GlobalContent['/ics-feedback/:id/why-did-the-session-not-happen']

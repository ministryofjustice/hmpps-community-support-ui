import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface IdentifiedAdditionalNeedsFormData {
  didYouIdentify?: boolean
  identifyDetails?: string
}
export type DidYouIdentifyRadioItemsContent = {
  yesText: string
  noText: string
  identifyDetailsName: string
  identifyDetailsLabel: string
}

export type DidYouIdentifyRadioContent = {
  name: string
  title: string
  items: DidYouIdentifyRadioItemsContent
}

export type IdentifiedAdditionalNeedsViewModel = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  firstname: string
  existingSupportNeedsDetails?: GovukFrontendSummaryList
  didYouIdentifyRadio: GovukFrontendRadiosWithConditional
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  formData: IdentifiedAdditionalNeedsFormData
}

export type IdentifiedAdditionalNeedsContent = GlobalContent['/ics-feedback/:id/identified-additional-needs']

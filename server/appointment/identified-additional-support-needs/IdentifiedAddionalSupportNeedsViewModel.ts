import { GlobalContent } from "../../../assets/content/GlobalContent";
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional } from "../../@types/govukFrontend/derived";

export interface IdentifiedAdditionalSupportNeedsFormData {
  didYouIndentity?: boolean
  identityDetails?: string
}
export type DidYouIndentityRadioItemsContent = {
  yesText: string
  noText: string
  identityName: string
  identityLabel: string
}

export type DidYouIndentityRadioContent = {
  name: string
  title: string
  items: DidYouIndentityRadioItemsContent
}

export type IdentifiedAdditionalSupportNeedsViewModel = {
  pageTitle: string  
  pageHeader: string
  pageSubHeader: string
  //alreadyIdentifiedDetails: GovukFrontendSummaryList
  didYouIndentityRadio: GovukFrontendRadiosWithConditional
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  //formData: IdentifiedAdditionalSupportNeedsFormData
}

export type IdentifiedAdditionalSupportNeedsContent = GlobalContent['/ics-feedback/:id/identified-additional-support-needs']


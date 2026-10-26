import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface IdentifiedAdditionalNeedsFormData {
  didYouIdentity?: boolean
  identityDetails?: string
}
export type DidYouIndentityRadioItemsContent = {
  yesText: string
  noText: string
  identityDetailsName: string
  identityDetailsLabel: string
}

export type DidYouIndentityRadioContent = {
  name: string
  title: string
  items: DidYouIndentityRadioItemsContent
}

export type IdentifiedAdditionalNeedsViewModel = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  firstname: string
  existingSupportNeedsDetails?: GovukFrontendSummaryList
  didYouIdentityRadio: GovukFrontendRadiosWithConditional
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  formData: IdentifiedAdditionalNeedsFormData
}

export type IdentifiedAdditionalNeedsContent = GlobalContent['/ics-feedback/:id/identified-additional-needs']

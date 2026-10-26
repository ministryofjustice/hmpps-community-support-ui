import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface IdentifiedAdditionalNeedsFormData {
  didYouIdentity?: boolean
  identityDetails?: string
}
export type DidYouIdentityRadioItemsContent = {
  yesText: string
  noText: string
  identityDetailsName: string
  identityDetailsLabel: string
}

export type DidYouIdentityRadioContent = {
  name: string
  title: string
  items: DidYouIdentityRadioItemsContent
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

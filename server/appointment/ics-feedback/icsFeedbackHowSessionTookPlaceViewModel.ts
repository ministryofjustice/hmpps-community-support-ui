import { GovukFrontendBackLink, GovukFrontendInput, GovukFrontendSelect } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface IcsFeedbackHowSessionTookPlaceFormData {
  didSessionTakePlaceAsPlanned?: string
  phoneCall?: string
  phoneCallReason?: string
  howSessionTookPlace?: string
  videoCallReason?: string
  probationDeliveryUnit?: string
  addressLine1?: string
  addressLine2?: string
  townOrCity?: string
  county?: string
  postcode?: string
}

export type IcsFeedbackHowSessionTookPlaceViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backLink: GovukFrontendBackLink
  sessionLocationLines: string[]
  phoneCallReasonInputArgs: GovukFrontendInput
  videoCallReasonInputArgs: GovukFrontendInput
  probationDeliveryUnitSelectArgs: GovukFrontendSelect
  somewhereElseInputArgs: GovukFrontendInput[]
  howSessionRadiosArgs: (
    phoneCallHtml: string,
    videoCallHtml: string,
    probationOfficeHtml: string,
    somewhereElseHtml: string,
  ) => GovukFrontendRadiosWithConditional
  didSessionTakePlaceRadiosArgs: (howSessionHtml: string) => GovukFrontendRadiosWithConditional
}

export type IcsFeedbackHowSessionTookPlaceContent = GlobalContent['icsFeedback']['id']['didSessionTakePlace']

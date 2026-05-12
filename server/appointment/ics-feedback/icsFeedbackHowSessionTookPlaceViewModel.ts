import { GovukFrontendInput, GovukFrontendSelect } from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface IcsFeedbackHowSessionTookPlaceFormData {
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
  backlinkHref: string
  sessionLocationLines: string[]
  errorList: Array<{ href: string; text: string }>
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

export type IcsFeedbackHowSessionTookPlaceContent = {
  submitButtonText: string
  pageHeaders: Record<string, string>
  videoCallReasonLabel: string
  phoneCallReasonLabel: string
  probationOfficeSelectBlankText: string
  probationOfficeSelectLabel: string
  addressLine1Label: string
  addressLine2Label: string
  townOrCityLabel: string
  countyLabel: string
  postcodeLabel: string
  howSessionLegend: string
  howSessionHint: string
  phoneCallOptionText: string
  videoCallOptionText: string
  probationOfficeOptionText: string
  somewhereElseOptionText: string
  yesText: string
  noText: string
}

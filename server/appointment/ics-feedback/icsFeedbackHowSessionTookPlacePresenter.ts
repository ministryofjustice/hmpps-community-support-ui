import { Response } from 'express'
import { GovukFrontendInput, GovukFrontendSelect } from '@govuk-frontend'
import { ProbationOffice, SessionMethod } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  IcsFeedbackHowSessionTookPlaceContent,
  IcsFeedbackHowSessionTookPlaceFormData,
  IcsFeedbackHowSessionTookPlaceViewModel,
} from './icsFeedbackHowSessionTookPlaceViewModel'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'

export default class IcsFeedbackHowSessionTookPlacePresenter extends PresenterBase<
  IcsFeedbackHowSessionTookPlaceViewModel,
  IcsFeedbackHowSessionTookPlaceContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly sessionMethod: SessionMethod,
    private readonly probationOffices: ProbationOffice[],
    private readonly formData?: IcsFeedbackHowSessionTookPlaceFormData,
    private readonly validationErrors?: Record<string, { text: string }>,
  ) {
    super()
  }

  private buildSessionLocationLines(): string[] {
    const { type } = this.sessionMethod
    const sm = this.sessionMethod as Record<string, string | undefined>
    if (type === 'IN_PERSON_PROBATION_OFFICE') {
      return sm.probationOfficeName ? [sm.probationOfficeName] : []
    }
    if (type === 'IN_PERSON_OTHER_LOCATION') {
      return [sm.addressLine1, sm.addressLine2, sm.townOrCity, sm.county, sm.postcode].filter((line): line is string =>
        Boolean(line),
      )
    }
    return []
  }

  private buildVideoCallReasonInputArgs(content: IcsFeedbackHowSessionTookPlaceContent): GovukFrontendInput {
    return {
      id: 'video-call-reason',
      name: 'videoCallReason',
      type: 'text',
      value: this.formData?.videoCallReason ?? null,
      errorMessage: this.validationErrors?.videoCallReason ?? null,
      spellcheck: false,
      label: { text: content.videoCallReasonLabel },
    }
  }

  private buildPhoneCallReasonInputArgs(content: IcsFeedbackHowSessionTookPlaceContent): GovukFrontendInput {
    return {
      id: 'phone-call-reason',
      name: 'phoneCallReason',
      type: 'text',
      value: this.formData?.phoneCallReason ?? null,
      errorMessage: this.validationErrors?.phoneCallReason ?? null,
      spellcheck: false,
      label: { text: content.phoneCallReasonLabel },
    }
  }

  private buildProbationDeliveryUnitSelectArgs(content: IcsFeedbackHowSessionTookPlaceContent): GovukFrontendSelect {
    const blankItem = { value: '', text: content.probationOfficeSelectBlankText }
    const officeItems = (this.probationOffices ?? []).map(office => ({
      value: String(office.probationOfficeId),
      text: office.name,
    }))
    return {
      id: 'probation-delivery-unit',
      name: 'probationDeliveryUnit',
      label: { text: content.probationOfficeSelectLabel },
      items: [blankItem, ...officeItems],
      value: this.formData?.probationDeliveryUnit ?? null,
      errorMessage: this.validationErrors?.probationDeliveryUnit ?? null,
    }
  }

  private buildSomewhereElseInputArgs(content: IcsFeedbackHowSessionTookPlaceContent): GovukFrontendInput[] {
    return [
      {
        label: { text: content.addressLine1Label },
        id: 'address-line-1',
        name: 'addressLine1',
        value: this.formData?.addressLine1 ?? null,
        errorMessage: this.validationErrors?.addressLine1 ?? null,
        autocomplete: 'address-line1',
      },
      {
        label: { text: content.addressLine2Label },
        id: 'address-line-2',
        name: 'addressLine2',
        value: this.formData?.addressLine2 ?? null,
        errorMessage: this.validationErrors?.addressLine2 ?? null,
        autocomplete: 'address-line2',
      },
      {
        label: { text: content.townOrCityLabel },
        classes: 'govuk-!-width-two-thirds',
        id: 'address-town-or-city',
        name: 'townOrCity',
        value: this.formData?.townOrCity ?? null,
        errorMessage: this.validationErrors?.townOrCity ?? null,
        autocomplete: 'address-level2',
      },
      {
        label: { text: content.countyLabel },
        classes: 'govuk-!-width-two-thirds',
        id: 'address-county',
        name: 'county',
        value: this.formData?.county ?? null,
        errorMessage: this.validationErrors?.county ?? null,
      },
      {
        label: { text: content.postcodeLabel },
        classes: 'govuk-input--width-10',
        id: 'address-postcode',
        name: 'postcode',
        value: this.formData?.postcode ?? null,
        errorMessage: this.validationErrors?.postcode ?? null,
        autocomplete: 'postal-code',
      },
    ]
  }

  private buildHowSessionRadiosArgs(
    content: IcsFeedbackHowSessionTookPlaceContent,
    phoneCallHtml: string,
    videoCallHtml: string,
    probationOfficeHtml: string,
    somewhereElseHtml: string,
  ): GovukFrontendRadiosWithConditional {
    const { type } = this.sessionMethod
    const items: GovukFrontendRadiosItemWithConditional[] = []

    if (type !== 'PHONE') {
      items.push({
        value: 'PHONE',
        text: content.phoneCallOptionText,
        checked: this.formData?.howSessionTookPlace === 'PHONE',
        conditional: { html: phoneCallHtml },
      })
    }

    if (type !== 'VIDEO') {
      items.push({
        value: 'VIDEO',
        text: content.videoCallOptionText,
        checked: this.formData?.howSessionTookPlace === 'VIDEO',
        conditional: { html: videoCallHtml },
      })
    }

    if (type !== 'IN_PERSON_PROBATION_OFFICE') {
      items.push({
        value: 'IN_PERSON_PROBATION_OFFICE',
        text: content.probationOfficeOptionText,
        checked: this.formData?.howSessionTookPlace === 'IN_PERSON_PROBATION_OFFICE',
        conditional: { html: probationOfficeHtml },
      })
    }

    items.push({
      value: 'IN_PERSON_OTHER_LOCATION',
      text: content.somewhereElseOptionText,
      checked: this.formData?.howSessionTookPlace === 'IN_PERSON_OTHER_LOCATION',
      conditional: { html: somewhereElseHtml },
    })

    return {
      idPrefix: 'how-session-took-place',
      name: 'howSessionTookPlace',
      fieldset: {
        legend: {
          text: content.howSessionLegend,
          classes: 'govuk-fieldset__legend--s',
        },
      },
      hint: { text: content.howSessionHint },
      errorMessage: this.validationErrors?.howSessionTookPlace ?? null,
      items,
    }
  }

  private buildDidSessionTakePlaceRadiosArgs(
    content: IcsFeedbackHowSessionTookPlaceContent,
    pageHeader: string,
    howSessionHtml: string,
  ): GovukFrontendRadiosWithConditional {
    return {
      idPrefix: 'phone-call',
      name: 'phoneCall',
      fieldset: {
        legend: {
          text: pageHeader,
          classes: 'govuk-visually-hidden',
        },
      },
      errorMessage: this.validationErrors?.phoneCall ?? null,
      items: [
        {
          value: 'yes',
          text: content.yesText,
          checked: this.formData?.phoneCall === 'yes',
        },
        {
          value: 'no',
          text: content.noText,
          checked: this.formData?.phoneCall === 'no',
          conditional: { html: howSessionHtml },
        },
      ],
    }
  }

  buildPageContent(res: Response): IcsFeedbackHowSessionTookPlaceViewModel {
    const content = this.buildStaticContent(res)
    const { type } = this.sessionMethod
    const pageHeader = content.pageHeaders?.[type] ?? content.pageHeaders?.default ?? ''
    return {
      pageHeader,
      submitButtonText: content.submitButtonText,
      submitHref: `/ics-feedback/${this.caseRefId}/did-session-take-place`,
      backLink: { href: `/ics-feedback/attendance/${this.caseRefId}` },
      sessionLocationLines: this.buildSessionLocationLines(),
      errorList: Object.entries(this.validationErrors ?? {}).map(([key, error]) => ({
        href: `#${key}`,
        text: error.text,
      })),
      phoneCallReasonInputArgs: this.buildPhoneCallReasonInputArgs(content),
      videoCallReasonInputArgs: this.buildVideoCallReasonInputArgs(content),
      probationDeliveryUnitSelectArgs: this.buildProbationDeliveryUnitSelectArgs(content),
      somewhereElseInputArgs: this.buildSomewhereElseInputArgs(content),
      howSessionRadiosArgs: (phoneCallHtml, videoCallHtml, probationOfficeHtml, somewhereElseHtml) =>
        this.buildHowSessionRadiosArgs(content, phoneCallHtml, videoCallHtml, probationOfficeHtml, somewhereElseHtml),
      didSessionTakePlaceRadiosArgs: howSessionHtml =>
        this.buildDidSessionTakePlaceRadiosArgs(content, pageHeader, howSessionHtml),
    }
  }

  getTemplatePath(): string {
    return 'appointment/icsFeedback'
  }
}

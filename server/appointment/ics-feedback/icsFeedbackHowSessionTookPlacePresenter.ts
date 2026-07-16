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
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class IcsFeedbackHowSessionTookPlacePresenter extends PresenterBase<
  IcsFeedbackHowSessionTookPlaceViewModel,
  IcsFeedbackHowSessionTookPlaceContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly sessionMethod: SessionMethod,
    private readonly probationOffices: ProbationOffice[],
    private readonly formData?: IcsFeedbackHowSessionTookPlaceFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
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
      id: 'videoCallReason',
      name: 'videoCallReason',
      type: 'text',
      value: this.formData?.videoCallReason ?? null,
      errorMessage: this.validationErrors?.messages.videoCallReason ?? null,
      spellcheck: false,
      label: { text: content.videoCallReasonLabel },
    }
  }

  private buildPhoneCallReasonInputArgs(content: IcsFeedbackHowSessionTookPlaceContent): GovukFrontendInput {
    return {
      id: 'phoneCallReason',
      name: 'phoneCallReason',
      type: 'text',
      value: this.formData?.phoneCallReason ?? null,
      errorMessage: this.validationErrors?.messages.phoneCallReason ?? null,
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
      id: 'probationDeliveryUnit',
      name: 'probationDeliveryUnit',
      label: { text: content.probationOfficeSelectLabel, classes: 'govuk-visually-hidden' },
      items: [blankItem, ...officeItems],
      value: this.formData?.probationDeliveryUnit ?? null,
      errorMessage: this.validationErrors?.messages.probationDeliveryUnit ?? null,
    }
  }

  private buildSomewhereElseInputArgs(content: IcsFeedbackHowSessionTookPlaceContent): GovukFrontendInput[] {
    return [
      {
        label: { text: content.addressLine1Label },
        id: 'addressLine1',
        name: 'addressLine1',
        value: this.formData?.addressLine1 ?? null,
        errorMessage: this.validationErrors?.messages.addressLine1 ?? null,
        autocomplete: 'address-line1',
      },
      {
        label: { text: content.addressLine2Label },
        id: 'addressLine2',
        name: 'addressLine2',
        value: this.formData?.addressLine2 ?? null,
        errorMessage: this.validationErrors?.messages.addressLine2 ?? null,
        autocomplete: 'address-line2',
      },
      {
        label: { text: content.townOrCityLabel },
        classes: 'govuk-!-width-two-thirds',
        id: 'townOrCity',
        name: 'townOrCity',
        value: this.formData?.townOrCity ?? null,
        errorMessage: this.validationErrors?.messages.townOrCity ?? null,
        autocomplete: 'address-level2',
      },
      {
        label: { text: content.countyLabel },
        classes: 'govuk-!-width-two-thirds',
        id: 'county',
        name: 'county',
        value: this.formData?.county ?? null,
        errorMessage: this.validationErrors?.messages.county ?? null,
      },
      {
        label: { text: content.postcodeLabel },
        classes: 'govuk-input--width-10',
        id: 'postcode',
        name: 'postcode',
        value: this.formData?.postcode ?? null,
        errorMessage: this.validationErrors?.messages.postcode ?? null,
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
      idPrefix: 'howSessionTookPlace',
      name: 'howSessionTookPlace',
      fieldset: {
        legend: {
          text: content.howSessionLegend,
          classes: 'govuk-fieldset__legend--s',
        },
      },
      hint: { text: content.howSessionHint },
      errorMessage: this.validationErrors?.messages.howSessionTookPlace ?? null,
      items,
    }
  }

  private buildDidSessionTakePlaceRadiosArgs(
    content: IcsFeedbackHowSessionTookPlaceContent,
    pageHeader: string,
    howSessionHtml: string,
  ): GovukFrontendRadiosWithConditional {
    return {
      idPrefix: 'didSessionTakePlaceAsPlanned',
      name: 'didSessionTakePlaceAsPlanned',
      fieldset: {
        legend: {
          text: pageHeader,
          classes: 'govuk-visually-hidden',
        },
      },
      errorMessage: this.validationErrors?.messages.didSessionTakePlaceAsPlanned ?? null,
      items: [
        {
          value: 'yes',
          text: content.yesText,
          checked: this.formData?.didSessionTakePlaceAsPlanned === 'yes',
        },
        {
          value: 'no',
          text: content.noText,
          checked: this.formData?.didSessionTakePlaceAsPlanned === 'no',
          conditional: { html: howSessionHtml },
        },
      ],
    }
  }

  buildViewModel(res: Response): IcsFeedbackHowSessionTookPlaceViewModel {
    const content = this.buildStaticContent(res)
    const { type } = this.sessionMethod
    const pageHeader = content.pageHeaders?.[type] ?? content.pageHeaders?.default ?? ''
    return {
      pageHeader,
      submitButtonText: content.submitButtonText,
      submitHref: `/ics-feedback/${this.caseRefId}/did-session-take-place`,
      backLink: { href: `/ics-feedback/${this.caseRefId}/attendance` },
      sessionLocationLines: this.buildSessionLocationLines(),
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

import { Response } from 'express'
import { ProbationOffice, ReferralInformation } from '@community-support-api'
import { GovukFrontendButton, GovukFrontendRadiosItem, GovukFrontendSelectItem } from '@govuk-frontend'
import { MojDatePicker } from '@moj-frontend'
import { Prison } from '@prison-api'
import PresenterBase from '../../presenter/presenterBase'
import { ScheduleIcsContent, ScheduleIcsViewModel, ScheduleFormData } from './scheduleIcsViewModel'
import { ErrorMiddlewareErrors } from '../../@types/express'
import {
  GovukFrontendCheckboxesWithConditional,
  GovukFrontendRadiosWithConditional,
  WithConditional,
} from '../../@types/govukFrontend/derived'
import { buildInput, buildSelect } from '../../utils/utils'
import { ComponentsTimeInput } from '../../@types/components'
import isIdentifierACrn from '../../utils/isIdentifierACrn'
import { ScheduledIcsFormData } from './ScheduledIcsFormDataResolver'

export interface ValidationError {
  key: string
  message: string
}

const buildProbationOfficesSelectItems = (
  probationOffices: ProbationOffice[],
  formData: ScheduleFormData | undefined,
  content: ScheduleIcsContent,
): GovukFrontendSelectItem[] => {
  const defaultItem = [
    {
      value: '',
      text: content.howSessionTakePlace.radioItems.probation.label,
    },
  ]
  return defaultItem.concat(
    (probationOffices ?? []).map(office => ({
      value: office.name,
      text: office.name,
      selected: formData?.probationOffice === office.name,
    })),
  )
}

const buildPrisonOfficesSelectItems = (
  prisionOffices: Prison[],
  formData: ScheduleFormData | undefined,
  content: ScheduleIcsContent,
): GovukFrontendSelectItem[] => {
  const defaultItem = [
    {
      value: '',
      text: content.howSessionTakePlace.radioItems.prison.label,
    },
  ]
  return defaultItem.concat(
    (prisionOffices ?? []).map(prison => ({
      value: `${prison.agencyId}`,
      text: prison.description,
      selected: formData?.prison === `${prison.agencyId}`,
    })),
  )
}

export default class ScheduleIcsPresenter extends PresenterBase<ScheduleIcsViewModel, ScheduleIcsContent> {
  private readonly inCustody: boolean

  constructor(
    private readonly caseReference: string,
    private readonly probationOffices: ProbationOffice[],
    private readonly prisonOffices: Prison[],
    private readonly referralInformation: ReferralInformation,
    private readonly formData?: ScheduledIcsFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
    this.inCustody = !isIdentifierACrn(this.referralInformation.personIdentifier)
  }

  private buildAddressInput(content: ScheduleIcsContent) {
    return (
      buildInput({
        label: {
          text: content.howSessionTakePlace.radioItems.somewhereElse.addressLabels.address1,
        },
        id: 'addressLine1',
        name: 'addressLine1',
        value: this.formData?.addressLine1,
        errorMessage: this.validationErrors?.messages?.addressLine1,
        autocomplete: 'address-line1',
      }) +
      buildInput({
        label: {
          text: content.howSessionTakePlace.radioItems.somewhereElse.addressLabels.address2,
        },
        id: 'addressLine2',
        name: 'addressLine2',
        value: this.formData?.addressLine2,
        errorMessage: this.validationErrors?.messages?.addressLine2,
        autocomplete: 'address-line2',
      }) +
      buildInput({
        label: {
          text: content.howSessionTakePlace.radioItems.somewhereElse.addressLabels.townOrCity,
        },
        classes: 'govuk-!-width-two-thirds',
        id: 'addressTown',
        name: 'addressTown',
        value: this.formData?.addressTown,
        errorMessage: this.validationErrors?.messages?.addressTown,
        autocomplete: 'address-level2',
      }) +
      buildInput({
        label: {
          text: content.howSessionTakePlace.radioItems.somewhereElse.addressLabels.county,
        },
        classes: 'govuk-!-width-two-thirds',
        id: 'addressCounty',
        name: 'addressCounty',
        value: this.formData?.addressCounty,
        errorMessage: this.validationErrors?.messages?.addressCounty,
      }) +
      buildInput({
        label: {
          text: content.howSessionTakePlace.radioItems.somewhereElse.addressLabels.postcode,
        },
        classes: 'govuk-input--width-10',
        id: 'addressPostcode',
        name: 'addressPostcode',
        value: this.formData?.addressPostcode,
        errorMessage: this.validationErrors?.messages?.addressPostcode,
        autocomplete: 'postal-code',
      })
    )
  }

  private buildInCommunityRadioItems(content: ScheduleIcsContent): WithConditional<GovukFrontendRadiosItem>[] {
    return [
      {
        value: 'InProbationOffice',
        text: content.howSessionTakePlace.radioItems.probation.text,
        conditional: {
          html: buildSelect({
            id: 'probationOfficeList',
            name: 'probationOfficeList',
            label: {},
            items: buildProbationOfficesSelectItems(this.probationOffices, this.formData, content),
            value: this.formData?.probationOffice,
            errorMessage: this.validationErrors?.messages?.probationOfficeList,
          }),
        },
      },
      {
        value: 'InSomewhereElse',
        text: content.howSessionTakePlace.radioItems.somewhereElse.text,
        conditional: { html: this.buildAddressInput(content) },
      },
    ]
  }

  private buildInCustodyRadioItems(content: ScheduleIcsContent): WithConditional<GovukFrontendRadiosItem>[] {
    return [
      {
        value: 'InPrison',
        text: content.howSessionTakePlace.radioItems.prison.text,
        conditional: {
          html: buildSelect({
            id: 'prisonList',
            name: 'prisonList',
            label: {},
            items: buildPrisonOfficesSelectItems(this.prisonOffices, this.formData, content),
            value: this.formData?.prison,
            errorMessage: this.validationErrors?.messages?.prisonList,
          }),
        },
      },
    ]
  }

  private buildRadioItems(content: ScheduleIcsContent): WithConditional<GovukFrontendRadiosItem>[] {
    const items: WithConditional<GovukFrontendRadiosItem>[] = [
      {
        value: 'ByPhone',
        text: content.howSessionTakePlace.radioItems.phone.text,
        conditional: {
          html: buildInput({
            id: 'ByPhone',
            name: 'ByPhone',
            type: 'text',
            value: this.formData?.ByPhone,
            errorMessage: this.validationErrors?.messages?.ByPhone,
            spellcheck: false,
            classes: 'govuk-!-width-full',
            label: {
              text: content.howSessionTakePlace.radioItems.phone.label,
            },
          }),
        },
      },
      {
        value: 'ByVideo',
        text: content.howSessionTakePlace.radioItems.video.text,
        conditional: {
          html: buildInput({
            id: 'ByVideo',
            name: 'ByVideo',
            type: 'text',
            value: this.formData?.ByVideo,
            errorMessage: this.validationErrors?.messages?.ByVideo,
            spellcheck: false,
            classes: 'govuk-!-width-full',
            label: {
              text: content.howSessionTakePlace.radioItems.video.label,
            },
          }),
        },
      },
    ]
    return items.concat(
      this.inCustody ? this.buildInCustodyRadioItems(content) : this.buildInCommunityRadioItems(content),
    )
  }

  private buildHowWillTheSessionTakePlaceRadios(content: ScheduleIcsContent): GovukFrontendRadiosWithConditional {
    return {
      name: 'sessionTakePlace',
      fieldset: {
        legend: {
          text: content.howSessionTakePlace.label,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
        attributes: { 'data-testid': 'sessionTakePlace-fieldset' },
      },
      value: this.formData?.sessionTakePlace || '',
      errorMessage: this.validationErrors?.messages?.sessionTakePlace,
      hint: {
        text: content.howSessionTakePlace.hint,
      },
      items: this.buildRadioItems(content),
      attributes: { 'data-testid': 'sessionTakePlace-radios' },
    }
  }

  private buildDateInput(content: ScheduleIcsContent): MojDatePicker {
    return {
      id: 'sessionDate',
      label: {
        text: content.date.label,
        classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
      },
      name: 'sessionDate',
      value: this.formData?.sessionDate || '',
      errorMessage: this.validationErrors?.messages?.sessionDate,
      hint: {
        text: content.date.hint,
      },
    }
  }

  private buildTimeInput(content: ScheduleIcsContent): ComponentsTimeInput {
    return {
      id: 'sessionTime',
      namePrefix: 'sessionTime',
      errorMessage: this.validationErrors?.messages?.sessionTime,
      hint: {
        text: content.time.hint,
      },
      fieldset: {
        classes: 'govuk-fieldset',
        legend: {
          text: content.time.label,
          classes: 'govuk-fieldset__legend  govuk-fieldset__legend--m',
        },
      },
      items: [
        {
          name: 'hour',
          value: this.formData ? this.formData['sessionTime-hour'] : '',
          classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
        },
        {
          name: 'minute',
          value: this.formData ? this.formData['sessionTime-minute'] : '',
          classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
        },
      ],
      meridiemParams: {
        label: content.time.AMorPM,
        value: this.formData ? this.formData['sessionTime-meridiem'] : '',
      },
    }
  }

  private buildHowWasTheyInformedAboutTheSession(
    content: ScheduleIcsContent,
  ): GovukFrontendCheckboxesWithConditional | undefined {
    return {
      name: 'informedMethods',
      fieldset: {
        legend: {
          text: content.informed.label.replace('{{ firstname }}', this.referralInformation.firstName),
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: content.informed.hint,
      },
      items: [
        {
          value: 'informedByPhone',
          text: content.informed.selectionItems.phone,
          checked:
            this.formData && this.formData.informedMethods && this.formData.informedMethods.includes('informedByPhone'),
        },
        {
          value: 'informedByTextMessage',
          text: content.informed.selectionItems.text,
          checked:
            this.formData &&
            this.formData.informedMethods &&
            this.formData.informedMethods.includes('informedByTextMessage'),
        },
        {
          value: 'informedByEmail',
          text: content.informed.selectionItems.email,
          checked:
            this.formData && this.formData.informedMethods && this.formData.informedMethods.includes('informedByEmail'),
        },
        {
          value: 'informedByOtherMethod',
          text: content.informed.selectionItems.other.text,
          checked: this.formData?.otherMethodOfContact !== undefined && this.formData.otherMethodOfContact.length > 0,
          conditional: {
            html: buildInput({
              id: 'otherMethodOfContact',
              name: 'otherMethodOfContact',
              value: this.formData?.otherMethodOfContact,
              type: 'text',
              errorMessage: this.validationErrors?.messages?.otherMethodOfContact,
              spellcheck: false,
              classes: 'govuk-!-width-full',
              label: {
                text: content.informed.selectionItems.other.label,
              },
            }),
          },
        },
      ],
      values: this.formData?.informedMethods,
      errorMessage: this.validationErrors?.messages?.informedMethods,
    }
  }

  private buildSubmit({ submitButtonText }: ScheduleIcsContent): GovukFrontendButton {
    return { text: submitButtonText, classes: 'govuk-!-margin-top-6' }
  }

  buildViewModel(res: Response): ScheduleIcsViewModel {
    const content = this.buildStaticContent(res)
    const submitHref = content.submitHref.replace('{{ caseRef }}', this.caseReference)
    const backLinkHref = content.backLink.replace('{{ caseRef }}', this.caseReference)
    return {
      pageHeader: content.pageHeader,
      submitButton: this.buildSubmit(content),
      submitHref,
      backLink: { href: backLinkHref },
      dateInput: this.buildDateInput(content),
      timeInput: this.buildTimeInput(content),
      howWillTheSessionTakePlaceInput: this.buildHowWillTheSessionTakePlaceRadios(content),
      howWasTheyInformedAboutTheSessionInput: this.inCustody
        ? undefined
        : this.buildHowWasTheyInformedAboutTheSession(content),
    }
  }

  getTemplatePath(): string {
    return 'appointment/scheduleIcsAppointment'
  }
}

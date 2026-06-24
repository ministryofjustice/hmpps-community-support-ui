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

export interface ValidationError {
  key: string
  message: string
}

const buildProbationOfficesSelectItems = (
  probationOffices: ProbationOffice[],
  formData: ScheduleFormData | undefined,
): GovukFrontendSelectItem[] => {
  const defaultItem = [
    {
      value: '',
      text: 'Select probation office',
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
): GovukFrontendSelectItem[] => {
  const defaultItem = [
    {
      value: '',
      text: 'Select prison',
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
    private readonly formData?: ScheduleFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
    this.inCustody = !isIdentifierACrn(this.referralInformation.crn)
  }

  private buildAddressInput() {
    return (
      buildInput({
        label: {
          text: 'Address line 1',
        },
        id: 'addressLine1',
        name: 'addressLine1',
        value: this.formData?.addressLine1,
        errorMessage: this.validationErrors?.messages?.addressLine1,
        autocomplete: 'address-line1',
      }) +
      buildInput({
        label: {
          text: 'Address line 2 (optional)',
        },
        id: 'addressLine2',
        name: 'addressLine2',
        value: this.formData?.addressLine2,
        errorMessage: this.validationErrors?.messages?.addressLine2,
        autocomplete: 'address-line2',
      }) +
      buildInput({
        label: {
          text: 'Town or city',
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
          text: 'County (optional)',
        },
        classes: 'govuk-!-width-two-thirds',
        id: 'addressCounty',
        name: 'addressCounty',
        value: this.formData?.addressCounty,
        errorMessage: this.validationErrors?.messages?.addressCounty,
      }) +
      buildInput({
        label: {
          text: 'Postcode',
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

  private buildInCommunityRadioItems(): WithConditional<GovukFrontendRadiosItem>[] {
    return [
      {
        value: 'InProbationOffice',
        text: 'In-person meeting - probation office',
        conditional: {
          html: buildSelect({
            id: 'probationOfficeList',
            name: 'probationOfficeList',
            label: {},
            items: buildProbationOfficesSelectItems(this.probationOffices, this.formData),
            value: this.formData?.probationOffice,
            errorMessage: this.validationErrors?.messages?.probationOfficeList,
          }),
        },
      },
      {
        value: 'InSomewhereElse',
        text: 'In-person meeting - somewhere else',
        conditional: { html: this.buildAddressInput() },
      },
    ]
  }

  private buildInCustodyRadioItems(): WithConditional<GovukFrontendRadiosItem>[] {
    return [
      {
        value: 'InPrison',
        text: 'In-person meeting - prison establishment',
        conditional: {
          html: buildSelect({
            id: 'prisonList',
            name: 'prisonList',
            label: {},
            items: buildPrisonOfficesSelectItems(this.prisonOffices, this.formData),
            value: this.formData?.prison,
            errorMessage: this.validationErrors?.messages?.prisonList,
          }),
        },
      },
    ]
  }

  private buildRadioItems(): WithConditional<GovukFrontendRadiosItem>[] {
    const items: WithConditional<GovukFrontendRadiosItem>[] = [
      {
        value: 'ByPhone',
        text: 'Phone call',
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
              text: 'Why is this session not in person?',
            },
          }),
        },
      },
      {
        value: 'ByVideo',
        text: 'Video call',
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
              text: 'Why is this session not in person?',
            },
          }),
        },
      },
    ]
    return items.concat(this.inCustody ? this.buildInCustodyRadioItems() : this.buildInCommunityRadioItems())
  }

  private buildHowWillTheSessionTakePlaceRadios(): GovukFrontendRadiosWithConditional {
    return {
      name: 'sessionTakePlace',
      fieldset: {
        legend: {
          text: 'How will the session take place?',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
        attributes: { 'data-testid': 'sessionTakePlace-fieldset' },
      },
      value: this.formData?.sessionTakePlace || '',
      errorMessage: this.validationErrors?.messages?.sessionTakePlace,
      hint: {
        text: 'Select one option.',
      },
      items: this.buildRadioItems(),
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
        label: 'AM or PM',
        value: this.formData ? this.formData['sessionTime-meridiem'] : '',
      },
    }
  }

  private buildHowWasTheyInformedAboutTheSession(): GovukFrontendCheckboxesWithConditional | undefined {
    return {
      name: 'informedMethod',
      fieldset: {
        legend: {
          text: `How was ${this.referralInformation.firstName} informed about the session?`,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Select all that apply.',
      },
      items: [
        {
          value: 'informedByPhone',
          text: 'Phone call',
          checked:
            this.formData && this.formData.informedMethod && this.formData.informedMethod.includes('informedByPhone'),
        },
        {
          value: 'informedByTextMessage',
          text: 'Text message',
          checked:
            this.formData &&
            this.formData.informedMethod &&
            this.formData.informedMethod.includes('informedByTextMessage'),
        },
        {
          value: 'informedByEmail',
          text: 'Email',
          checked:
            this.formData && this.formData.informedMethod && this.formData.informedMethod.includes('informedByEmail'),
        },
        {
          value: 'informedByOtherMethod',
          text: 'Other',
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
                text: 'Other method of contact',
              },
            }),
          },
        },
      ],
      values: this.formData?.informedMethod,
      errorMessage: this.validationErrors?.messages?.informedMethod,
    }
  }

  private buildSubmit({ submitButtonText }: ScheduleIcsContent): GovukFrontendButton {
    return { text: submitButtonText, classes: 'govuk-!-margin-top-6' }
  }

  buildPageContent(res: Response): ScheduleIcsViewModel {
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
      howWillTheSessionTakePlaceInput: this.buildHowWillTheSessionTakePlaceRadios(),
      howWasTheyInformedAboutTheSessionInput: this.inCustody
        ? undefined
        : this.buildHowWasTheyInformedAboutTheSession(),
    }
  }

  getTemplatePath(): string {
    return 'appointment/scheduleIcsAppointment'
  }
}

import { Response } from 'express'
import { CreateAppointmentTypeOptionDto, ReferralInformation } from '@community-support-api'
import { GovukFrontendRadios } from '@govuk-frontend'
import PresenterBase from '../../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../../@types/express'
import { AppointmentTypeContent, AppointmentTypeViewModel } from './AppointmentTypeViewModel'
import { normaliseAppointmentTypeOptions } from '../appointmentTypeLabel'
import { parseAppointmentType } from '../../appointmentTypeRules'

export default class AppointmentTypePresenter extends PresenterBase<AppointmentTypeViewModel, AppointmentTypeContent> {
  constructor(
    private readonly caseReference: string,
    private readonly referralInformation: ReferralInformation,
    private readonly appointmentTypes: CreateAppointmentTypeOptionDto[],
    private readonly validationErrors?: ErrorMiddlewareErrors,
    private readonly selectedAppointmentType?: string,
  ) {
    super()
  }

  private buildRadios(content: AppointmentTypeContent): GovukFrontendRadios {
    const normalisedAppointmentTypes = normaliseAppointmentTypeOptions(this.appointmentTypes)
    const selectedType = parseAppointmentType(this.selectedAppointmentType)
    const selectedValue = selectedType
      ? normalisedAppointmentTypes.find(option => parseAppointmentType(option.value) === selectedType)?.value
      : this.selectedAppointmentType

    return {
      name: 'appointmentType',
      fieldset: {
        legend: {
          text: content.appointmentTypeLabel || content.pageTitle || 'Appointment type',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      value: selectedValue ?? null,
      errorMessage: this.validationErrors?.messages.appointmentType ?? null,
      items: normalisedAppointmentTypes.map(({ name, value }) => ({
        text: name,
        value,
      })),
    }
  }

  buildViewModel(res: Response): AppointmentTypeViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageTitle: content.pageTitle,
      heading: undefined,
      backLink: {
        href: `/referral/${this.caseReference}/appointments`,
      },
      radios: this.buildRadios(content),
      button: {
        text: content.buttonText,
        preventDoubleClick: true,
      },
    }
  }

  getTemplatePath(): string {
    return 'appointment/appointmentType'
  }
}

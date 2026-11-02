import { Response } from 'express'
import { CreateAppointmentTypeOptionDto, ReferralInformation } from '@community-support-api'
import { GovukFrontendRadios } from '@govuk-frontend'
import PresenterBase from '../../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../../@types/express'
import { AppointmentTypeContent, AppointmentTypeViewModel } from './AppointmentTypeViewModel'

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
    return {
      name: 'appointmentType',
      fieldset: {
        legend: {
          text: content.appointmentTypeLabel,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      value: this.selectedAppointmentType ?? null,
      errorMessage: this.validationErrors?.messages.appointmentType ?? null,
      items: this.appointmentTypes.map(({ name, value }) => ({
        text: name,
        value,
      })),
    }
  }

  buildViewModel(res: Response): AppointmentTypeViewModel {
    const content = this.buildStaticContent(res)
    const personName = [this.referralInformation.firstName, this.referralInformation.lastName].filter(Boolean).join(' ')

    return {
      pageTitle: content.pageTitle,
      heading: content.heading.replace('{{ personName }}', personName),
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

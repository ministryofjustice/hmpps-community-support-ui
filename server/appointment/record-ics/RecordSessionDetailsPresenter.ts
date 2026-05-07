import { Response } from 'express'
import { AppointmentIcsResponse } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  RecordSessionDetailsContent,
  RecordSessionDetailsFormData,
  RecordSessionDetailsViewModel,
} from './RecordSessionDetailsViewModel'
import buildAppointmentDetails from './AppointmentDetailsModel'

export default class RecordSessionDetailsPresenter extends PresenterBase<
  RecordSessionDetailsViewModel,
  RecordSessionDetailsContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly data: AppointmentIcsResponse,
    private readonly session: {
      wasPersonLate?: boolean | null
      lateReason?: string | null
      duration?: { hours: number; minutes?: number | null } | null
    },
  ) {
    super()
  }

  buildPageContent(res: Response): RecordSessionDetailsViewModel {
    const content = this.buildStaticContent(res)
    const formData: RecordSessionDetailsFormData = this.session
      ? {
          wasPersonLate: this.session.wasPersonLate,
          lateReason: this.session.lateReason,
          'sessionDuration-hours': this.session.duration?.hours,
          'sessionDuration-minutes': this.session.duration?.minutes,
        }
      : {}

    return {
      pageHeader: content.pageHeader,
      firstName: this.data.referralFirstName,
      appointment: buildAppointmentDetails(content.appointmentDetails, this.data),
      formData,
      submitButtonText: content.submitButtonText,
      submitHref: `/ics-feedback/${this.caseRefId}/session-details`,
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
    }
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionDetails'
  }
}

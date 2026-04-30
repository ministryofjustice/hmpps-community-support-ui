import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import {
  RecordSessionDetailsContent,
  RecordSessionDetailsViewModel,
} from './RecordSessionDetailsViewModel'
import buildAppointmentDetails from './AppointmentDetailsModel'
import { AppointmentIcsResponse } from '@community-support-api'

export default class RecordSessionDetailsPresenter extends PresenterBase<RecordSessionDetailsViewModel, RecordSessionDetailsContent> {
  constructor(
    private readonly caseRefId: string,
    private readonly data: AppointmentIcsResponse,
  ) {
    super()
  }

  buildPageContent(res: Response): RecordSessionDetailsViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      firstName: this.data.referralFirstName,
      appointment: buildAppointmentDetails(content.appointmentDetails, this.data),
      submitButtonText: content.submitButtonText,
      submitHref: `/ics-feedback/session-details/${this.caseRefId}`,
      backlinkHref: `/progress/${this.caseRefId}`,
    }
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionDetails'
  }
}

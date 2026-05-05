import { GovukFrontendSummaryList } from '@govuk-frontend'
import { AppointmentIcsResponse } from '@community-support-api'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'
import dateFormat from '../../utils/dateFormat'
import timeFormat from '../../utils/timeFormat'

export interface AppointmentDetailsContent {
  dateLabel: string
  startTimeLabel: string
}

const buildAppointmentDetails = (
  content: AppointmentDetailsContent,
  data: AppointmentIcsResponse,
): GovukFrontendSummaryList => {
  return {
    rows: [
      govFrontendSummaryListRow(content.dateLabel, dateFormat(new Date(data.appointmentDate))),
      govFrontendSummaryListRow(content.startTimeLabel, timeFormat(data.appointmentTime)),
    ],
    attributes: { 'data-testid': 'appointment-details' },
  }
}
export default buildAppointmentDetails

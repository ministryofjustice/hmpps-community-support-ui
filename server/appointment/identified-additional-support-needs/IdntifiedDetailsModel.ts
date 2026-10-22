import { GovukFrontendSummaryList } from '@govuk-frontend'
import { AppointmentIcsResponse } from '@community-support-api'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'
import dateFormat from '../../utils/dateFormat'
import timeFormat from '../../utils/timeFormat'

// export interface AppointmentDetailsContent {
//   dateLabel: string
//   startTimeLabel: string
// }
export interface AlreadyIdentifiedDetailsContent {
  identityName: string
  identityDetails: string
}

export type IdentifiedAdditionalSupportNeedsPresenterData = Pick<
  AppointmentIcsResponse,
  'appointmentDate' | 'appointmentTime' | 'referralFirstName'
>

const buildAlreadyIdentifiedDetails = (
  content: AlreadyIdentifiedDetailsContent,
  data: IdentifiedAdditionalSupportNeedsPresenterData,
): GovukFrontendSummaryList => {
  return {
    rows: [
      govFrontendSummaryListRow(content.identityName, dateFormat(new Date(data.appointmentDate))),
      govFrontendSummaryListRow(content.identityDetails, timeFormat(data.appointmentTime)),
    ],
    attributes: { 'data-testid': 'appointment-details' },
  }
}
export default buildAlreadyIdentifiedDetails

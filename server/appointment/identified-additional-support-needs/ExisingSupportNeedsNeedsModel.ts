import { GovukFrontendSummaryList } from '@govuk-frontend'
import { ExistingSupportNeedsBffResponseDto } from '@community-support-api'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'

export interface ExisintingSupportNeedsContent {
  needName: string
  needDetails: string
}

export type ExistingSupportNeedsPresenterData = Pick<
  ExistingSupportNeedsBffResponseDto,
  'supportNeeds' | 'referralFirstName'
  // 'appointmentDate' | 'appointmentTime'
>

const buildExistingSuppportNeedsDetails = (
  content: ExisintingSupportNeedsContent,
  data: ExistingSupportNeedsPresenterData,
): GovukFrontendSummaryList => {
  return {
    rows: [
      govFrontendSummaryListRow(content.needName, data.supportNeeds[0].needName),
      govFrontendSummaryListRow(content.needDetails, data.supportNeeds[1].needDetails),
    ],
    attributes: { 'data-testid': 'exisiting-support-needs-details' },
  }
}
export default buildExistingSuppportNeedsDetails

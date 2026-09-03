import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type CheckPPDetailsContent = GlobalContent['/referral/task-list/check-probation-practitioner-details']

export interface CheckPPDetailsViewModel {
  heading: string
  pageCaption: string
  subHeading: string
  backLinkArgs: GovukFrontendBackLink
  buttonArgs: GovukFrontendButton
  insetText: string
  summaryListArgs: GovukFrontendSummaryList
  radioArgs: GovukFrontendRadios
}

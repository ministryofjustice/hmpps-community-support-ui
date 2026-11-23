import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type CheckPPDetailsContent = GlobalContent['referral']['taskList']['checkProbationPractitionerDetails']

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

import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional, YesWithDetailOrNo } from '../../@types/govukFrontend/derived'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type OffenceSentencePageContent = GlobalContent['/referral/task-list/offence-sentence']

export interface OffenceSentencePageViewModel {
  pageTitle: string
  heading: string
  crnLabel: string
  crn: string
  dateOfBirthLabel: string
  dateOfBirth: string
  pageSubHeader: string
  bodyText: string
  backLink: GovukFrontendBackLink
  submitHref: string
  button: GovukFrontendButton
  offenceSentenceCardHeading: string
  offenceSentenceSummary: GovukFrontendSummaryList
  radios: GovukFrontendRadiosWithConditional
  radios2: YesWithDetailOrNo
}

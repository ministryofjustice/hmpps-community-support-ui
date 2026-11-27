import type { GovukFrontendSummaryList, GovukFrontendButton, GovukFrontendBackLink } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type NotesCheckYourAnswersViewModel = {
  pageTitle: string
  pageHeader: string
  caseNoteDetailsSubHeader: string
  backLink: GovukFrontendBackLink
  summaryList: GovukFrontendSummaryList
  submitButton: GovukFrontendButton
  submitHref: string
}

export type NotesCheckYourAnswersContent = GlobalContent['referral']['id']['notes']['check-your-answers']

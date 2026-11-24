import type { GovukFrontendSummaryList, GovukFrontendButton } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type NotesCheckYourAnswersViewModel = {
  pageTitle: string
  pageHeader: string
  detailsSubHeader: string
  summaryList: GovukFrontendSummaryList
  submitButton: GovukFrontendButton
  submitHref: string
}

export type NotesCheckYourAnswersContent = GlobalContent['referral']['id']['notes']['check-your-answers']

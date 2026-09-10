import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface IssuesOrConcernsFormData {
  identified?: string
  notifyProbationPractitioner?: boolean
}

export type IssuesOrConcernsViewModel = {
  pageTitle: string
  pageHeader: string
  issuesOrConcerns: GovukFrontendTextarea
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
}

export type IssuesOrConcernsContent = GlobalContent['/ics-feedback/:id/issues-or-concerns']

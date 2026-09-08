import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'

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

export type IssuesOrConcernsContent = {
  pageTitle: string
  pageHeader: string
  issuesOrConcernsLabel: string
  issuesOrConcernsHint: string
  submitButtonText: string
  backLinkHref: string
}

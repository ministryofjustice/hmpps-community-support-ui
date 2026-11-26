import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface IssuesOrConcernsFormData {
  identified?: string
  notifyProbationPractitioner?: boolean
}

export interface NotifyProbationPractitionerRadioContent {
  title: string
  yesText: string
  noText: string
}

export type IssuesOrConcernsViewModel = {
  pageTitle: string
  pageHeader: string
  issuesOrConcerns: GovukFrontendTextarea
  notifyProbationPractitioner: GovukFrontendRadios
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
}

export type IssuesOrConcernsContent = GlobalContent['icsFeedback']['id']['issuesOrConcerns']

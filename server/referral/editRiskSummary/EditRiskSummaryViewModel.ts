import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendInsetText,
  GovukFrontendTextarea,
} from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface EditRiskSummaryFieldContent {
  id: string
  label: string
}

export interface EditRiskSummaryViewModel {
  pageTitle: string
  backLink: GovukFrontendBackLink
  heading: string
  subheading: string
  crnLabel: string
  crn: string
  dateOfBirthLabel: string
  dateOfBirth: string
  lastUpdatedInset: GovukFrontendInsetText
  textareas: GovukFrontendTextarea[]
  button: GovukFrontendButton
  submitHref: string
}

export type EditRiskSummaryContent = GlobalContent['/referral/task-list/edit-risk-summary']

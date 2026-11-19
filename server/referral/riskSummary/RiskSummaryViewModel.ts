import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type RiskSummaryRowCard = RiskSummaryContent['whoIsAtRiskCard']

export type RiskSummaryContent = GlobalContent['referral']['taskList']['viewRiskSummary']

export interface RiskSummaryRow {
  heading: string
  indicator?: string
  content: string
  changeLink: {
    href: string
    text: string
  }
}

export interface RiskSummaryViewModel {
  pageTitle: string
  backLink: GovukFrontendBackLink
  heading: string
  subheading: string
  crnLabel: string
  crn: string
  dateOfBirthLabel: string
  dateOfBirth: string
  lastUpdatedLabel: string
  lastUpdated: string
  rows: RiskSummaryRow[]
  button: GovukFrontendButton
}

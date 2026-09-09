import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type FoundPersonViewModel = {
  staticContent: FoundPersonContent
  personSummary: GovukFrontendSummaryList
  equalityMonitoring: GovukFrontendSummaryList
  additionalInformation: GovukFrontendSummaryList
  contactDetails: GovukFrontendSummaryList
  backLink: GovukFrontendBackLink
}

export type FoundPersonContent = GlobalContent['/referral/new/find-a-person']

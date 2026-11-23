import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ServiceDeliveryCheckYourAnswersViewModel = {
  pageTitle: string
  pageHeader: string
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  summaryLists: Array<ServiceDeliverySummary>
}

export type ServiceDeliveryCheckYourAnswersContent =
  GlobalContent['referral']['id']['actionPlan']['serviceDeliveryCheckYourAnswers']

export type ServiceDeliverySummary = {
  summaryList: GovukFrontendSummaryList
}

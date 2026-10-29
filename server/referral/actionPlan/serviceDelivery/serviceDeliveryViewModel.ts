import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'
import { ActionPlanSideNavContent } from '../actionPlanViewModel'
import { ReferralLayoutContent } from '../../referralLayout/referralLayoutViewModel'

export type ServiceDeliveryViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  updatedAtText: string
  addAnotherOutcomeButton: GovukFrontendButton
  subNavigationArgs: MojSubNavigation
  horizontalSubNavArgs?: MojSubNavigation
  serviceDeliverySummaryCard: GovukFrontendSummaryList
  risksAndAdjustmentsSummaryCard: GovukFrontendSummaryList
  serviceEndDateSummaryCard: GovukFrontendSummaryList
}

export type ServiceDeliveryContent = GlobalContent['/referral/:id/service-delivery'] &
  ReferralLayoutContent &
  ActionPlanSideNavContent

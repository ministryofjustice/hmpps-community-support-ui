import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { MojAlert, MojSubNavigation } from '@moj-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
import { ReferralLayoutContent } from '../referralLayout/referralLayoutViewModel'

export type ActionPlanSummaryList = GovukFrontendSummaryList & {
  preText: string
  moveUpButton?: GovukFrontendButton
  moveDownButton?: GovukFrontendButton
}

export type ActionPlanViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  updatedAtText: string
  needsSummary: ActionPlanSummaryList[]
  addAnotherOutcomeButton: GovukFrontendButton
  submitActionPlanButton: GovukFrontendButton
  createButton: GovukFrontendButton
  createLink: string
  noActionPlanText: string
  alert?: MojAlert
  subNavigationArgs: MojSubNavigation
  horizontalSubNavArgs?: MojSubNavigation
}

export type ActionPlanSideNavContent = Pick<
  GlobalContent['/referral/:id'],
  | 'sideNavigationLabel'
  | 'actionPlanSideTabText'
  | 'actionPlanSideTabHref'
  | 'serviceDeliverySideTabText'
  | 'serviceDeliverySideTabHref'
>

export type ActionPlanContent = GlobalContent['/referral/:id/action-plan'] &
  ReferralLayoutContent &
  ActionPlanSideNavContent

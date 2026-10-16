import { GovukFrontendButton, GovukFrontendInsetText } from '@govuk-frontend'
import { ActionPlanSummaryList } from '../actionPlanViewModel'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

type RemoveOutcomeContent = GlobalContent['/referral/:id/action-plan/remove-outcome']

export type ActionPlanRemoveOutcomeViewModel = {
  pageHeader: string
  needSummary: ActionPlanSummaryList
  warningInset: GovukFrontendInsetText
  removeOutcomeButton: GovukFrontendButton
  removeAction: string
  needId: string
  outcomeAnswerId: string
  cancelLink: { text: string; href: string }
}

export type ActionPlanRemoveOutcomeContent = RemoveOutcomeContent

import { GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

type RemoveActivityContent = GlobalContent['/referral/:id/action-plan/activities/:activityIndex/remove']

export type ActionPlanRemoveActivityViewModel = {
  pageHeader: string
  activitySummary: GovukFrontendSummaryList
  removeButton: GovukFrontendButton
  removeAction: string
  cancelLink: { text: string; href: string }
}

export type ActionPlanRemoveActivityContent = RemoveActivityContent

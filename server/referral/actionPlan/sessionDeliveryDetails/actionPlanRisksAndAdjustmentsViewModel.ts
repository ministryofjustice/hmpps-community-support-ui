import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'
import { GovukFrontendRadiosWithConditional } from '../../../@types/govukFrontend/derived'

export type ActionPlanRisksAndAdjustmentsViewModel = {
  pageTitle: string
  pageHeader: string
  backLink: GovukFrontendBackLink
  submitButton: GovukFrontendButton
  plannedActivitiesRiskRadioArgs: (riskInfoHtml: string) => GovukFrontendRadiosWithConditional
  plannedActivitiesAdjustmentsRadioArgs: (adjustmentInfoHtml: string) => GovukFrontendRadiosWithConditional
  riskInfoTextBoxArgs: GovukFrontendTextarea
  adjustmentInfoTextBoxArgs: GovukFrontendTextarea
}

export type ActionPlanRisksAndAdjustmentsContent = GlobalContent['/referral/:id/action-plan/risks-and-adjustments']

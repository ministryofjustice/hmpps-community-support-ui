import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendInsetText,
  GovukFrontendRadios,
  GovukFrontendTable,
} from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanViewActivitiesViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  selectedNeedAndOutcomeInset: GovukFrontendInsetText
  activitiesTable: GovukFrontendTable
  addAnotherActivityRadio: GovukFrontendRadios
  saveAndContinueButton: GovukFrontendButton
  saveAndContinueLink: string
}

export type ActionPlanViewActivitiesContent = GlobalContent['/referral/:id/action-plan/activities']

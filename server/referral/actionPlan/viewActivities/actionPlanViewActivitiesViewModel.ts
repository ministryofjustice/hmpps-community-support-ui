import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendInsetText,
  GovukFrontendRadios,
  GovukFrontendTable,
} from '@govuk-frontend'
import { MojAlert } from '@moj-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanViewActivitiesViewModel = {
  pageHeader: string
  alert?: MojAlert
  backLink: GovukFrontendBackLink
  selectedNeedAndOutcomeInset: GovukFrontendInsetText
  activitiesTable: GovukFrontendTable
  addAnotherActivityRadio: GovukFrontendRadios
  saveAndContinueButton: GovukFrontendButton
  saveAndContinueLink: string
}

export type ActionPlanViewActivitiesContent = GlobalContent['/referral/:id/action-plan/activities']

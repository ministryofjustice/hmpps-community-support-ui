import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface NextStepsFormData {
  plannedForNextSession?: string
  actionsBeforeNextSession?: string
}

export type NextStepsViewModel = {
  pageTitle: string
  pageHeader: string
  plannedForNextSession: GovukFrontendTextarea
  actionsBeforeNextSession: GovukFrontendTextarea
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
}

export type NextStepsContent = GlobalContent['/ics-feedback/:id/next-steps']

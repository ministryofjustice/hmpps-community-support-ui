import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendInsetText,
  GovukFrontendRadios,
} from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ServiceEndDateCheckViewModel = {
  pageTitle: string
  pageHeader: string
  backLink: GovukFrontendBackLink
  submitButton: GovukFrontendButton
  serviceEndDateCheckRadioArgs: GovukFrontendRadios
  insetTextArgs: GovukFrontendInsetText
}

export type ServiceEndDateCheckContent = GlobalContent['referral']['id']['actionPlan']['serviceEndDateCheck']

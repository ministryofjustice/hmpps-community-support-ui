import { GovukFrontendBackLink } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface ServiceEndDateFormValues {
  day?: string
  month?: string
  year?: string
  reason?: string
}

export interface ServiceEndDatePageViewModel {
  pageTitle: string
  pageHeader: string
  dateHint?: string
  reasonLabel: string
  continueButton: string
  backLink: GovukFrontendBackLink
  formValues: ServiceEndDateFormValues
}

export type ServiceEndDatePageContent = GlobalContent['/referral/task-list/service-end-date']

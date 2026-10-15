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
  hint: string
  dateLabel: string
  dateHint?: string
  reasonLabel: string
  reasonHint: string
  continueButton: string
  backLink: GovukFrontendBackLink
  formValues: ServiceEndDateFormValues
}

export type ServiceEndDatePageContent = GlobalContent['/referral/task-list/service-end-date']

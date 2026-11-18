import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendInput } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ServiceDaysPageContent = GlobalContent['/referral/task-list/service-days']

export interface ServiceDaysPageViewModel {
  pageTitle: string
  pageHeader: string
  bodyText1: string
  backLink: GovukFrontendBackLink
  button: GovukFrontendButton
  input: GovukFrontendInput
}

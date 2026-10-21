import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface SelectAreaViewModel {
  pageTitle: string
  heading: string
  pageCaption: string
  radioArgs: GovukFrontendRadios
  backLinkArgs: GovukFrontendBackLink
  buttonArgs: GovukFrontendButton
}

export type SelectAreaContent = GlobalContent['/referral/task-list/select-an-area-for-referral']

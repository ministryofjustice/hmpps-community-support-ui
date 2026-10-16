import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendCheckboxesWithConditional } from '../../@types/govukFrontend/derived'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface PersonNeedsViewModel {
  pageTitle: string
  backLink: GovukFrontendBackLink
  heading: string
  checkboxes: GovukFrontendCheckboxesWithConditional
  submitButton: GovukFrontendButton
  submitHref: string
}

export type PersonNeedsContent = GlobalContent['/referral/task-list/select-person-needs']

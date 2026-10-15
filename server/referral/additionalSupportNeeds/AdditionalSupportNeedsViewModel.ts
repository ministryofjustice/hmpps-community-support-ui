import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendCheckboxesWithConditional } from '../../@types/govukFrontend/derived'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface ItemContent {
  label: string
  hint: string
  detailsLabel: string
}

export interface AdditionalSuportNeedsViewModel {
  pageTitle: string
  heading: string
  checkList: GovukFrontendCheckboxesWithConditional
  button: GovukFrontendButton
  backLink: GovukFrontendBackLink
}

export type AdditionalSuportNeedsContent = GlobalContent['/referral/task-list/additional-support-needs']

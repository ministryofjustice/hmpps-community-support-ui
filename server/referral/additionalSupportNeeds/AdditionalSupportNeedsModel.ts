import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendCheckboxesWithConditional } from '../../@types/govukFrontend/derived'

export interface ItemContent {
  label: string
  hint: string
  detailsLabel: string
}
export interface AdditionalSuportNeedsContent {
  header: string
  hint: string
  items: ItemContent[]
  defaultItemLabel: string
  button: string
  backlink: string
}
export interface AdditionalSuportNeedsViewModel {
  heading: string
  checkList: GovukFrontendCheckboxesWithConditional
  button: GovukFrontendButton
  backLink: GovukFrontendBackLink
}

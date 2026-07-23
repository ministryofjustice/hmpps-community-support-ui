import { GovukFrontendButton, GovukFrontendCheckboxes } from '@govuk-frontend'

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
}
export interface AdditionalSuportNeedsViewModel {
  heading: string
  checkList: GovukFrontendCheckboxes
  button: GovukFrontendButton
}

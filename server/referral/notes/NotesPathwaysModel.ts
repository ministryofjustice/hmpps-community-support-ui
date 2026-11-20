import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendCheckboxes } from '@govuk-frontend'

export interface NotesPathwaysModel {
  pageHeader: string
  checkboxes: GovukFrontendCheckboxes
  button: GovukFrontendButton
  backLink: GovukFrontendBackLink
}

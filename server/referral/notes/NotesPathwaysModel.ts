import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendCheckboxes } from '@govuk-frontend'

export interface NotesPathwaysModel {
  pageTitle: string
  pageHeader: string
  checkboxes: GovukFrontendCheckboxes
  button: GovukFrontendButton
  backLink: GovukFrontendBackLink
}

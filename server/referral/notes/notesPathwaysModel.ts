import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendCheckboxes } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'


export interface NotesPathwaysModel {
  pageTitle: string
  pageHeader: string
  checkboxes: GovukFrontendCheckboxes
  button: GovukFrontendButton
  backLink: GovukFrontendBackLink
}

export type NotesPathwaysContent = GlobalContent['referral']['id']['notes']['pathways']

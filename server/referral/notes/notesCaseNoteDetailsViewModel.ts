import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendCharacterCount,
  GovukFrontendInput,
  GovukFrontendRadios,
} from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type NotesCaseNoteDetailsViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  titleInput: GovukFrontendInput
  detailsCharacterCount: GovukFrontendCharacterCount
  shouldNotifyRadio: GovukFrontendRadios
  continueButton: GovukFrontendButton
  continueButtonLink: string
}

export type NotesCaseNoteDetailsContent = GlobalContent['referral']['id']['notes']['case-note-details']

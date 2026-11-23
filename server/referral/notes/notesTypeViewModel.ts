import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendDetails, GovukFrontendRadios } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type NotesTypeViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  description: string
  details: GovukFrontendDetails
  noteTypeRadio: GovukFrontendRadios
  continueButton: GovukFrontendButton
  continueButtonLink: string
}

export type NotesTypeContent = GlobalContent['referral']['id']['notes']['type']

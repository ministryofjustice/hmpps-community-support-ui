import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'

export type CommunityServiceProviderViewModel = {
  backLink: GovukFrontendBackLink
  radios: GovukFrontendRadios
  button: GovukFrontendButton
}

export type CommunityServiceProviderContent = {
  pageHeader: string
  continueButtonText: string
}

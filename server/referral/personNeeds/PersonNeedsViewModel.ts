import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendCheckboxesWithConditional } from '../../@types/govukFrontend/derived'

export interface PersonNeedsContent {
  pageHeader: string
  hint: string
  checkboxes: {
    accommodationLabel: string
    accommodationHint: string
    employmentLabel: string
    employmentHint: string
    financesLabel: string
    financesHint: string
    relationshipsLabel: string
    relationshipsHint: string
    drugUseLabel: string
    drugUseHint: string
    alcoholUseLabel: string
    alcoholUseHint: string
    healthLabel: string
    healthHint: string
    thinkingLabel: string
    thinkingHint: string
  }
  submitButton: string
  backLink: string
}

export interface PersonNeedsViewModel {
  backLink: GovukFrontendBackLink
  heading: string
  checkboxes: GovukFrontendCheckboxesWithConditional
  submitButton: GovukFrontendButton
  submitHref: string
}

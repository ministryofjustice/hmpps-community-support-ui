import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendInsetText,
  GovukFrontendTextarea,
} from '@govuk-frontend'

export interface EditRiskSummaryFieldContent {
  id: string
  label: string
}

export interface EditRiskSummaryContent {
  pageHeader: string
  backLink: string
  crnLabel: string
  dateOfBirthLabel: string
  lastUpdatedLabel: string
  defaultFieldValue: string
  yesText: string
  noText: string
  dontKnowText: string
  noAdditionalInformationText: string
  submitHref: string
  buttonText: string
  whoIsAtRiskField: EditRiskSummaryFieldContent
  natureOfRiskField: EditRiskSummaryFieldContent
  riskImminenceField: EditRiskSummaryFieldContent
  selfHarmField: EditRiskSummaryFieldContent
  suicideField: EditRiskSummaryFieldContent
  hostelSettingField: EditRiskSummaryFieldContent
  vulnerabilityField: EditRiskSummaryFieldContent
  additionalInformationField: EditRiskSummaryFieldContent
}

export interface EditRiskSummaryViewModel {
  backLink: GovukFrontendBackLink
  heading: string
  subheading: string
  crnLabel: string
  crn: string
  dateOfBirthLabel: string
  dateOfBirth: string
  lastUpdatedInset: GovukFrontendInsetText
  textareas: GovukFrontendTextarea[]
  button: GovukFrontendButton
  submitHref: string
}

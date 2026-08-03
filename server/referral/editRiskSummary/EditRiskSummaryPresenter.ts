import { Response } from 'express'
import { differenceInYears } from 'date-fns'
import { CommunitySupportRiskDto, ArnsRiskDto } from '@community-support-api'
import { GovukFrontendTextarea } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import dateFormat from '../../utils/dateFormat'
import {
  EditRiskSummaryContent,
  EditRiskSummaryFieldContent,
  EditRiskSummaryViewModel,
} from './EditRiskSummaryViewModel'

const nonEmptyStringOrDefault = (str: string | undefined | null, defaultValue: string): string =>
  (str ?? '').trim() || defaultValue

export default class EditRiskSummaryPresenter extends PresenterBase<EditRiskSummaryViewModel, EditRiskSummaryContent> {
  constructor(private readonly risk: CommunitySupportRiskDto) {
    super()
  }

  private getFullName(): string {
    const { firstName, lastName } = this.risk
    return `${firstName} ${lastName}`
  }

  private concernIndicator(risk: ArnsRiskDto | null | undefined, content: EditRiskSummaryContent): string {
    switch (risk?.risk) {
      case 'YES':
        return content.yesText
      case 'NO':
        return content.noText
      case 'DK':
        return content.dontKnowText
      default:
        return content.defaultFieldValue
    }
  }

  private buildTextarea(
    field: EditRiskSummaryFieldContent,
    value: string,
    hint: string | undefined,
  ): GovukFrontendTextarea {
    return {
      id: field.id,
      name: field.id,
      label: { text: field.label, classes: 'govuk-label--m govuk-heading-m' },
      value,
      hint: hint ? { text: hint, classes: 'govuk-body' } : null,
    }
  }

  private buildConcernTextarea(
    field: EditRiskSummaryFieldContent,
    risk: ArnsRiskDto | null | undefined,
    content: EditRiskSummaryContent,
  ): GovukFrontendTextarea {
    const value = risk?.currentConcernsText ?? ''
    return this.buildTextarea(field, value, this.concernIndicator(risk, content))
  }

  private buildTextareas(content: EditRiskSummaryContent): GovukFrontendTextarea[] {
    const { summary, riskToSelf } = this.risk

    return [
      this.buildTextarea(content.whoIsAtRiskField, summary?.whoIsAtRisk ?? '', undefined),
      this.buildTextarea(content.natureOfRiskField, summary?.natureOfRisk ?? '', undefined),
      this.buildTextarea(content.riskImminenceField, summary?.riskImminence ?? '', undefined),
      this.buildConcernTextarea(content.selfHarmField, riskToSelf?.selfHarm, content),
      this.buildConcernTextarea(content.suicideField, riskToSelf?.suicide, content),
      this.buildConcernTextarea(content.hostelSettingField, riskToSelf?.hostelSetting, content),
      this.buildConcernTextarea(content.vulnerabilityField, riskToSelf?.vulnerability, content),
      this.buildTextarea(
        content.additionalInformationField,
        this.risk.additionalInformation ?? '',
        this.risk.additionalInformation ? undefined : content.noAdditionalInformationText,
      ),
    ]
  }

  buildViewModel(res: Response): EditRiskSummaryViewModel {
    const content = this.buildStaticContent(res)
    const { crn, dateOfBirth } = this.risk
    const dobDate = new Date(dateOfBirth)
    const age = differenceInYears(new Date(), dobDate)

    return {
      backLink: { href: content.backLink },
      heading: this.getFullName(),
      subheading: content.pageHeader,
      crnLabel: content.crnLabel,
      crn: nonEmptyStringOrDefault(crn, content.defaultFieldValue),
      dateOfBirthLabel: content.dateOfBirthLabel,
      dateOfBirth: `${dateFormat(dobDate)} (${age} years old)`,
      lastUpdatedLabel: content.lastUpdatedLabel,
      lastUpdated: this.risk.assessedOn ? dateFormat(new Date(this.risk.assessedOn)) : content.defaultFieldValue,
      textareas: this.buildTextareas(content),
      button: {
        text: content.buttonText,
        preventDoubleClick: true,
        type: 'submit',
      },
      submitHref: content.submitHref,
    }
  }

  getTemplatePath(): string {
    return 'referral/editRiskSummary'
  }
}

import { Response } from 'express'
import { differenceInYears } from 'date-fns'
import { CommunitySupportRiskDto, ArnsRiskDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import dateFormat from '../../utils/dateFormat'
import { RiskSummaryContent, RiskSummaryRow, RiskSummaryRowCard, RiskSummaryViewModel } from './RiskSummaryViewModel'

const nonEmptyStringOrDefault = (str: string | undefined | null, defaultValue: string): string =>
  (str ?? '').trim() || defaultValue

export default class RiskSummaryPresenter extends PresenterBase<RiskSummaryViewModel, RiskSummaryContent> {
  constructor(
    private readonly risk: CommunitySupportRiskDto,
    private readonly referralId: string,
  ) {
    super()
  }

  private getFullName(): string {
    const { firstName, lastName } = this.risk
    return `${firstName} ${lastName}`
  }

  private concernIndicator(risk: ArnsRiskDto | null | undefined, content: RiskSummaryContent): string {
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

  private buildRow(
    card: RiskSummaryRowCard,
    text: string,
    content: RiskSummaryContent,
    anchor: string,
  ): RiskSummaryRow {
    return {
      heading: card.heading,
      content: text,
      changeLink: { href: `${content.changeHref}#${anchor}`, text: card.changeLinkText },
    }
  }

  private buildConcernRow(
    card: RiskSummaryRowCard,
    risk: ArnsRiskDto | null | undefined,
    content: RiskSummaryContent,
    anchor: string,
  ): RiskSummaryRow {
    return {
      heading: card.heading,
      indicator: this.concernIndicator(risk, content),
      content: risk?.currentConcernsText?.trim() ?? '',
      changeLink: { href: `${content.changeHref}#${anchor}`, text: card.changeLinkText },
    }
  }

  private buildRows(content: RiskSummaryContent): RiskSummaryRow[] {
    const { summary, riskToSelf } = this.risk

    return [
      this.buildRow(
        content.whoIsAtRiskCard,
        nonEmptyStringOrDefault(summary?.whoIsAtRisk, content.defaultFieldValue),
        content,
        'riskSummaryWhoIsAtRisk',
      ),
      this.buildRow(
        content.natureOfRiskCard,
        nonEmptyStringOrDefault(summary?.natureOfRisk, content.defaultFieldValue),
        content,
        'riskSummaryNatureOfRisk',
      ),
      this.buildRow(
        content.riskImminenceCard,
        nonEmptyStringOrDefault(summary?.riskImminence, content.defaultFieldValue),
        content,
        'riskSummaryRiskImminence',
      ),
      this.buildConcernRow(content.selfHarmCard, riskToSelf?.selfHarm, content, 'riskToSelfSelfHarm'),
      this.buildConcernRow(content.suicideCard, riskToSelf?.suicide, content, 'riskToSelfSuicide'),
      this.buildConcernRow(content.hostelSettingCard, riskToSelf?.hostelSetting, content, 'riskToSelfHostelSetting'),
      this.buildConcernRow(content.vulnerabilityCard, riskToSelf?.vulnerability, content, 'riskToSelfVulnerability'),
      this.buildRow(
        content.additionalInformationCard,
        nonEmptyStringOrDefault(this.risk.additionalInformation, content.noAdditionalInformationText),
        content,
        'additionalInformation',
      ),
    ]
  }

  buildViewModel(res: Response): RiskSummaryViewModel {
    const content = this.buildStaticContent(res)
    const { crn, dateOfBirth } = this.risk
    const dobDate = new Date(dateOfBirth)
    const age = differenceInYears(new Date(), dobDate)

    return {
      backLink: { href: content.backLink },
      heading: this.getFullName(),
      subheading: content.pageSubHeader,
      crnLabel: content.crnLabel,
      crn: nonEmptyStringOrDefault(crn, content.defaultFieldValue),
      dateOfBirthLabel: content.dateOfBirthLabel,
      dateOfBirth: `${dateFormat(dobDate)} (${age} years old)`,
      lastUpdatedLabel: content.lastUpdatedLabel,
      lastUpdated: this.risk.assessedOn ? dateFormat(new Date(this.risk.assessedOn)) : content.defaultFieldValue,
      rows: this.buildRows(content),
      button: {
        text: content.buttonText,
        preventDoubleClick: true,
        type: 'submit',
      },
    }
  }

  getTemplatePath(): string {
    return 'referral/riskSummary'
  }
}

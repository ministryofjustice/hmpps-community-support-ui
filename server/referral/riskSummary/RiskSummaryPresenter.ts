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

  private describeConcern(risk: ArnsRiskDto | null | undefined, content: RiskSummaryContent): string {
    if (!risk || !risk.risk || risk.risk === 'NO') {
      return content.noConcernsText
    }
    if (risk.risk === 'DK') {
      return content.dontKnowText
    }
    return risk.currentConcernsText || content.noConcernsText
  }

  private buildRow(card: RiskSummaryRowCard, text: string, content: RiskSummaryContent): RiskSummaryRow {
    return {
      heading: card.heading,
      content: text,
      changeLink: { href: content.changeHref, text: card.changeLinkText },
    }
  }

  private buildRows(content: RiskSummaryContent): RiskSummaryRow[] {
    const { summary, riskToSelf } = this.risk

    return [
      this.buildRow(
        content.whoIsAtRiskCard,
        nonEmptyStringOrDefault(summary?.whoIsAtRisk, content.defaultFieldValue),
        content,
      ),
      this.buildRow(
        content.natureOfRiskCard,
        nonEmptyStringOrDefault(summary?.natureOfRisk, content.defaultFieldValue),
        content,
      ),
      this.buildRow(
        content.riskImminenceCard,
        nonEmptyStringOrDefault(summary?.riskImminence, content.defaultFieldValue),
        content,
      ),
      this.buildRow(content.selfHarmCard, this.describeConcern(riskToSelf?.selfHarm, content), content),
      this.buildRow(content.suicideCard, this.describeConcern(riskToSelf?.suicide, content), content),
      this.buildRow(content.hostelSettingCard, this.describeConcern(riskToSelf?.hostelSetting, content), content),
      this.buildRow(content.vulnerabilityCard, this.describeConcern(riskToSelf?.vulnerability, content), content),
      this.buildRow(
        content.additionalInformationCard,
        !riskToSelf?.custody || riskToSelf.custody.risk === 'NO'
          ? content.noAdditionalInformationText
          : this.describeConcern(riskToSelf.custody, content),
        content,
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

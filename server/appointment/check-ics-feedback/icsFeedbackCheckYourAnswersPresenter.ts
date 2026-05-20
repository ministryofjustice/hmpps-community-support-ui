import { Response } from 'express'
import { IcsFeedbackSubmission } from '@community-support-api'
import { GovukFrontendSummaryListRow } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  SummaryListWithTitle,
  IcsFeedbackCheckYourAnswersContent,
  IcsFeedbackCheckYourAnswersViewModel,
  IcsFeedbackSummaryListContent,
} from './icsFeedbackCheckYourAnswersViewModel'

export default class IcsFeedbackCheckYourAnswersPresenter extends PresenterBase<
  IcsFeedbackCheckYourAnswersViewModel,
  IcsFeedbackCheckYourAnswersContent
> {
  constructor(
    private readonly icsFeedbackSubmission: IcsFeedbackSubmission,
    private readonly caseRefId: string,
    private readonly firstName: string,
  ) {
    super()
  }

  protected buildPageContent(res: Response) {
    const content = this.buildStaticContent(res)
    return {
      ...content,
      submitHref: content.submitHref.replace('caseRefId', this.caseRefId),
      feedbackSummarys: this.buildFeedbackSummaries(content),
      backLink: { href: content.backLinkHref.replace('caseRefId', this.caseRefId) },
    } as IcsFeedbackCheckYourAnswersViewModel
  }

  protected getTemplatePath(): string {
    return 'appointment/icsFeedbackCheck'
  }

  private buildSummary(content: IcsFeedbackSummaryListContent, values: Array<string>): SummaryListWithTitle {
    return {
      summaryTitle: content.summaryTitle,
      rows: content.rows
        .map((row, index) => {
          if (!values[index]) {
            return null
          }
          return {
            key: {
              text: row.text.includes('firstname') ? row.text.replace('firstname', this.firstName) : row.text,
            },
            value: {
              text: values[index],
              html: row.text === 'Location' ? values[index] : null,
            },
            actions: {
              items: [
                {
                  href: row.changeHref.replace('caseRefId', this.caseRefId),
                  text: 'Change',
                },
              ],
            },
            hint: row.hint,
          }
        })
        .filter(row => row !== null) as GovukFrontendSummaryListRow[],
    }
  }

  private buildFeedbackSummaries(content: IcsFeedbackCheckYourAnswersContent): Array<SummaryListWithTitle> {
    const summaries = [
      // Session attendance summary
      this.buildSummary(content.summaryLists.filter(item => item.summaryTitle === 'Record session attendance')[0], [
        this.icsFeedbackSubmission.record.didPersonAttend ? 'Yes' : 'No',
        this.getSessionMethodString(this.icsFeedbackSubmission.record.howSessionTookPlace?.type) || null,
        this.wasSessionInPerson(this.icsFeedbackSubmission.record.howSessionTookPlace?.type)
          ? this.formatAddress(this.icsFeedbackSubmission.record.howSessionTookPlace)
          : null,
        this.icsFeedbackSubmission.record.howSessionTookPlace?.additionalDetails || null,
      ]),
      // Session details summary
      this.buildSummary(content.summaryLists.filter(item => item.summaryTitle === 'Session details')[0], [
        this.icsFeedbackSubmission.sessionDetails?.wasPersonLate ? 'Yes' : 'No',
        this.icsFeedbackSubmission.sessionDetails?.lateReason || null,
        this.icsFeedbackSubmission.sessionDetails?.duration
          ? this.buildSessionLength(
              this.icsFeedbackSubmission.sessionDetails?.duration.hours,
              this.icsFeedbackSubmission.sessionDetails?.duration.hours,
            )
          : null,
      ]),
      // Session feedback summary
      this.buildSummary(content.summaryLists.filter(item => item.summaryTitle === 'Session feedback')[0], [
        this.icsFeedbackSubmission.sessionFeedback.whatHappened,
      ]),
    ]
    return summaries.filter(summary => summary !== null) as Array<SummaryListWithTitle>
  }

  private buildSessionLength(hours: number, minutes: number): string {
    if (hours > 0) {
      const hoursString = hours === 1 ? `${hours} hour` : `${hours} hours`
      const minutesString = minutes ? ` and ${minutes} minutes` : ''
      return `${hoursString}${minutesString}`
    }
    return `${minutes} minutes`
  }

  private wasSessionInPerson(type: string): boolean {
    const inPersonTypes = ['IN_PERSON_PROBATION_OFFICE', 'IN_PERSON_OTHER_LOCATION']
    return inPersonTypes.includes(type)
  }

  private formatAddress(addressDetails: IcsFeedbackSubmission['record']['howSessionTookPlace']): string {
    if (addressDetails.pdu) {
      return addressDetails.pdu
    }
    const { addressLine1, addressLine2, townOrCity, county, postcode } = addressDetails
    const addressLines = { addressLine1, addressLine2, townOrCity, county, postcode }
    return Object.values(addressLines).join('<br />')
  }

  private getSessionMethodString(type: IcsFeedbackSubmission['record']['howSessionTookPlace']['type']): string | null {
    switch (type) {
      case 'IN_PERSON_OTHER_LOCATION':
        return 'Other Location'
      case 'OTHER_LOCATION':
        return 'Other Location'
      case 'IN_PERSON_PROBATION_OFFICE':
        return 'Probation Office'
      case 'PHONE':
        return 'Phone call'
      case 'VIDEO':
        return 'Video call'
      default:
        return null
    }
  }
}

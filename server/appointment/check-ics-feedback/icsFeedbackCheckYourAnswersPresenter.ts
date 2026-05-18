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
  ) {
    super()
  }

  protected buildPageContent(res: Response) {
    const content = this.buildStaticContent(res)
    console.log(content)
    return {
      ...content,
      submitHref: content.submitHref.replace('caseRefId', this.caseRefId),
      feedbackSummarys: this.buildFeedbackSummaries(content),
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
              text: row.text,
            },
            value: {
              text: values[index],
            },
            hint: row.hint,
            attributes: {
              'data-testid': `${index}-row`,
            },
          }
        })
        .filter(row => row !== null) as GovukFrontendSummaryListRow[],
    }
  }

  private buildFeedbackSummaries(content: IcsFeedbackCheckYourAnswersContent): Array<SummaryListWithTitle> {
    console.log(content.summaryLists)
    const summaries = [
      // Session attendance summary
      this.buildSummary(content.summaryLists.filter(item => item.summaryTitle === 'Record session attendance')[0], [
        this.icsFeedbackSubmission.record.didPersonAttend ? 'Yes' : 'No',
        this.icsFeedbackSubmission.record.howSessionTookPlace?.type || null,
        this.icsFeedbackSubmission.record.howSessionTookPlace?.additionalDetails || null,
      ]),
      // Session details summary
      this.buildSummary(content.summaryLists.filter(item => item.summaryTitle === 'Session details')[0], [
        this.icsFeedbackSubmission.sessionDetails.wasPersonLate ? 'Yes' : 'No',
        this.icsFeedbackSubmission.sessionDetails.lateReason || null,
        this.icsFeedbackSubmission.sessionDetails.duration
          ? this.buildSessionLength(
              this.icsFeedbackSubmission.sessionDetails.duration.hours,
              this.icsFeedbackSubmission.sessionDetails.duration.hours,
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
}

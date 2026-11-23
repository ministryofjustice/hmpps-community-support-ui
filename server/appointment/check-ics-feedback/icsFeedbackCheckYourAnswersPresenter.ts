import { IcsFeedbackSubmission } from '@community-support-api'
import { GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  IcsFeedbackCheckYourAnswersContent,
  IcsFeedbackCheckYourAnswersViewModel,
  IcsFeedbackSummaryListContent,
} from './icsFeedbackCheckYourAnswersViewModel'

export default class IcsFeedbackCheckYourAnswersPresenter extends PresenterBase<IcsFeedbackCheckYourAnswersViewModel> {
  constructor(
    private readonly icsFeedbackSubmission: IcsFeedbackSubmission,
    private readonly caseRefId: string,
    private readonly firstName: string,
  ) {
    super()
  }

  buildViewModel() {
    const content = this.globalContent().icsFeedback.id.checkAnswers
    return {
      ...content,
      pageHeader: this.replacePlaceholders(content.pageHeader),
      submitHref: content.submitHref.replace('caseRefId', this.caseRefId),
      feedbackSummaries: this.buildFeedbackSummaries(content),
      backLink: { href: this.getBackLinkHref(content) },
    } as IcsFeedbackCheckYourAnswersViewModel
  }

  protected getTemplatePath(): string {
    return 'appointment/icsFeedbackCheck'
  }

  private buildSummary(
    content: IcsFeedbackSummaryListContent,
    values: Array<string>,
    shouldDisplay = true,
  ): GovukFrontendSummaryList | null {
    return shouldDisplay
      ? {
          card: {
            title: { text: this.replacePlaceholders(content.summaryTitle) },
          },
          rows: content.rows
            .map((row, index) => {
              if (!values[index]) {
                return null
              }

              return {
                key: {
                  text: this.replacePlaceholders(row.text),
                },
                value: {
                  text: values[index],
                  html:
                    row.text === 'New support needs identified' ||
                    row.text === 'Location' ||
                    row.text.includes('not happen')
                      ? values[index]
                      : null,
                },
                actions: {
                  items: [
                    {
                      href: row.changeHref.replace('caseRefId', this.caseRefId),
                      text: 'Change',
                      visuallyHiddenText: this.replacePlaceholders(row.hint),
                    },
                  ],
                },
              }
            })
            .filter(row => row !== null) as GovukFrontendSummaryListRow[],
        }
      : null
  }

  private buildFeedbackSummaries(content: IcsFeedbackCheckYourAnswersContent): Array<GovukFrontendSummaryList> {
    console.log('content', JSON.stringify(content.summaryLists, null, 2))
    const summaries = [
      // Session attendance summary
      this.buildSummary(content.summaryLists.filter(item => item.summaryTitle === '{{session}} attendance')[0], [
        this.icsFeedbackSubmission.record.didSessionHappen ? 'Yes' : 'No',
        this.getPersonAttendanceString(),
        this.getSessionMethodString(this.icsFeedbackSubmission.record.howSessionTookPlace?.type) || null,
        this.wasSessionInPerson(this.icsFeedbackSubmission.record.howSessionTookPlace?.type)
          ? this.formatAddress(this.icsFeedbackSubmission.record.howSessionTookPlace)
          : null,
        this.icsFeedbackSubmission.record.howSessionTookPlace?.additionalDetails || null,
        this.getDidNotHappenReason(content) || null,
        this.getHowDidYouContactAnswer() || null,
        this.getDidNotAttendReason() || null,
      ]),
      // Session details summary
      this.buildSummary(
        content.summaryLists.filter(item => item.summaryTitle === 'Session details')[0],
        [
          this.icsFeedbackSubmission.sessionDetails?.wasPersonLate ? 'Yes' : 'No',
          this.icsFeedbackSubmission.sessionDetails?.lateReason || null,
          this.icsFeedbackSubmission.sessionDetails?.duration
            ? this.buildSessionLength(
                this.icsFeedbackSubmission.sessionDetails?.duration.hours,
                this.icsFeedbackSubmission.sessionDetails?.duration.minutes,
              )
            : null,
        ],
        this.icsFeedbackSubmission.record.didSessionHappen,
      ),
      // Session feedback summary
      this.buildSummary(
        content.summaryLists.filter(item => item.summaryTitle === 'Session feedback')[0],
        [
          this.icsFeedbackSubmission.sessionFeedback?.whatHappened || null,
          this.icsFeedbackSubmission.sessionFeedback?.behaviour || null,
          this.icsFeedbackSubmission.sessionFeedback?.strengthsIdentified || null,
        ],
        this.icsFeedbackSubmission.record.didSessionHappen,
      ),
      // Issues or concerns
      this.buildSummary(
        content.summaryLists.filter(item => item.summaryTitle === 'Issues or concerns')[0],
        [this.icsFeedbackSubmission.issuesAndConcerns?.identified || null],
        !!this.icsFeedbackSubmission.issuesAndConcerns,
      ),
      // Additional support needs summary
      this.buildSummary(
        content.summaryLists.filter(item => item.summaryTitle === 'Additional support needs')[0],
        [
          `<p>${this.icsFeedbackSubmission.newlyIdentifiedAdditionalSupportNeeds !== null ? 'Yes' : 'None'}</p>`.concat(
            this.icsFeedbackSubmission.newlyIdentifiedAdditionalSupportNeeds !== null
              ? `<p>${this.icsFeedbackSubmission.newlyIdentifiedAdditionalSupportNeeds}</p>`
              : '',
          ),
        ],
        this.icsFeedbackSubmission.record.didSessionHappen,
      ),
      // Next steps
      this.buildSummary(
        content.summaryLists.filter(item => item.summaryTitle === 'Next steps')[0],
        [
          this.icsFeedbackSubmission.nextSteps?.plannedForNextSession || null,
          this.icsFeedbackSubmission.nextSteps?.actionsBeforeNextSession || null,
        ],
        !!this.icsFeedbackSubmission.nextSteps,
      ),
    ]
    return summaries.filter(summary => summary !== null) as Array<GovukFrontendSummaryList>
  }

  private buildSessionLength(hours: number, minutes: number): string {
    if (hours > 0) {
      const hoursString = hours === 1 ? `${hours} hour` : `${hours} hours`
      const minutesString = minutes ? ` and ${minutes} minutes` : ''
      return `${hoursString}${minutesString}`
    }
    return `${minutes} minutes`
  }

  private getPersonAttendanceString(): string | null {
    if (!this.icsFeedbackSubmission.record.didSessionHappen) {
      return this.icsFeedbackSubmission.record.didPersonAttend ? 'Yes' : 'No'
    }
    return null
  }

  private getDidNotHappenReason(content: IcsFeedbackCheckYourAnswersContent): string | null {
    if (!this.icsFeedbackSubmission.record.didSessionHappen) {
      if (this.icsFeedbackSubmission.record.didPersonAttend) {
        const { sessionNotHappenReason } = this.icsFeedbackSubmission.record
        const details = sessionNotHappenReason?.details
        let reasonText: string
        switch (sessionNotHappenReason?.reason) {
          case 'REFERRAL_DID_NOT_COMPLY':
            reasonText = content.didNotHappenReasonLabels.referralDidNotComply.replace(
              '{{ firstname }}',
              this.firstName,
            )
            break
          case 'REFERRAL_COULD_NOT_TAKE_PART':
            reasonText = content.didNotHappenReasonLabels.referralCouldNotTakePart.replace(
              '{{ firstname }}',
              this.firstName,
            )
            break
          case 'SERVICE_PROVIDER_ISSUE':
            reasonText = content.didNotHappenReasonLabels.serviceProviderIssue
            break
          default:
            reasonText = sessionNotHappenReason?.reason || ''
        }
        return details ? `${reasonText}<br /><br /> ${details}` : reasonText
      }
      return null
    }
    return null
  }

  private getDidNotAttendReason(): string | null {
    if (!this.icsFeedbackSubmission.record.didSessionHappen && !this.icsFeedbackSubmission.record.didPersonAttend) {
      return this.icsFeedbackSubmission.record.reasonsTheyDidNotAttend
    }
    return null
  }

  private getHowDidYouContactAnswer(): string | null {
    if (!this.icsFeedbackSubmission.record.didSessionHappen && !this.icsFeedbackSubmission.record.didPersonAttend) {
      return this.icsFeedbackSubmission.record.howTheyTriedToContactThePerson
    }
    return null
  }

  private getBackLinkHref(content: IcsFeedbackCheckYourAnswersContent): string {
    if (!this.icsFeedbackSubmission.record.didSessionHappen && this.icsFeedbackSubmission.record.didPersonAttend) {
      return content.noSessionbackLinkHref.replace('caseRefId', this.caseRefId)
    }
    if (!this.icsFeedbackSubmission.record.didPersonAttend && !this.icsFeedbackSubmission.record.didSessionHappen) {
      return content.didNotAttendbackLinkHref.replace('caseRefId', this.caseRefId)
    }
    return content.attendedBackLinkHref.replace('caseRefId', this.caseRefId)
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

  private replacePlaceholders(text: string): string {
    return text.replace(/{{\s*firstname\s*}}/gi, this.firstName).replace(/{{\s*session\s*}}/gi, 'ICS')
  }
}

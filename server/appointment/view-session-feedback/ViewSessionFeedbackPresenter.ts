import { Response } from 'express'
import {
  IcsFeedbackSubmissionResponse,
  CaseWorkerSummary,
  SessionFeedbackAppointmentDetails,
} from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ViewSessionFeedbackContent, ViewSessionFeedbackViewModel } from './ViewSessionFeedbackViewModel'
import { isoToFormattedDate } from '../../utils/dateFormat'
import { isoToFormattedTime } from '../../utils/timeFormat'
import { createMailtoLink } from '../../utils/viewUtils'
import { getInformedByLabel } from '../informedByLabels'

type AppointmentDeliveryDetails = SessionFeedbackAppointmentDetails['appointmentDeliveryDetails']

export interface AppointmentDetailsSummaryRowInput {
  content: ViewSessionFeedbackContent['appointmentDetails']
  noneText: string
  currentCaseworkers: CaseWorkerSummary[]
  feedbackSubmittedBy: CaseWorkerSummary
  date: string
  startTime: string
  sessionMethod: string
  reasonForSessionNotInPerson?: string
  location?: string
  howWasUserInformedAboutSession: string
  personFirstName: string
}

export interface SessionDetailsSummaryRowInput {
  content: ViewSessionFeedbackContent['sessionDetails']
  noneText: string
  yesText: string
  noText: string
  isLate?: boolean | null
  whyWereTheyLate: string
  sessionDuration: string
  personFirstName: string
}

export interface RecordSessionAttendanceSummaryRowInput {
  content: ViewSessionFeedbackContent['recordSessionAttendance']
  noneText: string
  yesText: string
  noText: string
  didSessionHappen: boolean
  attendedAppointment?: boolean | null
  personFirstName: string
}

export interface AttendedSessionFeedbackRowInput {
  content: ViewSessionFeedbackContent['sessionFeedback']['attended']
  noneText: string
  whatHappenedInSession?: string
  behaviourIdentified?: string
  strengthsIdentified?: string
  personFirstName: string
}

export interface SessionDidNotHappenFeedbackRowInput {
  content: ViewSessionFeedbackContent['sessionFeedback']['sessionDidNotHappen']
  didNotHappenReasonLabels: ViewSessionFeedbackContent['didNotHappenReasonLabels']
  noneText: string
  whySessionDidNotHappen?: string
  whySessionDidNotHappenDetails?: string
  personFirstName: string
}

export interface DidNotAttendSessionFeedbackRowInput {
  content: ViewSessionFeedbackContent['sessionFeedback']['didNotAttend']
  noneText: string
  triedToContactDidNotAttend?: string
  personFirstName: string
}

const REMOTE_SESSION_METHODS = new Set(['Phone call', 'Video call'])

// const APPOINTMENT_DELIVERY_METHOD_DISPLAY: Record<string, string> = {
//   PHONE_CALL: 'Phone call',
//   VIDEO_CALL: 'Video call',
//   IN_PERSON_PROBATION_OFFICE: 'In person (probation office)',
//   IN_PERSON_OTHER_LOCATION: 'In person (other location)',
// }

export default class ViewSessionFeedbackPresenter extends PresenterBase<
  ViewSessionFeedbackViewModel,
  ViewSessionFeedbackContent
> {
  constructor(
    private readonly icsFeedbackSubmissionResponse: IcsFeedbackSubmissionResponse,
    private readonly caseRefId: string,
  ) {
    super()
  }

  buildViewModel(res: Response): ViewSessionFeedbackViewModel {
    const content = this.buildStaticContent(res)
    const didSessionHappen = this.icsFeedbackSubmissionResponse.recordSessionDidSessionHappen === true

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      backLink: { href: content.backLink.replace('{{ id }}', this.caseRefId) },
      appointmentDetailsSummary: this.buildAppointmentDetailsSummary(content),
      sessionDetailsSummary: didSessionHappen ? this.buildSessionDetailsSummary(content) : undefined,
      recordSessionAttendanceSummary: didSessionHappen ? undefined : this.buildRecordSessionAttendanceSummary(content),
      sessionFeedbackSummary: this.buildSessionFeedbackSummary(content),
      issuesAndConcernsSummary: didSessionHappen ? this.buildIssuesAndConcernsSummary(content) : undefined,
      additionalSupportNeedsSummary: didSessionHappen ? this.buildAdditionalSupportNeedsSummary(content) : undefined,
      nextStepsSummary: didSessionHappen ? this.buildNextStepsSummary(content) : undefined,
    }
  }

  getTemplatePath(): string {
    return 'appointment/viewSessionFeedback'
  }

  private formatSessionCommunication(input: string): string {
    return getInformedByLabel(input)
  }

  private formatLocation(parts: (string | null | undefined)[]): string | undefined {
    const location = parts.filter(Boolean).join(', ')
    return location || undefined
  }

  private buildLocation(
    recordedSessionMethod?: string,
    appointmentDelivery?: AppointmentDeliveryDetails,
  ): string | undefined {
    return (
      this.getRecordedSessionLocation(recordedSessionMethod) ?? this.getAppointmentDeliveryLocation(appointmentDelivery)
    )
  }

  private getRecordedSessionLocation(recordedSessionMethod?: string): string | undefined {
    if (recordedSessionMethod === 'In person (probation office)' && this.icsFeedbackSubmissionResponse.recordSessionPdu)
      return this.icsFeedbackSubmissionResponse.recordSessionPdu

    return this.formatLocation([
      this.icsFeedbackSubmissionResponse.recordSessionAddressLine1,
      this.icsFeedbackSubmissionResponse.recordSessionAddressLine2,
      this.icsFeedbackSubmissionResponse.recordSessionTownOrCity,
      this.icsFeedbackSubmissionResponse.recordSessionCounty,
      this.icsFeedbackSubmissionResponse.recordSessionPostcode,
    ])
  }

  private getAppointmentDeliveryLocation(appointmentDelivery?: AppointmentDeliveryDetails): string | undefined {
    if (appointmentDelivery?.method === 'IN_PERSON_PROBATION_OFFICE') return appointmentDelivery.methodDetails

    if (appointmentDelivery?.method === 'IN_PERSON_OTHER_LOCATION') {
      return this.formatLocation([
        appointmentDelivery.addressLine1,
        appointmentDelivery.addressLine2,
        appointmentDelivery.townOrCity,
        appointmentDelivery.county,
        appointmentDelivery.postcode,
      ])
    }

    return undefined
  }

  private buildAppointmentDetailsSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList {
    const {
      currentCaseworkers,
      feedbackSubmittedBy,
      startDateTime,
      appointmentDeliveryDetails,
      sessionCommunications,
      personFirstName,
    } = this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails

    const rows = buildAppointmentDetailsRows({
      content: content.appointmentDetails,
      noneText: content.noneText,
      currentCaseworkers,
      feedbackSubmittedBy,
      date: isoToFormattedDate(startDateTime),
      startTime: isoToFormattedTime(startDateTime),
      sessionMethod: this.icsFeedbackSubmissionResponse.recordSessionHowSessionTookPlace,
      reasonForSessionNotInPerson: this.icsFeedbackSubmissionResponse.recordSessionNotInPersonReason,
      location: this.buildLocation(
        this.icsFeedbackSubmissionResponse.recordSessionHowSessionTookPlace,
        appointmentDeliveryDetails,
      ),
      howWasUserInformedAboutSession:
        sessionCommunications?.map(c => this.formatSessionCommunication(c)).join(', ') ?? '',
      personFirstName,
    })

    return {
      card: { title: { text: content.appointmentDetails.title } },
      rows,
    }
  }

  private buildSessionDetailsSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList {
    const rows = buildSessionDetailsRows({
      content: content.sessionDetails,
      noneText: content.noneText,
      yesText: content.yesText,
      noText: content.noText,
      isLate: this.icsFeedbackSubmissionResponse.sessionDetailsWasPersonLate ?? null,
      whyWereTheyLate: this.icsFeedbackSubmissionResponse.sessionDetailsLateReason,
      sessionDuration: this.icsFeedbackSubmissionResponse.sessionDetailsDuration,
      personFirstName: this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
    })

    return {
      card: { title: { text: content.sessionDetails.title } },
      rows,
    }
  }

  private buildRecordSessionAttendanceSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList {
    const rows = buildRecordSessionAttendanceRows({
      content: content.recordSessionAttendance,
      noneText: content.noneText,
      yesText: content.yesText,
      noText: content.noText,
      didSessionHappen: this.icsFeedbackSubmissionResponse.recordSessionDidSessionHappen,
      attendedAppointment: this.icsFeedbackSubmissionResponse.recordSessionDidPersonAttend,
      personFirstName: this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
    })

    return {
      card: { title: { text: content.recordSessionAttendance.title } },
      rows,
    }
  }

  private buildSessionFeedbackSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList {
    const response = this.icsFeedbackSubmissionResponse
    const { personFirstName } = response.sessionFeedbackAppointmentDetails
    let rows: GovukFrontendSummaryList['rows']

    if (response.recordSessionDidSessionHappen) {
      rows = buildAttendedSessionFeedbackRows({
        content: content.sessionFeedback.attended,
        noneText: content.noneText,
        whatHappenedInSession: response.sessionFeedbackWhatHappened,
        behaviourIdentified: response.sessionFeedbackBehaviour,
        strengthsIdentified: response.sessionFeedbackStrengthsIdentified,
        personFirstName,
      })
    } else if (response.recordSessionDidPersonAttend) {
      rows = buildSessionDidNotHappenFeedbackRows({
        content: content.sessionFeedback.sessionDidNotHappen,
        didNotHappenReasonLabels: content.didNotHappenReasonLabels,
        noneText: content.noneText,
        whySessionDidNotHappen: response.recordSessionNotHappenReason,
        whySessionDidNotHappenDetails: response.recordSessionNotHappenReasonDetails,
        personFirstName,
      })
    } else {
      rows = buildDidNotAttendSessionFeedbackRows({
        content: content.sessionFeedback.didNotAttend,
        noneText: content.noneText,
        triedToContactDidNotAttend: response.recordSessionNoAttendanceInformation,
        personFirstName,
      })
    }

    return {
      card: { title: { text: content.sessionFeedback.title } },
      rows,
    }
  }

  private buildIssuesAndConcernsSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList {
    const identified = this.icsFeedbackSubmissionResponse.issuesOrConcernsIdentified

    return {
      card: { title: { text: content.issuesAndConcerns.title } },
      rows: [
        {
          key: { text: content.issuesAndConcerns.identified },
          value: { text: identified || content.noneText },
        },
      ],
    }
  }

  private buildAdditionalSupportNeedsSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList {
    return {
      card: { title: { text: content.additionalSupportNeeds.title } },
      rows: [
        {
          key: { text: content.additionalSupportNeeds.identified },
          value: {
            text: this.icsFeedbackSubmissionResponse.additionalSupportNeeds || content.noneText,
          },
        },
      ],
    }
  }

  private buildNextStepsSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList {
    const { nextStepsPlannedForNextSession, nextStepsActionsBeforeNextSession } = this.icsFeedbackSubmissionResponse

    return {
      card: { title: { text: content.nextSteps.title } },
      rows: [
        {
          key: { text: content.nextSteps.plannedForNextSession },
          value: { text: nextStepsPlannedForNextSession || content.noneText },
        },
        {
          key: {
            text: content.nextSteps.actionsBeforeNextSession.replace(
              '{{ firstname }}',
              this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
            ),
          },
          value: { text: nextStepsActionsBeforeNextSession || content.noneText },
        },
      ],
    }
  }
}

export const formatCaseWorkerHtml = (cw: CaseWorkerSummary): string =>
  createMailtoLink(cw.fullName ?? '', cw.emailAddress)

export function buildAppointmentDetailsRows(
  input: AppointmentDetailsSummaryRowInput,
): GovukFrontendSummaryList['rows'] {
  const {
    currentCaseworkers,
    feedbackSubmittedBy,
    date,
    startTime,
    sessionMethod,
    reasonForSessionNotInPerson,
    location,
    howWasUserInformedAboutSession,
    personFirstName,
    content,
    noneText,
  } = input

  const currentCaseworkerLabel = currentCaseworkers.length > 1 ? content.currentCaseworkers : content.currentCaseworker
  const currentCaseworkersHtml = currentCaseworkers.map(formatCaseWorkerHtml).join('<br>')
  const feedbackSubmittedByHtml = formatCaseWorkerHtml(feedbackSubmittedBy)
  const isRemoteSession = REMOTE_SESSION_METHODS.has(sessionMethod)

  return [
    { key: { text: currentCaseworkerLabel }, value: { html: currentCaseworkersHtml } },
    { key: { text: content.feedbackSubmittedBy }, value: { html: feedbackSubmittedByHtml } },
    { key: { text: content.date }, value: { text: date || noneText } },
    { key: { text: content.startTime }, value: { text: startTime || noneText } },
    { key: { text: content.method }, value: { text: sessionMethod || noneText } },
    ...(isRemoteSession
      ? [{ key: { text: content.reasonSessionNotInPerson }, value: { text: reasonForSessionNotInPerson || noneText } }]
      : [{ key: { text: content.location }, value: { text: location || noneText } }]),
    {
      key: { text: content.howPersonWasInformed.replace('{{ firstname }}', personFirstName) },
      value: { text: howWasUserInformedAboutSession || noneText },
    },
  ]
}

export function buildSessionDetailsRows(input: SessionDetailsSummaryRowInput): GovukFrontendSummaryList['rows'] {
  const { isLate, whyWereTheyLate, sessionDuration, personFirstName, content, noneText } = input

  return [
    {
      key: { text: content.wasPersonLate.replace('{{ firstname }}', personFirstName) },
      value: { text: isLate ? input.yesText : input.noText },
    },
    ...(isLate === true
      ? [
          {
            key: { text: content.whyWereTheyLate.replace('{{ firstname }}', personFirstName) },
            value: { text: whyWereTheyLate || noneText },
          },
        ]
      : []),

    { key: { text: content.duration }, value: { text: sessionDuration || noneText } },
  ]
}

export function buildRecordSessionAttendanceRows(
  input: RecordSessionAttendanceSummaryRowInput,
): GovukFrontendSummaryList['rows'] {
  const { didSessionHappen, attendedAppointment, personFirstName, content } = input

  return [
    {
      key: { text: content.didSessionHappen },
      value: { text: didSessionHappen ? input.yesText : input.noText },
    },
    {
      key: { text: content.didPersonAttend.replace('{{ firstname }}', personFirstName) },
      value: {
        text: attendedAppointment ? input.yesText : input.noText,
      },
    },
  ]
}

export function buildAttendedSessionFeedbackRows(
  input: AttendedSessionFeedbackRowInput,
): GovukFrontendSummaryList['rows'] {
  const { whatHappenedInSession, personFirstName, content, noneText } = input

  return [
    { key: { text: content.whatHappened }, value: { text: whatHappenedInSession || noneText } },
    {
      key: { text: content.behaviour.replace('{{ firstname }}', personFirstName) },
      value: { text: input.behaviourIdentified || noneText },
    },
    { key: { text: content.strengths }, value: { text: input.strengthsIdentified || noneText } },
  ]
}

export function buildSessionDidNotHappenFeedbackRows(
  input: SessionDidNotHappenFeedbackRowInput,
): GovukFrontendSummaryList['rows'] {
  const {
    whySessionDidNotHappen,
    whySessionDidNotHappenDetails,
    personFirstName,
    content,
    didNotHappenReasonLabels,
    noneText,
  } = input

  return [
    {
      key: { text: content.whySessionDidNotHappen },
      value: {
        text:
          [
            whySessionDidNotHappen
              ? getSessionNotHappenReasonLabel(whySessionDidNotHappen, personFirstName, didNotHappenReasonLabels)
              : '',
            whySessionDidNotHappenDetails || '',
          ]
            .filter(Boolean)
            .join(': ') || noneText,
      },
    },
  ]
}

export function buildDidNotAttendSessionFeedbackRows(
  input: DidNotAttendSessionFeedbackRowInput,
): GovukFrontendSummaryList['rows'] {
  const { content, noneText, triedToContactDidNotAttend, personFirstName } = input

  return [
    {
      key: {
        text: content.triedToContactDidNotAttend.replace('{{ firstname }}', personFirstName),
      },
      value: { text: triedToContactDidNotAttend || noneText },
    },
  ]
}

function getSessionNotHappenReasonLabel(
  reason: string,
  personFirstName: string,
  labels: ViewSessionFeedbackContent['didNotHappenReasonLabels'],
): string {
  switch (reason) {
    case 'SERVICE_PROVIDER_ISSUE':
      return labels.serviceProviderIssue
    case 'REFERRAL_COULD_NOT_TAKE_PART':
      return labels.referralCouldNotTakePart.replace('{{ firstname }}', personFirstName)
    case 'REFERRAL_DID_NOT_COMPLY':
      return labels.referralDidNotComply.replace('{{ firstname }}', personFirstName)
    default:
      return reason
  }
}

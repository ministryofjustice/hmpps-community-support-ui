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

type AppointmentDeliveryDetails = SessionFeedbackAppointmentDetails['appointmentDeliveryDetails']

export interface AppointmentDetailsSummaryRowInput {
  content: ViewSessionFeedbackContent['appointmentDetails']
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
  yesText: string
  noText: string
  isLate: boolean
  whyWereTheyLate: string
  sessionDuration: string
  personFirstName: string
}

export interface RecordSessionAttendanceSummaryRowInput {
  content: ViewSessionFeedbackContent['recordSessionAttendance']
  yesText: string
  noText: string
  didSessionHappen: boolean
  attendedAppointment?: boolean | null
  personFirstName: string
}

export interface SessionFeedbackSummaryRowInput {
  content: ViewSessionFeedbackContent['sessionFeedback']
  didNotHappenReasonLabels: ViewSessionFeedbackContent['didNotHappenReasonLabels']
  didSessionHappen: boolean
  didPersonAttend?: boolean | null
  whatHappenedInSession?: string
  whySessionDidNotHappen?: string
  whySessionDidNotHappenDetails?: string
  triedToContactDidNotAttend?: string
  behaviourIdentified?: string
  strengthsIdentified?: string
  personFirstName: string
}

const REMOTE_SESSION_METHODS = new Set(['Phone call', 'Video call'])

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
      recordSessionAttendanceSummary: this.buildRecordSessionAttendanceSummary(content),
      sessionFeedbackSummary: this.buildSessionFeedbackSummary(content),
      issuesAndConcernsSummary: this.buildIssuesAndConcernsSummary(content),
      nextStepsSummary: this.buildNextStepsSummary(content),
    }
  }

  getTemplatePath(): string {
    return 'appointment/viewSessionFeedback'
  }

  private formatSessionCommunication(input: string, content: ViewSessionFeedbackContent['appointmentDetails']): string {
    return (content.sessionCommunicationDisplay as Record<string, string>)[input] ?? input
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
      currentCaseworkers,
      feedbackSubmittedBy,
      date: isoToFormattedDate(startDateTime),
      startTime: isoToFormattedTime(startDateTime),
      sessionMethod:
        this.icsFeedbackSubmissionResponse.recordSessionHowSessionTookPlace ??
        (appointmentDeliveryDetails?.method
          ? (content.appointmentDetails.methodDisplay as Record<string, string>)[appointmentDeliveryDetails.method] ??
            appointmentDeliveryDetails.method
          : undefined),
      reasonForSessionNotInPerson:
        this.icsFeedbackSubmissionResponse.recordSessionNotInPersonReason ?? appointmentDeliveryDetails?.methodDetails,
      location: this.buildLocation(
        this.icsFeedbackSubmissionResponse.recordSessionHowSessionTookPlace,
        appointmentDeliveryDetails,
      ),
      howWasUserInformedAboutSession:
        sessionCommunications?.map(c => this.formatSessionCommunication(c, content.appointmentDetails)).join(', ') ?? '',
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
      yesText: content.yesText,
      noText: content.noText,
      isLate: this.icsFeedbackSubmissionResponse.sessionDetailsWasPersonLate,
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
    const rows = buildSessionFeedbackRows({
      content: content.sessionFeedback,
      didNotHappenReasonLabels: content.didNotHappenReasonLabels,
      didSessionHappen: this.icsFeedbackSubmissionResponse.recordSessionDidSessionHappen,
      didPersonAttend: this.icsFeedbackSubmissionResponse.recordSessionDidPersonAttend,
      whatHappenedInSession: this.icsFeedbackSubmissionResponse.sessionFeedbackWhatHappened,
      behaviourIdentified: this.icsFeedbackSubmissionResponse.sessionFeedbackBehaviour,
      strengthsIdentified: this.icsFeedbackSubmissionResponse.sessionFeedbackStrengthsIdentified,
      whySessionDidNotHappen: this.icsFeedbackSubmissionResponse.recordSessionNotHappenReason,
      whySessionDidNotHappenDetails: this.icsFeedbackSubmissionResponse.recordSessionNotHappenReasonDetails,
      triedToContactDidNotAttend: this.icsFeedbackSubmissionResponse.recordSessionNoAttendanceInformation,
      personFirstName: this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
    })

    if (rows.length === 0) return undefined

    return {
      card: { title: { text: content.sessionFeedback.title } },
      rows,
    }
  }

  private buildIssuesAndConcernsSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList | undefined {
    const identified = this.icsFeedbackSubmissionResponse.issuesOrConcernsIdentified
    if (!identified) return undefined

    return {
      card: { title: { text: content.issuesAndConcerns.title } },
      rows: [{ key: { text: content.issuesAndConcerns.identified }, value: { text: identified } }],
    }
  }

  private buildNextStepsSummary(content: ViewSessionFeedbackContent): GovukFrontendSummaryList | undefined {
    const { nextStepsPlannedForNextSession, nextStepsActionsBeforeNextSession } = this.icsFeedbackSubmissionResponse
    const rows = [
      ...(nextStepsPlannedForNextSession
        ? [
            {
              key: { text: content.nextSteps.plannedForNextSession },
              value: { text: nextStepsPlannedForNextSession },
            },
          ]
        : []),
      ...(nextStepsActionsBeforeNextSession
        ? [
            {
              key: { text: content.nextSteps.actionsBeforeNextSession },
              value: { text: nextStepsActionsBeforeNextSession },
            },
          ]
        : []),
    ]

    if (rows.length === 0) return undefined

    return {
      card: { title: { text: content.nextSteps.title } },
      rows: rows.map(row => ({
        ...row,
        key: {
          text: row.key.text.replace(
            '{{ firstname }}',
            this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
          ),
        },
      })),
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
  } = input

  const currentCaseworkerLabel = currentCaseworkers.length > 1 ? content.currentCaseworkers : content.currentCaseworker
  const currentCaseworkersHtml = currentCaseworkers.map(formatCaseWorkerHtml).join('<br>')
  const feedbackSubmittedByHtml = formatCaseWorkerHtml(feedbackSubmittedBy)
  const isRemoteSession = REMOTE_SESSION_METHODS.has(sessionMethod)

  return [
    { key: { text: currentCaseworkerLabel }, value: { html: currentCaseworkersHtml } },
    { key: { text: content.feedbackSubmittedBy }, value: { html: feedbackSubmittedByHtml } },
    { key: { text: content.date }, value: { text: date } },
    { key: { text: content.startTime }, value: { text: startTime } },
    { key: { text: content.method }, value: { text: sessionMethod } },
    ...(isRemoteSession
      ? [{ key: { text: content.reasonSessionNotInPerson }, value: { text: reasonForSessionNotInPerson } }]
      : [{ key: { text: content.location }, value: { text: location } }]),
    {
      key: { text: content.howPersonWasInformed.replace('{{ firstname }}', personFirstName) },
      value: { text: howWasUserInformedAboutSession },
    },
  ]
}

export function buildSessionDetailsRows(input: SessionDetailsSummaryRowInput): GovukFrontendSummaryList['rows'] {
  const { isLate, whyWereTheyLate, sessionDuration, personFirstName, content } = input

  return [
    {
      key: { text: content.wasPersonLate.replace('{{ firstname }}', personFirstName) },
      value: { text: isLate ? input.yesText : input.noText },
    },
    ...(isLate && whyWereTheyLate
      ? [
          {
            key: { text: content.whyWereTheyLate.replace('{{ firstname }}', personFirstName) },
            value: { text: whyWereTheyLate },
          },
        ]
      : []),

    ...(sessionDuration ? [{ key: { text: content.duration }, value: { text: sessionDuration } }] : []),
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
    ...(attendedAppointment != null
      ? [
          {
            key: { text: content.didPersonAttend.replace('{{ firstname }}', personFirstName) },
            value: { text: attendedAppointment ? input.yesText : input.noText },
          },
        ]
      : []),
  ]
}

export function buildSessionFeedbackRows(
  input: SessionFeedbackSummaryRowInput & {
    didSessionHappen: boolean
    didPersonAttend: boolean
    whatHappenedInSession: string
  },
): GovukFrontendSummaryList['rows'] {
  const {
    didSessionHappen,
    didPersonAttend,
    whatHappenedInSession,
    whySessionDidNotHappen,
    whySessionDidNotHappenDetails,
    triedToContactDidNotAttend,
    personFirstName,
    content,
    didNotHappenReasonLabels,
  } = input

  if (didSessionHappen) {
    return [
      ...(whatHappenedInSession
        ? [{ key: { text: content.whatHappened }, value: { text: whatHappenedInSession } }]
        : []),
      ...(input.behaviourIdentified
        ? [
            {
              key: { text: content.behaviour.replace('{{ firstname }}', personFirstName) },
              value: { text: input.behaviourIdentified },
            },
          ]
        : []),
      ...(input.strengthsIdentified
        ? [{ key: { text: content.strengths }, value: { text: input.strengthsIdentified } }]
        : []),
    ]
  }

  if (didPersonAttend) {
    return [
      ...(whySessionDidNotHappen || whySessionDidNotHappenDetails
        ? [
            {
              key: { text: content.whySessionDidNotHappen },
              value: {
                text: [
                  whySessionDidNotHappen
                    ? getSessionNotHappenReasonLabel(whySessionDidNotHappen, personFirstName, didNotHappenReasonLabels)
                    : '',
                  whySessionDidNotHappenDetails,
                ]
                  .filter(Boolean)
                  .join(': '),
              },
            },
          ]
        : []),
    ]
  }

  return [
    ...(triedToContactDidNotAttend
      ? [
          {
            key: {
              text: content.triedToContactDidNotAttend.replace('{{ firstname }}', personFirstName),
            },
            value: { text: triedToContactDidNotAttend },
          },
        ]
      : []),
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

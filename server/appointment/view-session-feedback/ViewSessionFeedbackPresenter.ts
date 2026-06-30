import { Response } from 'express'
import {
  IcsFeedbackSubmissionResponse,
  CaseWorkerSummary,
  SessionFeedbackAppointmentDetails,
} from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ViewSessionFeedbackViewModel } from './ViewSessionFeedbackViewModel'
import { isoToFormattedDate } from '../../utils/dateFormat'
import { isoToFormattedTime } from '../../utils/timeFormat'
import { createMailtoLink } from '../../utils/viewUtils'

type AppointmentDeliveryDetails = SessionFeedbackAppointmentDetails['appointmentDeliveryDetails']

export interface AppointmentDetailsSummaryRowInput {
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
  isLate: boolean
  whyWereTheyLate: string
  sessionDuration: string
  personFirstName: string
}

export interface RecordSessionAttendanceSummaryRowInput {
  didSessionHappen: boolean
  attendedAppointment?: boolean | null
  personFirstName: string
}

export interface SessionFeedbackSummaryRowInput {
  didSessionHappen: boolean
  didPersonAttend?: boolean | null
  whatHappenedInSession?: string
  whySessionDidNotHappen?: string
  triedToContactDidNotAttend?: string
  personFirstName: string
}

const REMOTE_SESSION_METHODS = new Set(['Phone call', 'Video call'])

const APPOINTMENT_DELIVERY_METHOD_DISPLAY = {
  PHONE_CALL: 'Phone call',
  VIDEO_CALL: 'Video call',
  IN_PERSON_PROBATION_OFFICE: 'In person (probation office)',
  IN_PERSON_OTHER_LOCATION: 'In person (other location)',
} as const

const SESSION_COMMUNICATION_DISPLAY: Record<string, string> = {
  informedByPhone: 'Phone call',
  informedByTextMessage: 'Text message',
  informedByEmail: 'Email',
}

export default class ViewSessionFeedbackPresenter extends PresenterBase<ViewSessionFeedbackViewModel, object> {
  constructor(
    private readonly icsFeedbackSubmissionResponse: IcsFeedbackSubmissionResponse,
    private readonly caseRefId: string,
  ) {
    super()
  }

  buildPageContent(res: Response): ViewSessionFeedbackViewModel {
    const didSessionHappen = this.icsFeedbackSubmissionResponse.recordSessionDidSessionHappen === true

    return {
      pageHeader: 'View session feedback',
      backLink: { href: `/progress/${this.caseRefId}` },
      appointmentDetailsSummary: this.buildAppointmentDetailsSummary(),
      sessionDetailsSummary: didSessionHappen ? this.buildSessionDetailsSummary() : undefined,
      recordSessionAttendanceSummary: didSessionHappen ? undefined : this.buildRecordSessionAttendanceSummary(),
      sessionFeedbackSummary: this.buildSessionFeedbackSummary(),
    }
  }

  getTemplatePath(): string {
    return 'appointment/viewSessionFeedback'
  }

  private formatSessionCommunication(input: string): string {
    return SESSION_COMMUNICATION_DISPLAY[input] ?? input
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

  private buildAppointmentDetailsSummary(): GovukFrontendSummaryList {
    const {
      currentCaseworkers,
      feedbackSubmittedBy,
      startDateTime,
      appointmentDeliveryDetails,
      sessionCommunications,
      personFirstName,
    } = this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails

    const rows = buildAppointmentDetailsRows({
      currentCaseworkers,
      feedbackSubmittedBy,
      date: isoToFormattedDate(startDateTime),
      startTime: isoToFormattedTime(startDateTime),
      sessionMethod:
        this.icsFeedbackSubmissionResponse.recordSessionHowSessionTookPlace ??
        APPOINTMENT_DELIVERY_METHOD_DISPLAY[appointmentDeliveryDetails?.method],
      reasonForSessionNotInPerson:
        this.icsFeedbackSubmissionResponse.recordSessionNotInPersonReason ?? appointmentDeliveryDetails?.methodDetails,
      location: this.buildLocation(
        this.icsFeedbackSubmissionResponse.recordSessionHowSessionTookPlace,
        appointmentDeliveryDetails,
      ),
      howWasUserInformedAboutSession:
        sessionCommunications?.map(c => this.formatSessionCommunication(c)).join(', ') ?? '',
      personFirstName,
    })

    return {
      card: { title: { text: 'Appointment details' } },
      rows,
    }
  }

  private buildSessionDetailsSummary(): GovukFrontendSummaryList {
    const rows = buildSessionDetailsRows({
      isLate: this.icsFeedbackSubmissionResponse.sessionDetailsWasPersonLate,
      whyWereTheyLate: this.icsFeedbackSubmissionResponse.sessionDetailsLateReason,
      sessionDuration: this.icsFeedbackSubmissionResponse.sessionDetailsDuration,
      personFirstName: this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
    })

    return {
      card: { title: { text: 'Session details' } },
      rows,
    }
  }

  private buildRecordSessionAttendanceSummary(): GovukFrontendSummaryList {
    const rows = buildRecordSessionAttendanceRows({
      didSessionHappen: this.icsFeedbackSubmissionResponse.recordSessionDidSessionHappen,
      attendedAppointment: this.icsFeedbackSubmissionResponse.recordSessionDidPersonAttend,
      personFirstName: this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
    })

    return {
      card: { title: { text: 'Record session attendance' } },
      rows,
    }
  }

  private buildSessionFeedbackSummary(): GovukFrontendSummaryList {
    const rows = buildSessionFeedbackRows({
      didSessionHappen: this.icsFeedbackSubmissionResponse.recordSessionDidSessionHappen,
      didPersonAttend: this.icsFeedbackSubmissionResponse.recordSessionDidPersonAttend,
      whatHappenedInSession: this.icsFeedbackSubmissionResponse.sessionFeedbackWhatHappened,
      whySessionDidNotHappen: this.icsFeedbackSubmissionResponse.recordSessionNotHappenReasonDetails,
      triedToContactDidNotAttend: this.icsFeedbackSubmissionResponse.recordSessionNoAttendanceInformation,
      personFirstName: this.icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails.personFirstName,
    })

    if (rows.length === 0) return undefined

    return {
      card: { title: { text: 'Session feedback' } },
      rows,
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
  } = input

  const currentCaseworkerLabel = currentCaseworkers.length > 1 ? 'Current caseworkers' : 'Current caseworker'
  const currentCaseworkersHtml = currentCaseworkers.map(formatCaseWorkerHtml).join('<br>')
  const feedbackSubmittedByHtml = formatCaseWorkerHtml(feedbackSubmittedBy)
  const isRemoteSession = REMOTE_SESSION_METHODS.has(sessionMethod)

  return [
    { key: { text: currentCaseworkerLabel }, value: { html: currentCaseworkersHtml } },
    { key: { text: 'Feedback submitted by' }, value: { html: feedbackSubmittedByHtml } },
    { key: { text: 'Date' }, value: { text: date } },
    { key: { text: 'Start time' }, value: { text: startTime } },
    { key: { text: 'Method' }, value: { text: sessionMethod } },
    ...(isRemoteSession
      ? [{ key: { text: 'Reason session was not in-person' }, value: { text: reasonForSessionNotInPerson } }]
      : [{ key: { text: 'Location' }, value: { text: location } }]),
    {
      key: { text: `How ${personFirstName} was informed about the session` },
      value: { text: howWasUserInformedAboutSession },
    },
  ]
}

export function buildSessionDetailsRows(input: SessionDetailsSummaryRowInput): GovukFrontendSummaryList['rows'] {
  const { isLate, whyWereTheyLate, sessionDuration, personFirstName } = input

  return [
    { key: { text: `Was ${personFirstName} late?` }, value: { text: isLate ? 'Yes' : 'No' } },
    ...(isLate && whyWereTheyLate
      ? [{ key: { text: `Why ${personFirstName} was late` }, value: { text: whyWereTheyLate } }]
      : []),

    ...(sessionDuration ? [{ key: { text: 'Session duration' }, value: { text: sessionDuration } }] : []),
  ]
}

export function buildRecordSessionAttendanceRows(
  input: RecordSessionAttendanceSummaryRowInput,
): GovukFrontendSummaryList['rows'] {
  const { didSessionHappen, attendedAppointment, personFirstName } = input

  return [
    { key: { text: 'Did the session happen?' }, value: { text: didSessionHappen ? 'Yes' : 'No' } },
    ...(attendedAppointment != null
      ? [
          {
            key: { text: `Did ${personFirstName} come to the appointment?` },
            value: { text: attendedAppointment ? 'Yes' : 'No' },
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
    triedToContactDidNotAttend,
    personFirstName,
  } = input

  if (didSessionHappen) {
    return [
      ...(whatHappenedInSession
        ? [{ key: { text: 'What happened in the session' }, value: { text: whatHappenedInSession } }]
        : []),
    ]
  }

  if (didPersonAttend) {
    return [
      ...(whySessionDidNotHappen
        ? [{ key: { text: 'Why the session did not happen' }, value: { text: whySessionDidNotHappen } }]
        : []),
    ]
  }

  return [
    ...(triedToContactDidNotAttend
      ? [
          {
            key: { text: `Details about how you tried to contact ${personFirstName} and why they did not attend` },
            value: { text: triedToContactDidNotAttend },
          },
        ]
      : []),
  ]
}

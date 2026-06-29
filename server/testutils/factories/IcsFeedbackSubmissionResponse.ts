import { Factory } from 'fishery'
import { type IcsFeedbackSubmissionResponse, CaseWorkerSummary } from '@community-support-api'
import { randomUUID } from 'crypto'

class IcsFeedbackResponseFactory extends Factory<IcsFeedbackSubmissionResponse> {}

export const caseWorkerOne: CaseWorkerSummary = {
  fullName: 'CaseWorker One',
  emailAddress: 'one@example.com',
}

export const caseWorkerTwo: CaseWorkerSummary = {
  fullName: 'CaseWorker Two',
  emailAddress: 'two@example.com',
}

const caseworkers = [caseWorkerOne]

export default IcsFeedbackResponseFactory.define<IcsFeedbackSubmissionResponse>(() => ({
  id: randomUUID(),
  appointmentIcsId: randomUUID(),
  recordSessionDidSessionHappen: true,
  recordSessionHowSessionTookPlace: 'Phone call',
  recordSessionNotInPersonReason: 'Client preferred phone',
  recordSessionPdu: null,
  recordSessionAddressLine1: null,
  recordSessionAddressLine2: null,
  recordSessionTownOrCity: null,
  recordSessionCounty: null,
  recordSessionPostcode: null,
  recordSessionDidPersonAttend: null,
  recordSessionNotHappenReason: null,
  recordSessionNotHappenReasonDetails: null,
  recordSessionNoAttendanceInformation: null,
  sessionDetailsWasPersonLate: false,
  sessionDetailsLateReason: null,
  sessionDetailsDuration: '1 hour and 45 minutes',
  sessionFeedbackWhatHappened: 'Discussed reintegration goals',
  sessionFeedbackBehaviour: 'Engaged and positive',
  sessionFeedbackStrengthsIdentified: 'Strong family support',
  issuesOrConcernsIdentified: null,
  issuesOrConcernsNotifyProbationPractitioner: false,
  nextStepsPlannedForNextSession: 'Continue with action plan',
  nextStepsActionsBeforeNextSession: 'Complete CV template',
  sessionFeedbackAppointmentDetails: {
    currentCaseworkers: caseworkers,
    feedbackSubmittedBy: caseWorkerTwo,
    startDateTime: '2026-04-09T10:00:00',
    appointmentDeliveryDetails: {
      id: randomUUID(),
      method: 'PHONE_CALL',
      methodDetails: 'Not feeling well enough to attend in person',
    },
    sessionCommunications: ['Phone call'],
    personFirstName: 'Alex',
  },
  createdAt: '2026-04-09T10:00:00',
  createdBy: 'CaseWorker One',
}))

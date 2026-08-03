import type { SuperAgentRequest } from 'superagent'
import {
  AppointmentIcsResponse,
  ConfirmPersonDetailsBffDto,
  CommunitySupportRiskDto,
  CommunitySupportRiskInformationDto,
  IcsFeedbackSubmission,
  IcsFeedbackSubmissionResponse,
  ProbationOffice,
  ReferralInformation,
  SubmitReferralResponse,
  TaskListStatusDto,
  CaseWorkerDto,
} from '@community-support-api'
import { stubFor } from './wiremock'
import { duplicateData } from '../testUtils'
import referralDetailsPageData from '../mockData/referralDetailsPageData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import { components } from '../../server/@types/communitySupportApi/imported'

export interface AssignmentFailureDto {
  emailAddress: string
  reason: string
}
export interface ReferralUserAssignmentsResponse {
  success: boolean
  message: string
  succeededList?: CaseWorkerDto[]
  failureList?: AssignmentFailureDto[]
}
export interface ReferralProgress {
  /** Format: uuid */
  referralId: string
  fullName: string
  appointments: components['schemas']['ReferralAppointmentHistoryDto'][]
}

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/community-support/health',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubGetPerson: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/person/.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          personIdentifier: '{{request.pathSegments.[3]}}',
          crn: 'X320741',
          prisonNumbers: ['A1234BC', 'B1234CD', 'C1234DE'],
          id: '11ea5182-09a2-4f3a-b07c-76ad5e6b765a',
          firstName: 'Alex',
          lastName: 'River',
          dateOfBirth: '20 Feb 1975 (51 years old)',
          sex: 'Male',
          additionalDetails: {},
        },
        transformers: ['response-template'],
      },
    }),
  stubGetCommunitySupportServices: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/referral-select-a-service',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          personId: '11ea5182-09a2-4f3a-b07c-76ad5e6b765a',
          communitySupportServices: [
            {
              id: 'service-id-123',
              region: 'North West',
              name: 'Accommodation support',
              providerName: 'Community Support Provider',
              description: 'Support for accommodation and independent living.',
            },
          ],
        },
      },
    }),
  stubGetCommunitySupportServicesTwoOptions: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/referral-select-a-service',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          personId: '11ea5182-09a2-4f3a-b07c-76ad5e6b765a',
          communitySupportServices: [
            {
              id: 'service-id-123',
              region: 'North West',
              name: 'First Accommodation support',
              providerName: 'Community Support Provider',
              description: 'Support for accommodation and independent living.',
            },
            {
              id: 'service-id-1456',
              region: 'North West',
              name: 'Second Accommodation support',
              providerName: 'Community Support Provider',
              description: 'Support for accommodation and independent living.',
            },
          ],
        },
      },
    }),
  stubCreateReferral: (
    referralInformation: ReferralInformation = referralInformationInCommunity,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: '/community-support/referral',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referralInformation,
      },
    }),

  stubSubmitReferral: (
    referralId: string,
    submitReferralResponse: SubmitReferralResponse = referralInformationInCommunity,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/community-support/${referralId}/submit-a-referral`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: submitReferralResponse,
      },
    }),

  stubGetReferral: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/referral-details/.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          id: '{{request.path.[3]}}',
          referenceNumber: 'QD0878DE',
          crn: 'CRN123',
          firstName: 'John',
          lastName: 'Doe',
        },
        transformers: ['response-template'],
      },
    }),

  stubGetUnassignedCases: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/case-list/unassigned.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: [
            {
              referralId: 'referral123',
              personName: 'John Doe',
              personIdentifier: 'CRN123',
              date: '01/06/24',
              caseWorkers: [],
            },
          ],
          page: 0,
          size: 10,
          totalElements: 10,
          totalPages: 1,
        },
      },
    }),
  stubGetInProgressCase: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/case-list/in-progress.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: [
            {
              referralId: 'referral123',
              personName: 'John Doe',
              personIdentifier: 'CRN123',
              date: '01/06/24',
              caseWorkers: ['Worker 1', 'Worker 2'],
            },
          ],
          page: 0,
          size: 10,
          totalElements: 10,
          totalPages: 1,
        },
      },
    }),
  stubGetInProgressFiftyCases: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/case-list/in-progress.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: duplicateData(
            {
              referralId: 'referral123',
              personName: 'John Doe',
              personIdentifier: 'CRN123',
              date: '01/06/24',
              caseWorkers: ['Worker 1', 'Worker 2'],
            },
            10,
          ),
          page: 2,
          size: 10,
          totalElements: 50,
          totalPages: 5,
        },
      },
    }),
  stubGetUnassignedNoCases: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/case-list/unassigned.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: [],
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
        },
      },
    }),
  stubNewReferralUserAssignments: (
    referralId: string,
    responseBody: ReferralUserAssignmentsResponse = { success: true, message: '', succeededList: [], failureList: [] },
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral-assignments/${referralId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: responseBody,
        transformers: ['response-template'],
      },
    }),
  stubGetReferralUserAssignments: (
    referralId: string,
    responseBody: CaseWorkerDto[],
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral-assignments/${referralId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: responseBody,
        transformers: ['response-template'],
      },
    }),
  stubPostReferralUserAssignments: (
    referralId: string,
    expectedResponse: ReferralUserAssignmentsResponse,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/community-support/referral/${referralId}/assign`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: expectedResponse,
        transformers: ['response-template'],
      },
    }),
  stubGetReferralDetailsPage: (
    httpStatus: number = 200,
    referralId: string | null = null,
    personNumber: string = 'CRN123',
    assignedTo: CaseWorkerDto[] = [],
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/referral-details-page/.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referralDetailsPageData(referralId, personNumber, assignedTo),
        transformers: ['response-template'],
      },
    }),
  stubGetProbationOffices: (mockData: ProbationOffice[], httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/.*reference-data/probation-offices',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: mockData,
      },
    }),
  stubGetICS: (caseRefId: string, mockData: AppointmentIcsResponse, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral-details/${caseRefId}/ics`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: mockData,
        transformers: ['response-template'],
      },
    }),
  stubGetICSNotFound: (caseRefId: string): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral-details/${caseRefId}/ics`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: undefined,
        transformers: ['response-template'],
      },
    }),
  stubSubmitICS: (caseRefId: string, mockRespData: AppointmentIcsResponse, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/community-support/referral/${caseRefId}/ics`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: mockRespData,
      },
    }),
  stubRescheduleICS: (caseRefId: string, mockRespData: AppointmentIcsResponse, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: `/community-support/referral/${caseRefId}/ics`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: mockRespData,
      },
    }),
  stubGetIcsById: (
    referralId: string,
    icsId: string,
    mockData: AppointmentIcsResponse,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral/${referralId}/ics/${icsId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: mockData,
      },
    }),
  stubGetReferralProgress: (
    referralProgress: ReferralProgress,
    caseReference: string,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral-details/${caseReference}/progress`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referralProgress,
        transformers: ['response-template'],
      },
    }),
  stubIcsFeedbackSubmission: (
    icsFeedback: IcsFeedbackSubmission,
    icsId: string,
    caseRefId: string,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/community-support/referral/${caseRefId}/ics/${icsId}/feedback`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: icsFeedback,
        transformers: ['response-template'],
      },
    }),
  stubGetReferralInformation: (
    httpStatus = 200,
    caseReference: string | null = null,
    referralInformation: ReferralInformation = referralInformationInCommunity,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral-information/${caseReference}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referralInformation,
        transformers: ['response-template'],
      },
    }),
  stubGetPersonalDetails: (
    personIdentifier: string,
    personalDetails: ConfirmPersonDetailsBffDto,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/confirm-person-details/${personIdentifier}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: personalDetails,
        transformers: ['response-template'],
      },
    }),
  stubGetRoshRisks: (referralId: string, risk: CommunitySupportRiskDto, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/draft-referral/risk-information/${referralId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: risk,
        transformers: ['response-template'],
      },
    }),
  stubGetTaskListStatus: (referralId: string, taskListStatus: TaskListStatusDto, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/task-list-status/${referralId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: taskListStatus,
        transformers: ['response-template'],
      },
    }),
  stubGetConfirmPersonalDetailsData: (
    referralId: string,
    response: ConfirmPersonDetailsBffDto,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/confirm-person-details/${referralId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
        transformers: ['response-template'],
      },
    }),
  stubSaveRiskInformation: (
    referralId: string,
    riskInformation: CommunitySupportRiskInformationDto,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: `/community-support/draft-referral/risk-information/${referralId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: riskInformation,
        transformers: ['response-template'],
      },
    }),
  stubGetIcsSessionFeedback: (
    icsFeedbackId: string,
    icsFeedbackSubmissionResponse: IcsFeedbackSubmissionResponse,
    httpStatus = 200,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/ics-feedback/${icsFeedbackId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: icsFeedbackSubmissionResponse,
        transformers: ['response-template'],
      },
    }),
}

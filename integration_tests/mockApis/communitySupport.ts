import type { SuperAgentRequest } from 'superagent'
import { AppointmentIcsResponse, ProbationOffice, ReferralInformation } from '@community-support-api'
import { stubFor } from './wiremock'
import { duplicateData } from '../testUtils'
import referralDetailsPageData from '../mockData/referralDetailsPageData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import { components } from '../../server/@types/communitySupportApi/imported'

export interface AssignCaseWorkersRequest {
  emails: string[]
}
export interface AssignmentFailureDto {
  emailAddress: string
  reason: string
}
export interface CaseWorkerDto {
  /** @enum {string} */
  userType: 'INTERNAL' | 'EXTERNAL'
  /** Format: uuid */
  userId?: string
  fullName?: string
  emailAddress: string
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
          personIdentifier: '{{request.path.[2]}}',
          id: '11ea5182-09a2-4f3a-b07c-76ad5e6b765a',
          firstName: 'Valerie',
          lastName: 'Wyman',
          dateOfBirth: '1984-04-20',
          sex: 'Female',
          additionalDetails: {},
        },
        transformers: ['response-template'],
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
    httpStatus = 200,
    referralId: string | null = null,
    personNumber: string = 'CRN123',
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/community-support/bff/referral-details-page/.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referralDetailsPageData(referralId, personNumber),
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
  stubSubmitICS: (caseRefId: string, mockRespData: AppointmentIcsResponse, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/community-support/bff/referral/${caseRefId}/ics`,
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
}

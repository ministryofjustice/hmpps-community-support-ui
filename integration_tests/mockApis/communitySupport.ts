import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

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
        jsonBody: { personIdentifier: '{{request.path.[3]}}' },
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
}

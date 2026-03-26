import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { prisonsData } from '../mockData/referenceData'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/api/agencies',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubGetPrisons: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/api/agencies/prisons',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisonsData,
        transformers: ['response-template'],
      },
    }),
}

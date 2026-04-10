import nock from 'nock'
import type { Prison } from '@prison-api'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { AgentConfig, ApiConfig } from '@ministryofjustice/hmpps-rest-client'
import PrisonApiClient from './prisonApiClient'

describe('PrisonApiClient tests', () => {
  let prisonApiClient: PrisonApiClient
  const mockApiConfig = {
    url: 'http://localhost:8080',
    healthPath: '/',
    timeout: {
      response: 10000,
      deadline: 10000,
    },
    agent: new AgentConfig(),
  } as ApiConfig
  const mockAuthClient = { getToken: async () => 'dummy-token' } as AuthenticationClient

  beforeEach(() => {
    prisonApiClient = new PrisonApiClient(mockAuthClient, mockApiConfig)
  })

  describe('getPrisons tests', () => {
    it('should return a list of prisons on a 200 response', () => {
      const mockPrisons = [
        {
          agencyId: 'ALI',
          description: 'Albany (HMP)',
          longDescription: 'HMP ALBANY',
          agencyType: 'INST',
          active: true,
        },
        {
          agencyId: 'ACI',
          description: 'Altcourse (HMP)',
          longDescription: 'HMP ALTCOURSE',
          agencyType: 'INST',
          active: true,
        },
      ] as Prison[]
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get('/api/agencies/prisons')
        .reply(200, mockPrisons)

      const result = prisonApiClient.getPrisons('user1')

      expect(result).resolves.toEqual(mockPrisons)
    })
  })
})

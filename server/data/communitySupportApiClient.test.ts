import nock from 'nock'
import type { Referral } from '@community-support-api'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { AgentConfig, ApiConfig } from '@ministryofjustice/hmpps-rest-client'
import CommunitySupportApiClient from './communitySupportApiClient'

describe('CommunitySupportApiClient tests', () => {
  let communitySupportApiClient: CommunitySupportApiClient
  const mockApiConfig = {
    url: 'http://localhost:8080',
    healthPath: '/health',
    timeout: {
      response: 10000,
      deadline: 10000,
    },
    agent: new AgentConfig(),
  } as ApiConfig
  const mockAuthClient = { getToken: async () => 'dummy-token' } as AuthenticationClient

  beforeEach(() => {
    communitySupportApiClient = new CommunitySupportApiClient(mockAuthClient, mockApiConfig)
  })

  describe('getReferralById tests', () => {
    it('should return a referral on a 200 response', () => {
      const mockReferral = { id: 'referral123' } as Referral
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get('/referrals/referral123')
        .reply(200, mockReferral)

      const result = communitySupportApiClient.getReferralById('referral123', 'user1')

      expect(result).resolves.toEqual(mockReferral)
    })
  })
})

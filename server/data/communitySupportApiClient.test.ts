import nock from 'nock'
import type { CommunitySupportServicesProvider, CreateReferralRequest, Referral } from '@community-support-api'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { AgentConfig, ApiConfig } from '@ministryofjustice/hmpps-rest-client'
import { CreateContextOptions } from 'vm'
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
        .get('/bff/referral-details/referral123')
        .reply(200, mockReferral)

      const result = communitySupportApiClient.getReferralById('referral123', 'user1')

      expect(result).resolves.toEqual(mockReferral)
    })
  })
  describe('getCommunitySupportServiceProviders tests', () => {
    it('should return a community support service providers on a 200 response', () => {
      const mockCommunityServiceProviderData = {
        personId: 'personDetails123',
        communitySupportServices: [
          { id: 'service1', region: 'Region 1', name: 'Service 1' },
          { id: 'service2', region: 'Region 2', name: 'Service 2' },
        ],
      } as CommunitySupportServicesProvider
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get('/bff/referral-select-a-service?personDetailsId=provider123')
        .reply(200, mockCommunityServiceProviderData)

      const result = communitySupportApiClient.getCommunitySupportServiceProviders('provider123', 'user1')

      expect(result).resolves.toEqual(mockCommunityServiceProviderData)
    })
  })

  describe('createReferral tests', () => {
    it('should create a referral on a 200 response', () => {
      const referralInformationDto = {
        crn: 'CRN123',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'Male',
        personId: 'person-id-123',
        communityServiceProviderId: 'csp-id-123',
        communityServiceProviderName: 'Community Support Provider',
        region: 'North West',
        deliveryPartner: 'Delivery Partner Ltd',
      }
      const referralRequestData = {
        personId: 'person123',
        crn: 'CRN123',
        communityServiceProviderId: 'csp-id-123',
        urgency: false,
      } as CreateReferralRequest
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .post('/bff/referral', referralRequestData)
        .reply(200, referralInformationDto)

      const result = communitySupportApiClient.createReferral(referralRequestData, 'user1')

      expect(result).resolves.toEqual(referralInformationDto)
    })
  })
  describe('submitReferralById tests', () => {
    it('should submit a referral on a 200 response', () => {
      const submitReferralResponseDto = {
        referralId: 'referral-id-123',
        referenceNumber: 'REF123456',
      }
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .post('/bff/referral-id-123/submit-a-referral')
        .reply(200, submitReferralResponseDto)

      const result = communitySupportApiClient.submitReferralById('referral-id-123', 'user1')

      expect(result).resolves.toEqual(submitReferralResponseDto)
    })
  })
})

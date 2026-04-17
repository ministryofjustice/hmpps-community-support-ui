import nock from 'nock'
import type {
  CommunitySupportServicesProvider,
  CreateReferralRequest,
  Referral,
  ReferralUserAssignmentsRequest,
  ReferralUserAssignmentsResponse,
  CaseWorkerDto,
  ReferralProgress,
  ReferralInformation,
  ProbationOffice,
} from '@community-support-api'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { AgentConfig, ApiConfig } from '@ministryofjustice/hmpps-rest-client'
import CommunitySupportApiClient from './communitySupportApiClient'
import ReferralProgressFactory from '../testutils/factories/ReferralProgress'
import ReferralInformationFactory from '../testutils/factories/ReferralInformation'

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
      const referralRequestData: CreateReferralRequest = {
        personDetails: {} as CreateReferralRequest['personDetails'],
        communityServiceProviderId: 'csp-id-123',
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
  describe('getCaseList tests', () => {
    it('should return an unassigned case list on a 200 response', () => {
      const caseListDto = {
        cases: [
          {
            referralId: 'referral-id-123',
            referenceNumber: 'REF123456',
            personName: 'John Doe',
            status: 'Open',
          },
        ],
      }
      const page = { page: 0, size: 10 }

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get(`/bff/case-list/unassigned?page=${page.page}&size=${page.size}`)
        .reply(200, caseListDto)

      const result = communitySupportApiClient.getCaseList('user1', page, false)

      expect(result).resolves.toEqual(caseListDto)
    })
    it('should return an in progress case list on a 200 response', () => {
      const caseListDto = {
        cases: [
          {
            referralId: 'referral-id-123',
            referenceNumber: 'REF123456',
            personName: 'John Doe',
            status: 'Open',
          },
        ],
      }
      const page = { page: 0, size: 10 }

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get(`/bff/case-list/in-progress?page=${page.page}&size=${page.size}`)
        .reply(200, caseListDto)

      const result = communitySupportApiClient.getCaseList('user1', page, true)

      expect(result).resolves.toEqual(caseListDto)
    })
  })
  describe('getReferralUserAssignments tests', () => {
    it('should return a referral user assignments on a 200 response', () => {
      const mockCaseWorkers = [
        {
          userType: 'EXTERNAL',
          userId: 'test-user-id-1',
          fullName: 'Test user 1 full name',
          emailAddress: 'testuser1@email.com',
        },
      ] as CaseWorkerDto[]
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get('/bff/referral-assignments/referral-id-1')
        .reply(200, mockCaseWorkers)

      const result = communitySupportApiClient.getReferralUserAssignments('referral-id-1', 'user1')

      expect(result).resolves.toEqual(mockCaseWorkers)
    })
  })
  describe('postReferralUserAssignments tests', () => {
    it('should submit referral user assignments on a 200 response', () => {
      const mockReferralUserAssignmentRequestData = {
        emails: ['testuser1@email.com'],
      } as ReferralUserAssignmentsRequest
      const mockReferralUserAssignmentsResponseData = {
        success: true,
        message: '',
        succeededList: [
          {
            userType: 'EXTERNAL',
            userId: 'test-user-id-1',
            fullName: 'Test user 1 full name',
            emailAddress: 'testuser1@email.com',
          },
        ],
        failureList: [],
      } as ReferralUserAssignmentsResponse
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .post('/referral/referral-id-1/assign', mockReferralUserAssignmentRequestData)
        .reply(200, mockReferralUserAssignmentsResponseData)

      const result = communitySupportApiClient.submitReferralUserAssignments(
        'referral-id-1',
        mockReferralUserAssignmentRequestData,
        'user1',
      )

      expect(result).resolves.toEqual(mockReferralUserAssignmentsResponseData)
    })
  })
  describe('getProbationOffices tests', () => {
    it('should return a list of probation offices on a 200 response', () => {
      const mockProbationOffices = [
        {
          probationOfficeId: 1,
          name: 'Derby: Derwent Centre',
          address: 'Derwent Centre, 1 Stuart Street, Derby, DE1 2EQ',
          probationRegionId: 'F',
          govUkUrl: 'https://www.gov.uk/guidance/derby-derwent-centre',
        },
        {
          probationOfficeId: 5,
          name: 'Leicestershire: Coalville Probation Office',
          address: 'Probation Office, 27 London Road, Coalville, Leicestershire, LE67 3JB"',
          probationRegionId: 'F',
          govUkUrl: 'https://www.gov.uk/guidance/leicestershire-coalville-probation-office',
          deliusCRSLocationId: 'CRS0086',
        },
        {
          probationOfficeId: 128,
          name: 'Warrington: Warrington Probation Office',
          address: 'Units 3 & 4 Bankside, Crosfield Street, Warrington, WA1 1UP',
          probationRegionId: 'B',
          deliusCRSLocationId: 'CRS0328',
        },
      ] as ProbationOffice[]
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get('/bff/reference-data/probation-offices')
        .reply(200, mockProbationOffices)

      const result = communitySupportApiClient.getProbationOffices('user1')

      expect(result).resolves.toEqual(mockProbationOffices)
    })
  })
  describe('getReferralProgress tests', () => {
    it('should return the progress of a referral with a 200 response', () => {
      const caseReference = 'AB1234CD'
      const mockReferralProgress: ReferralProgress = ReferralProgressFactory.build()

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get(`/bff/referral-details/${caseReference}/progress`)
        .reply(200, mockReferralProgress)

      const result = communitySupportApiClient.getReferralProgress(caseReference, 'user1')

      expect(result).resolves.toEqual(mockReferralProgress)
    })
  })
  describe('getReferralInformation tests', () => {
    it('should return the referral information with a 200 response', () => {
      const caseReference = 'AB1234CD'
      const mockReferralInformation: ReferralInformation = ReferralInformationFactory.build()

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer dummy-token' },
      })
        .get(`/bff/referral-information/${caseReference}`)
        .reply(200, mockReferralInformation)

      const result = communitySupportApiClient.getReferralInformation(caseReference, 'user1')

      expect(result).resolves.toEqual(mockReferralInformation)
    })
  })
})

import { Referral, CaseWorkerDto, AssignmentFailureDto, ReferralProgress } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import ReferralService from './referralService'
import ReferralProgressFactory from '../testutils/factories/ReferralProgress'

jest.mock('../data/communitySupportApiClient')

describe('Referral service tests', () => {
  let communitySupportApiClient: jest.Mocked<CommunitySupportApiClient>
  let referralService: ReferralService

  beforeEach(() => {
    communitySupportApiClient = new CommunitySupportApiClient(null) as jest.Mocked<CommunitySupportApiClient>
    referralService = new ReferralService(communitySupportApiClient)
  })

  describe('getReferralById', () => {
    it('should return referral data from API client', async () => {
      const mockReferralData = { id: 'referral123' } as Referral
      communitySupportApiClient.getReferralById.mockResolvedValue(mockReferralData)
      const result = await referralService.getReferralById('referral123', 'user1')
      expect(result).toBe(mockReferralData)
      expect(communitySupportApiClient.getReferralById).toHaveBeenCalledWith('referral123', 'user1')
    })
  })

  describe('getReferralUserAssignments', () => {
    it('should return referral user assignments from API client', async () => {
      const mockReferralUserAssignments = [
        {
          userType: 'EXTERNAL',
          userId: 'test-user-id-123',
          fullName: 'Test User 1 Fullname',
          emailAddress: 'testuser1@email.com',
        },
        {
          userType: 'EXTERNAL',
          userId: 'test-user-id-124',
          fullName: 'Test User 2 Fullname',
          emailAddress: 'testuser2@email.com',
        },
      ] satisfies CaseWorkerDto[]
      communitySupportApiClient.getReferralUserAssignments.mockResolvedValue(mockReferralUserAssignments)
      const result = await referralService.getReferralUserAssignments('referral123', 'user1')
      expect(result).toBe(mockReferralUserAssignments)
      expect(communitySupportApiClient.getReferralUserAssignments).toHaveBeenCalledWith('referral123', 'user1')
    })
  })

  describe('submitReferralUserAssignments', () => {
    it('should return referral user assignments from API client', async () => {
      const mockReferralUserAssignmentsRequest = {
        emails: ['assignedUser1@email.com', 'assignedUser2@email.com'],
      }
      const mockReferralUserAssignmentsResponse = {
        success: true,
        message: 'The case has been assigned to caseworkers.',
        succeededList: [
          {
            userType: 'EXTERNAL',
            userId: 'assigned-user-id-1',
            fullName: 'Assigned User 1',
            emailAddress: 'assignedUser1@email.com',
          },
          {
            userType: 'EXTERNAL',
            userId: 'assigned-user-id-2',
            fullName: 'Assigned User 2',
            emailAddress: 'assignedUser2@email.com',
          },
        ] as CaseWorkerDto[],
        failureList: [] as AssignmentFailureDto[],
      }
      communitySupportApiClient.submitReferralUserAssignments.mockResolvedValue(mockReferralUserAssignmentsResponse)
      const result = await referralService.submitReferralUserAssignments(
        'referral123',
        mockReferralUserAssignmentsRequest,
        'user1',
      )
      expect(result).toBe(mockReferralUserAssignmentsResponse)
      expect(communitySupportApiClient.submitReferralUserAssignments).toHaveBeenCalledWith(
        'referral123',
        mockReferralUserAssignmentsRequest,
        'user1',
      )
    })
  })

  describe('getReferralProgress', () => {
    it('should return referral progress from API client', async () => {
      const mockReferralProgress: ReferralProgress = ReferralProgressFactory.build()

      communitySupportApiClient.getReferralProgress.mockResolvedValue([mockReferralProgress])
      const result = await referralService.getReferralProgress('referral-id-1', 'user1')
      expect(result).toStrictEqual([mockReferralProgress])
      expect(communitySupportApiClient.getReferralProgress).toHaveBeenCalledWith('referral-id-1', 'user1')
    })
  })
})

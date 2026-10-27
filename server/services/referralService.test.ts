import {
  Referral,
  CaseWorkerDto,
  AssignmentFailureDto,
  ReferralProgress,
  ReferralAppointmentsBffResponseDto,
  ReferralInformation,
  CommunitySupportRiskInformationDto,
  ActionPlanSummaryDto,
  ActionPlanSessionDeliveryDetailsResponse,
  ActionPlanSessionDeliveryDetailsRequest,
  WithdrawalReasonsGroupedBffResponseDto,
  OffenceSentenceInfoBffResponseDto,
  OffenceSentenceRequest,
} from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import ReferralService from './referralService'
import ReferralProgressFactory from '../testutils/factories/ReferralProgress'
import ReferralInformationFactory from '../testutils/factories/ReferralInformation'

jest.mock('../data/communitySupportApiClient')

const referralId = '11111111-1111-1111-1111-111111111111'

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

  describe('submitServiceDeliveryDetails', () => {
    it('passes the complete answers to the API client and returns the saved response', async () => {
      const request: ActionPlanSessionDeliveryDetailsRequest = {
        answers: [{ questionId: 'question-id', incomingAnswerDetails: [{ value: 'YES' }] }],
      }
      const response: ActionPlanSessionDeliveryDetailsResponse = { questions: [] }
      communitySupportApiClient.submitServiceDeliveryDetails.mockResolvedValue(response)

      await expect(referralService.submitServiceDeliveryDetails('AB1234CD', request, 'user1')).resolves.toEqual(
        response,
      )
      expect(communitySupportApiClient.submitServiceDeliveryDetails).toHaveBeenCalledWith('AB1234CD', request, 'user1')
    })
  })

  describe('getCheckYourAnswers', () => {
    it('groups questions from the aggregate response into action-plan delivery sections', async () => {
      const buildQuestion = (
        id: string,
        key: string,
      ): ActionPlanSessionDeliveryDetailsResponse['questions'][number] => ({
        id,
        displayOrder: 1,
        label: key,
        key,
        answerType: 'TEXTAREA',
        maximumNumberOfResponses: 1,
        choices: null,
        savedResponses: [],
      })
      const questions = [
        buildQuestion('session-frequency', 'SESSION_FREQUENCY'),
        buildQuestion('session-delivery-method', 'SESSION_DELIVERY_METHOD'),
        buildQuestion('session-format', 'SESSION_FORMAT'),
        buildQuestion('risk-associated-with-planned-activities', 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES'),
        buildQuestion('reasonable-adjustments-for-planned-activities', 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES'),
        buildQuestion('service-end-date-check', 'SERVICE_END_DATE_CHECK'),
        buildQuestion('new-service-end-date', 'NEW_SERVICE_END_DATE'),
        buildQuestion('service-end-date-change-reason', 'SERVICE_END_DATE_CHANGE_REASON'),
        buildQuestion('user-involvement-in-action-plan', 'USER_INVOLVEMENT_IN_ACTION_PLAN'),
      ]
      const response = { questions }
      communitySupportApiClient.getSessionDeliveryCheckYourAnswers.mockResolvedValue(response)

      await expect(referralService.getCheckYourAnswers('AB1234CD', 'user1', true)).resolves.toEqual({
        sessionDetails: { questions: questions.slice(0, 3) },
        risksAndAdjustments: { questions: questions.slice(3, 5) },
        serviceEndDate: {
          questions: questions.slice(5, 8),
        },
        personInvolvement: { questions: questions.slice(8) },
      })
      expect(communitySupportApiClient.getSessionDeliveryCheckYourAnswers).toHaveBeenCalledWith(
        'AB1234CD',
        'user1',
        true,
      )
      expect(communitySupportApiClient.getSessionDeliveryDetails).not.toHaveBeenCalled()
      expect(communitySupportApiClient.getRisksAndAdjustments).not.toHaveBeenCalled()
      expect(communitySupportApiClient.getServiceEndDateCheck).not.toHaveBeenCalled()
      expect(communitySupportApiClient.getUpdateServiceEndDate).not.toHaveBeenCalled()
      expect(communitySupportApiClient.getPersonInvolvement).not.toHaveBeenCalled()
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
      const caseReference = 'AB1234CD'
      const mockReferralProgress: ReferralProgress = ReferralProgressFactory.build()

      communitySupportApiClient.getReferralProgress.mockResolvedValue(mockReferralProgress)
      const result = await referralService.getReferralProgress(caseReference, 'user1')
      expect(result).toStrictEqual(mockReferralProgress)
      expect(communitySupportApiClient.getReferralProgress).toHaveBeenCalledWith(caseReference, 'user1')
    })
  })

  describe('getReferralAppointments', () => {
    it('should return referral appointments from API client', async () => {
      const caseReference = 'AB1234CD'
      const appointments: ReferralAppointmentsBffResponseDto = {
        personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
        appointments: [],
      }

      communitySupportApiClient.getReferralAppointments.mockResolvedValue(appointments)
      const result = await referralService.getReferralAppointments(caseReference, 'user1')

      expect(result).toStrictEqual(appointments)
      expect(communitySupportApiClient.getReferralAppointments).toHaveBeenCalledWith(caseReference, 'user1')
    })
  })

  describe('getReferralInformation', () => {
    it('should return referral information from API client', async () => {
      const caseReference = 'AB1234CD'
      const mockReferralInformation: ReferralInformation = ReferralInformationFactory.build()

      communitySupportApiClient.getReferralInformation.mockResolvedValue(mockReferralInformation)
      const result = await referralService.getReferralInformation(caseReference, 'user1')
      expect(result).toStrictEqual(mockReferralInformation)
      expect(communitySupportApiClient.getReferralInformation).toHaveBeenCalledWith(caseReference, 'user1')
    })
  })

  describe('getActionPlanSummary', () => {
    it('should return action plan summary from API client', async () => {
      const caseReference = 'AB1234CD'
      const mockActionPlanSummary: ActionPlanSummaryDto = {
        personDetails: {
          firstName: 'Alex',
          lastName: 'River',
        },
        needs: [],
        lastUpdatedAt: '',
      }

      communitySupportApiClient.getActionPlanSummary.mockResolvedValue(mockActionPlanSummary)

      const result = await referralService.getActionPlanSummary(caseReference, 'user1')

      expect(result).toStrictEqual(mockActionPlanSummary)
      expect(communitySupportApiClient.getActionPlanSummary).toHaveBeenCalledWith(caseReference, 'user1')
    })
  })

  describe('getWithdrawalReasons', () => {
    it('should return withdrawal reasons grouped by heading from API client', async () => {
      const mockWithdrawalReasons: WithdrawalReasonsGroupedBffResponseDto = {
        withdrawalReasons: { 'Problem with referral': ['INELIGIBLE_REFERRAL', 'MISTAKEN_OR_DUPLICATE_REFERRAL'] },
      }

      communitySupportApiClient.getWithdrawalReasons.mockResolvedValue(mockWithdrawalReasons)

      const result = await referralService.getWithdrawalReasons('user1')

      expect(result).toStrictEqual(mockWithdrawalReasons)
      expect(communitySupportApiClient.getWithdrawalReasons).toHaveBeenCalledWith('user1')
    })
  })

  describe('saveRiskInformation', () => {
    it('should save risk information via the API client', async () => {
      const riskInformation: CommunitySupportRiskInformationDto = {
        riskSummaryWhoIsAtRisk: 'Public',
      }
      communitySupportApiClient.saveRiskInformation.mockResolvedValue(riskInformation)

      const result = await referralService.saveRiskInformation(referralId, riskInformation, 'user1')

      expect(result).toBe(riskInformation)
      expect(communitySupportApiClient.saveRiskInformation).toHaveBeenCalledWith(referralId, riskInformation, 'user1')
    })
  })

  describe('getOffenceSentencePage', () => {
    it('should return offence sentence data from API client', async () => {
      const response: OffenceSentenceInfoBffResponseDto = {
        firstName: 'Alex',
        lastName: 'Smith',
        crn: 'X123456',
        dateOfBirth: '20 April 1984 (42 years old)',
        offenceSentenceInfo: {
          offence: 'Robbery',
          sentenceEndDate: '2026-06-01',
        },
      }

      communitySupportApiClient.getOffenceSentencePage.mockResolvedValue(response)

      const result = await referralService.getOffenceSentencePage(referralId, 'user1')

      expect(result).toStrictEqual(response)
      expect(result.crn).toBe('X123456')
      expect(result.dateOfBirth).toBe('20 April 1984 (42 years old)')
      expect(communitySupportApiClient.getOffenceSentencePage).toHaveBeenCalledWith(referralId, 'user1')
    })
  })

  describe('updateOffenceSentencePage', () => {
    it('should save offence sentence data via the API client', async () => {
      const request: OffenceSentenceRequest = {
        hasLicenceConditionsOrZones: true,
        licenceConditionsOrZonesDetails: 'No contact with victim',
      }
      const response: OffenceSentenceInfoBffResponseDto = {
        firstName: 'Alex',
        lastName: 'Smith',
        crn: 'X123456',
        dateOfBirth: '20 April 1984 (42 years old)',
        offenceSentenceInfo: {
          offence: 'Robbery',
          hasLicenceConditionsOrZones: true,
          licenceConditionsOrZonesDetails: 'No contact with victim',
        },
      }

      communitySupportApiClient.updateOffenceSentencePage.mockResolvedValue(response)

      const result = await referralService.updateOffenceSentencePage(referralId, request, 'user1')

      expect(result).toStrictEqual(response)
      expect(result.crn).toBe('X123456')
      expect(result.dateOfBirth).toBe('20 April 1984 (42 years old)')
      expect(communitySupportApiClient.updateOffenceSentencePage).toHaveBeenCalledWith(referralId, request, 'user1')
    })
  })
})

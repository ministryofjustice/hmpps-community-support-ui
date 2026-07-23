import { Request, Response } from 'express'
import { AdditionalSupportNeedsDto, ConfirmPersonDetailsBffDto } from '@community-support-api'
import ReferralService from '../services/referralService'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import CheckReferralInformationPresenter from './check-referral-information/checkReferralInformationPresenter'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import RiskSummaryPresenter from './riskSummary/RiskSummaryPresenter'
import ConfirmPersonalDetailsPresenter from './confirmPersonalDetails/ConfirmPersonalDetailsPresenter'
import DraftReferralController from './DraftReferralController'

jest.mock('../services/referralService')
jest.mock('../middleware/formValidationMiddleware')
jest.mock('../referral/foundPerson/foundPersonPresenter')
jest.mock('../referral/check-referral-information/checkReferralInformationPresenter')
jest.mock('./confirmation/confirmationPresenter')
jest.mock('./riskSummary/RiskSummaryPresenter')
jest.mock('./confirmPersonalDetails/ConfirmPersonalDetailsPresenter')

describe('DraftReferralController', () => {
  let referralService: jest.Mocked<ReferralService>
  let draftReferralController: DraftReferralController
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = {
      getReferralById: jest.fn(),
      createReferral: jest.fn(),
      getReferralUserAssignments: jest.fn(),
      getReferralInformation: jest.fn(),
      getPersonalDetails: jest.fn(),
      getRoshRisksByReferralId: jest.fn(),
      saveRiskInformation: jest.fn(),
      getAdditionalSupportNeeds: jest.fn(),
      submitAdditionalSupportNeeds: jest.fn(),
      submitNeedsAnInterpreter: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>
    draftReferralController = new DraftReferralController(referralService)

    FoundPersonPresenter.prototype.renderPage = jest.fn()
    CheckReferralInformationPresenter.prototype.renderPage = jest.fn()
    ConfirmationPresenter.prototype.renderPage = jest.fn()
    RiskSummaryPresenter.prototype.renderPage = jest.fn()
    ConfirmPersonalDetailsPresenter.prototype.renderPage = jest.fn()

    req = {
      params: { id: 'referral123' },
      flash: jest.fn(),
      session: { referralCreationDetails: null },
    } as unknown as Request
    res = {
      locals: { user: { username: 'user1' } },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('showConfirmPersonalDetails', () => {
    it('should redirect to find a person page when there is no referralId in session', async () => {
      req = { session: {} } as unknown as Request

      await draftReferralController.showConfirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
    it('should render the confirm personal details page using the stored draftReferralId', async () => {
      req = {
        session: { draftReferralId: 'referral-uuid-1', personId: 'X123456' },
      } as unknown as Request
      const personalDetails = { personalDetails: { crn: 'X123456' } } as unknown as ConfirmPersonDetailsBffDto
      referralService.getPersonalDetails.mockResolvedValue(personalDetails)

      await draftReferralController.showConfirmPersonalDetails(req, res)

      expect(referralService.getPersonalDetails).toHaveBeenCalledTimes(1)
      expect(referralService.getPersonalDetails).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(ConfirmPersonalDetailsPresenter).toHaveBeenCalledWith(personalDetails)
      expect(ConfirmPersonalDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
    it('should redirect to find a person page when fetching personal details fails', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' }, flash: jest.fn() } as unknown as Request
      referralService.getPersonalDetails.mockRejectedValue(new Error('boom'))

      await draftReferralController.showConfirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
  })

  describe('confirmPersonalDetails', () => {
    test('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: {} } as unknown as Request

      await draftReferralController.confirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
    test('should redirect to task list page when there is a draft referral in session', async () => {
      req = { session: { draftReferralId: 'draft-referral-id-uuid' } } as unknown as Request
      await draftReferralController.confirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list')
    })
  })

  describe('additionalSupportNeeds', () => {
    test('sends correct data', async () => {
      req = {
        session: { draftReferralId: 'draft-referral-id-uuid' },
        body: {
          PhysicalValue: 'some details about physical health condition',
          MentalValue: '',
          NeurodiversityValue: '',
          LocationValue: '',
          CaringValue: '',
          EmploymentValue: '',
          DiversityValue: '',
          AnythingValue: '',
          AdditionalNeeds: 'Physical',
        },
      } as unknown as Request

      referralService.getAdditionalSupportNeeds.mockResolvedValueOnce({
        refereeName: { firstName: 'Alex', lastName: '' },
      } as unknown as AdditionalSupportNeedsDto)

      await draftReferralController.additionalSupportNeeds(req, res)

      expect(referralService.submitAdditionalSupportNeeds).toHaveBeenCalledTimes(1)
      expect(referralService.submitAdditionalSupportNeeds).toHaveBeenCalledWith(
        {
          needsAdditionalSupport: true,
          physicalHealth: 'some details about physical health condition',
        },
        'draft-referral-id-uuid',
        'user1',
      )
    })
  })
  describe('needsInterpreter', () => {
    test('sends correct data', async () => {
      req = {
        session: { draftReferralId: 'draft-referral-id-uuid' },
        body: {
          needsInterpreter: 'Yes',
          language: 'A Language',
        },
      } as unknown as Request

      referralService.getAdditionalSupportNeeds.mockResolvedValueOnce({
        refereeName: { firstName: 'Alex', lastName: '' },
      } as unknown as AdditionalSupportNeedsDto)

      await draftReferralController.needsAnInterpreter(req, res)

      expect(referralService.submitNeedsAnInterpreter).toHaveBeenCalledTimes(1)
      expect(referralService.submitNeedsAnInterpreter).toHaveBeenCalledWith(
        {
          needsInterpreter: true,
          language: 'A Language',
        },
        'draft-referral-id-uuid',
        'user1',
      )
    })
  })
})

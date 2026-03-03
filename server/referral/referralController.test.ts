import { Request, Response } from 'express'
import { Person, ReferralInformation, CaseWorkerDto } from '@community-support-api'
import ReferralController from './referralController'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import CheckReferralInformationPresenter from './check-referral-information/checkReferralInformationPresenter'
import ConfirmationContent from '../testutils/factories/ConfirmationContent'
import CheckReferralInformationContent from '../testutils/factories/CheckReferralInformationContent'
import ConfirmationPresenter from './confirmation/confirmationPresenter'

jest.mock('../services/referralService')
jest.mock('../middleware/formValidationMiddleware')
jest.mock('../referral/foundPerson/foundPersonPresenter')
jest.mock('../referral/check-referral-information/checkReferralInformationPresenter')
jest.mock('./confirmation/confirmationPresenter')

describe('ReferralController', () => {
  let referralService: jest.Mocked<ReferralService>
  let personService: jest.Mocked<PersonService>
  let referralController: ReferralController
  let req: Request
  let res: Response
  let next: jest.Mock

  beforeEach(() => {
    referralService = {
      getReferralById: jest.fn(),
      createReferral: jest.fn(),
      getReferralUserAssignments: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>
    personService = {
      getPersonByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<PersonService>
    referralController = new ReferralController(referralService, personService)

    FoundPersonPresenter.prototype.renderPage = jest.fn()
    CheckReferralInformationPresenter.prototype.renderPage = jest.fn()
    ConfirmationPresenter.prototype.renderPage = jest.fn()

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
    next = jest.fn()
  })

  describe('showReferralPage', () => {
    it('should render referral page with referral data', async () => {
      const mockReferralData = { id: 'referral123' }
      referralService.getReferralById.mockResolvedValue(mockReferralData)

      await referralController.showReferralPage(req, res, next)

      expect(referralService.getReferralById).toHaveBeenCalledWith('referral123', 'user1')
      expect(res.render).toHaveBeenCalledWith('referral/referral', { referral: mockReferralData })
    })
  })
  describe('showFindPersonPage', () => {
    it('should render the find a person page on a GET request', async () => {
      await referralController.handleFindPersonRequest(req, res, next)
      expect(res.render).toHaveBeenCalledWith('referral/findPerson', {})
    })
    it('should render the found person page on a successful POST request', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'person123' },
        flash: jest.fn(),
        session: {},
      } as unknown as Request
      const mockPersonData = {
        personIdentifier: 'person123',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'Male',
      } as Person
      personService.getPersonByIdentifier.mockResolvedValue(mockPersonData)

      await referralController.handleFindPersonRequest(req, res, next)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('person123', 'user1')
      expect(req.flash).not.toHaveBeenCalled()
      expect(FoundPersonPresenter).toHaveBeenCalledWith(mockPersonData)
      expect(FoundPersonPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
    it('should flash not found error redirect when no person is found', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'person123' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 404 }
      personService.getPersonByIdentifier.mockRejectedValue(mockErrorData)

      await referralController.handleFindPersonRequest(req, res, next)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('person123', 'user1')
      expect(req.flash).toHaveBeenCalledWith('personIdentifierError', "No person with identifier 'person123' found")
    })

    it('should flash unexpected error redirect when internal server error occurs', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'person123' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 500 }
      personService.getPersonByIdentifier.mockRejectedValue(mockErrorData)

      await referralController.handleFindPersonRequest(req, res, next)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('person123', 'user1')
      expect(req.flash).toHaveBeenCalledWith('personIdentifierError', 'An unexpected error occurred. Please try again.')
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
  })
  describe('checkReferralInformation', () => {
    it('should redirect to find a person page if referral creation details are missing', async () => {
      await referralController.checkReferralInformation(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
    it('should create referral and render check referral information page', async () => {
      req.session.referralCreationDetails = {
        crn: 'CRN123',
        personDetails: {
          id: 'person123',
          personIdentifier: 'CRN123',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1/1/1990',
        } as Person,
        communityServiceProviderId: 'service123',
      }
      req.params.id = 'service123'
      res.locals.content = CheckReferralInformationContent.build()
      const mockReferralInformation = {} as ReferralInformation
      referralService.createReferral.mockResolvedValue(mockReferralInformation)

      await referralController.checkReferralInformation(req, res)

      expect(referralService.createReferral).toHaveBeenCalledWith(
        {
          personDetails: {
            id: 'person123',
            personIdentifier: 'CRN123',
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1/1/1990',
          } as Person,
          communityServiceProviderId: 'service123',
          crn: 'CRN123',
          urgency: false,
        },
        'user1',
      )
      expect(CheckReferralInformationPresenter).toHaveBeenCalledWith(mockReferralInformation)
      expect(CheckReferralInformationPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should flash error and redirect to find a person page if referral creation fails', async () => {
      req.session.referralCreationDetails = {
        crn: 'CRN123',
        personDetails: {
          id: 'person123',
          personIdentifier: 'CRN123',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1/1/1990',
        } as Person,
        communityServiceProviderId: 'service123',
      }
      referralService.createReferral.mockRejectedValue(new Error('Referral creation failed'))

      await referralController.checkReferralInformation(req, res)
      expect(req.flash).toHaveBeenCalledWith(
        'create referral',
        'An unexpected error when creating a referral. Please try again.',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
  })
  describe('viewConfirmation', () => {
    it('should render the confirmation page with referral data', async () => {
      const mockReferralData = { id: 'referral123' }
      res.locals.content = ConfirmationContent.build()
      referralService.getReferralById.mockResolvedValue(mockReferralData)

      await referralController.viewConfirmation(req, res, next)

      expect(referralService.getReferralById).toHaveBeenCalledWith('referral123', 'user1')
      expect(ConfirmationPresenter).toHaveBeenCalledWith(mockReferralData)
      expect(ConfirmationPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })
  describe('showAssignCaseWorkersPage', () => {
    it('should render the case assignment page on a GET request for a new referral', async () => {
      req = {
        method: 'GET',
        params: { referralId: 'referral-id-1' },
        flash: jest.fn(),
      } as unknown as Request
      await referralController.showAssignCaseWorkersPage(req, res, next)
      expect(res.render).toHaveBeenCalledWith('referral/assign', { referralId: 'referral-id-1' })
    })
    it('should flash not found error redirect when no referral is found', async () => {
      req = {
        method: 'GET',
        params: { referralId: 'referral-id-123' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 404 }
      const errorsList = [
        {
          href: '#referralIdError',
          text: `No referral with identifier 'referral-id-123' found`,
        },
      ]
      referralService.getReferralUserAssignments.mockRejectedValue(mockErrorData)

      await referralController.showAssignCaseWorkersPage(req, res, next)

      expect(referralService.getReferralUserAssignments).toHaveBeenCalledWith('referral-id-123', 'user1')
      expect(req.flash).toHaveBeenCalledWith('referralIdError', "No referral with identifier 'referral-id-123' found")
      expect(res.render).toHaveBeenCalledWith('referral/assign', {
        referralId: 'referral-id-123',
        errorsList,
      })
    })
    it('should refer the assigned case workers for the referral with existing assignments', async () => {
      req = {
        method: 'GET',
        params: { referralId: 'referral-id-123' },
        flash: jest.fn(),
      } as unknown as Request
      const caseworkers = [
        {
          userType: 'INTERNAL',
          userId: 'test-user-id-123',
          fullName: 'Test User Fullname',
          emailAddress: 'testuser1@email.com',
        },
      ] as CaseWorkerDto[]
      referralService.getReferralUserAssignments.mockResolvedValue(caseworkers)

      await referralController.showAssignCaseWorkersPage(req, res, next)

      expect(referralService.getReferralUserAssignments).toHaveBeenCalledWith('referral-id-123', 'user1')
      expect(res.render).toHaveBeenCalledWith('referral/assign', {
        referralId: 'referral-id-123',
        caseworkers,
      })
    })
  })
})

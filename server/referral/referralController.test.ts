import { Request, Response } from 'express'
import { Person } from '@community-support-api'
import ReferralController from './referralController'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import { FoundPersonViewModel } from './foundPerson/foundPersonViewModel'

jest.mock('../services/referralService')
jest.mock('../middleware/formValidationMiddleware')
jest.mock('../referral/foundPerson/foundPersonPresenter')

describe('ReferralController', () => {
  let referralService: jest.Mocked<ReferralService>
  let personService: jest.Mocked<PersonService>
  let referralController: ReferralController
  let foundPersonPresenter: jest.Mocked<FoundPersonPresenter>
  let req: Request
  let res: Response
  let next: jest.Mock

  beforeEach(() => {
    referralService = {
      getReferralById: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>
    personService = {
      getPersonByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<PersonService>
    referralController = new ReferralController(referralService, personService)
    foundPersonPresenter = {
      buildPageContent: jest.fn(),
    } as unknown as jest.Mocked<FoundPersonPresenter>

    req = {
      params: { id: 'referral123' },
      flash: jest.fn(),
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
      await referralController.showFindPersonPage(req, res, next)
      expect(res.render).toHaveBeenCalledWith('referral/findPerson', {})
    })
    it('should render the found person page on a successful POST request', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'person123' },
      } as unknown as Request
      const mockPersonData = {
        personIdentifier: 'person123',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'Male',
      } as Person
      const mockPageContent = {} as FoundPersonViewModel
      personService.getPersonByIdentifier.mockResolvedValue(mockPersonData)
      foundPersonPresenter.buildPageContent.mockReturnValue(mockPageContent)

      const result = await referralController.showFindPersonPage(req, res, next)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('person123', 'user1')
      expect(result).toBe(foundPersonPresenter.renderPage)
    })
    it('should flash not found error redirect when no person is found', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'person123' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 404 }
      personService.getPersonByIdentifier.mockRejectedValue(mockErrorData)

      await referralController.showFindPersonPage(req, res, next)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('person123', 'user1')
      expect(req.flash).toHaveBeenCalledWith('personIdentifierError', "No person with identifier 'person123' found")
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should flash unexpected error redirect when internal server error occurs', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'person123' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 500 }
      personService.getPersonByIdentifier.mockRejectedValue(mockErrorData)

      await referralController.showFindPersonPage(req, res, next)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('person123', 'user1')
      expect(req.flash).toHaveBeenCalledWith('personIdentifierError', 'An unexpected error occurred. Please try again.')
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
  })
})

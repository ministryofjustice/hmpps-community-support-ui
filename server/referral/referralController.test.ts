import { Request, Response } from 'express'
import { Person } from '@community-support-api'
import ReferralController from './referralController'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'

jest.mock('../services/referralService')
jest.mock('../middleware/formValidationMiddleware')

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
    } as unknown as jest.Mocked<ReferralService>
    personService = {
      getPersonByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<PersonService>
    referralController = new ReferralController(referralService, personService)

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
      const mockPersonData = { personIdentifier: 'person123' } as Person
      personService.getPersonByIdentifier.mockResolvedValue(mockPersonData)

      await referralController.showFindPersonPage(req, res, next)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('person123', 'user1')
      expect(res.render).toHaveBeenCalledWith('referral/foundPerson', { person: mockPersonData })
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

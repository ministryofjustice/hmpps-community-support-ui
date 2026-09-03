import { Request, Response } from 'express'
import {
  Person,
  CaseWorkerDto,
  ConfirmPersonDetailsBffDto,
  CommunitySupportRiskDto,
  ReferralCriminogenicNeedsDto,
} from '@community-support-api'
import ReferralController from './referralController'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import CommunityServiceProviderService from '../services/communityServiceProviderService'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import ConfirmationContent from '../testutils/factories/ConfirmationContent'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import RiskSummaryPresenter from './riskSummary/RiskSummaryPresenter'
import EditRiskSummaryPresenter from './editRiskSummary/EditRiskSummaryPresenter'
import ConfirmPersonalDetailsPresenter from './confirmPersonalDetails/ConfirmPersonalDetailsPresenter'
import PersonNeedsPresenter, { personNeedsFormData } from './personNeeds/PersonNeedsPresenter'
import ConfirmAnAreaForReferralPresenter from './confirmAnAreaForReferral/ConfirmAnAreaForReferralPresenter'
import SelectAreaPresenter from './selectArea/SelectAreaPresenter'
import CheckPPDetailsPresenter from './checkPPDetails/checkPPDetailsPresenter'

jest.mock('../services/referralService')
jest.mock('../services/communityServiceProviderService')
jest.mock('../middleware/formValidationMiddleware')
jest.mock('../referral/foundPerson/foundPersonPresenter')
jest.mock('./confirmation/confirmationPresenter')
jest.mock('./riskSummary/RiskSummaryPresenter')
jest.mock('./editRiskSummary/EditRiskSummaryPresenter')
jest.mock('./confirmPersonalDetails/ConfirmPersonalDetailsPresenter')
jest.mock('./personNeeds/PersonNeedsPresenter')
jest.mock('./selectArea/SelectAreaPresenter')
jest.mock('./confirmAnAreaForReferral/ConfirmAnAreaForReferralPresenter')
jest.mock('./checkPPDetails/checkPPDetailsPresenter')

describe('ReferralController', () => {
  let referralService: jest.Mocked<ReferralService>
  let personService: jest.Mocked<PersonService>
  let communityServiceProviderService: jest.Mocked<CommunityServiceProviderService>
  let referralController: ReferralController
  let req: Request
  let res: Response
  let next: jest.Mock

  beforeEach(() => {
    referralService = {
      getReferralById: jest.fn(),
      createReferral: jest.fn(),
      getReferralUserAssignments: jest.fn(),
      getReferralInformation: jest.fn(),
      getCheckDraftReferralDetails: jest.fn(),
      getPersonalDetails: jest.fn(),
      getRoshRisksByReferralId: jest.fn(),
      saveRiskInformation: jest.fn(),
      getPersonNeeds: jest.fn(),
      getCommunitySupportServiceProviders: jest.fn(),
      getPPDetails: jest.fn(),
      submitPPDetails: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>
    personService = {
      getPersonByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<PersonService>
    communityServiceProviderService = {
      getCommunityServiceProviderDetails: jest.fn(),
      saveCommunityServiceProvider: jest.fn(),
    } as unknown as jest.Mocked<CommunityServiceProviderService>
    referralController = new ReferralController(referralService, personService, communityServiceProviderService)

    FoundPersonPresenter.prototype.renderPage = jest.fn()
    ConfirmationPresenter.prototype.renderPage = jest.fn()
    RiskSummaryPresenter.prototype.renderPage = jest.fn()
    EditRiskSummaryPresenter.prototype.renderPage = jest.fn()
    ConfirmPersonalDetailsPresenter.prototype.renderPage = jest.fn()
    PersonNeedsPresenter.prototype.renderPage = jest.fn()
    ConfirmAnAreaForReferralPresenter.prototype.renderPage = jest.fn()
    SelectAreaPresenter.prototype.renderPage = jest.fn()
    CheckPPDetailsPresenter.prototype.renderPage = jest.fn()

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
      await referralController.handleGetFindPersonRequest(req, res, next)
      expect(res.render).toHaveBeenCalledWith('referral/findPerson', {
        content: {
          backLink: { href: '/' },
        },
      })
    })
    it('should render the found person page on a successful POST request', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'X718253' },
        flash: jest.fn(),
        session: {},
      } as unknown as Request
      const mockPersonData = {
        personIdentifier: 'X718253',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'Male',
      } as Person
      personService.getPersonByIdentifier.mockResolvedValue(mockPersonData)

      await referralController.handlePostFindPersonRequest(req, res)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('X718253', 'user1')
      expect(req.flash).not.toHaveBeenCalled()
      expect(FoundPersonPresenter).toHaveBeenCalledWith(mockPersonData)
      expect(FoundPersonPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
    it('should flash not found error redirect when no person is found', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'X718253' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 404 }
      personService.getPersonByIdentifier.mockRejectedValue(mockErrorData)

      await referralController.handlePostFindPersonRequest(req, res)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('X718253', 'user1')
      expect(req.flash).toHaveBeenCalledWith('personIdentifierError', 'No person with that CRN or prison number found')
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should flash blank identifier error redirect when no identifier is entered', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: '' },
        flash: jest.fn(),
      } as unknown as Request

      await referralController.handlePostFindPersonRequest(req, res)

      expect(personService.getPersonByIdentifier).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('personIdentifierError', 'Enter a CRN or prison number')
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should flash invalid format error redirect when identifier format is invalid', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: '123' },
        flash: jest.fn(),
      } as unknown as Request

      await referralController.handlePostFindPersonRequest(req, res)
      expect(personService.getPersonByIdentifier).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith(
        'personIdentifierError',
        'Enter a CRN or prison number in the correct format, like X123456 for a CRN or D0168GH for a prison number',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should flash unexpected error redirect when internal server error occurs', async () => {
      req = {
        method: 'POST',
        body: { personIdentifier: 'X718253' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 500 }
      personService.getPersonByIdentifier.mockRejectedValue(mockErrorData)

      await referralController.handlePostFindPersonRequest(req, res)

      expect(personService.getPersonByIdentifier).toHaveBeenCalledWith('X718253', 'user1')
      expect(req.flash).toHaveBeenCalledWith('personIdentifierError', 'An unexpected error occurred. Please try again.')
      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
  })
  describe('viewConfirmation', () => {
    it('should render the confirmation page with referral data', async () => {
      const mockReferralData = { id: 'referral123' }
      res.locals.content = ConfirmationContent.build()
      referralService.getReferralById.mockResolvedValue(mockReferralData)

      await referralController.viewConfirmation(req, res)

      expect(referralService.getReferralById).toHaveBeenCalledWith('referral123', 'user1')
      expect(ConfirmationPresenter).toHaveBeenCalledWith(mockReferralData)
      expect(ConfirmationPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })
  describe('showAssignCaseWorkersPage', () => {
    it('should render the case assignment page on a GET request for a new referral', async () => {
      req = {
        method: 'GET',
        params: { identifier: 'referral-id-1' },
        flash: jest.fn(),
      } as unknown as Request
      await referralController.showAssignCaseWorkersPage(req, res)
      expect(res.render).toHaveBeenCalledWith('referral/assign', {
        caseworkers: undefined,
        content: {
          referralId: 'referral-id-1',
          backLink: { href: '/referral-details/referral-id-1' },
        },
      })
    })
    it('should flash not found error redirect when no referral is found', async () => {
      req = {
        method: 'GET',
        params: { identifier: 'referral-id-123' },
        flash: jest.fn(),
      } as unknown as Request
      const mockErrorData = { responseStatus: 404 }
      const errors = {
        list: [{ href: '#referralIdError', text: `No referral with identifier 'referral-id-123' found` }],
        messages: {
          referralIdError: { text: `No referral with identifier 'referral-id-123' found` },
        },
      }
      referralService.getReferralUserAssignments.mockRejectedValue(mockErrorData)

      await referralController.showAssignCaseWorkersPage(req, res)

      expect(referralService.getReferralUserAssignments).toHaveBeenCalledWith('referral-id-123', 'user1')
      expect(req.flash).toHaveBeenCalledWith('referralIdError', "No referral with identifier 'referral-id-123' found")
      expect(res.render).toHaveBeenCalledWith('referral/assign', {
        content: {
          referralId: 'referral-id-123',
          backLink: { href: '/referral-details/referral-id-123' },
        },
        errors,
      })
    })
    it('should refer the assigned case workers for the referral with existing assignments', async () => {
      req = {
        method: 'GET',
        params: { identifier: 'referral-id-123' },
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

      await referralController.showAssignCaseWorkersPage(req, res)

      expect(referralService.getReferralUserAssignments).toHaveBeenCalledWith('referral-id-123', 'user1')
      expect(res.render).toHaveBeenCalledWith('referral/assign', {
        content: {
          referralId: 'referral-id-123',
          backLink: { href: '/referral-details/referral-id-123' },
        },
        caseworkers,
      })
    })
  })

  describe('showConfirmPersonalDetails', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: {} } as unknown as Request

      await referralController.showConfirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should redirect to find a person page when there is no referralId in session', async () => {
      req = { session: {} } as unknown as Request

      await referralController.showConfirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should render the confirm personal details page using the stored draftReferralId', async () => {
      req = {
        session: { draftReferralId: 'referral-uuid-1', personId: 'X123456' },
      } as unknown as Request
      const personalDetails = { personalDetails: { crn: 'X123456' } } as unknown as ConfirmPersonDetailsBffDto
      referralService.getPersonalDetails.mockResolvedValue(personalDetails)

      await referralController.showConfirmPersonalDetails(req, res)

      expect(referralService.getPersonalDetails).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(ConfirmPersonalDetailsPresenter).toHaveBeenCalledWith(personalDetails)
      expect(ConfirmPersonalDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('confirmPersonalDetails', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: {} } as unknown as Request

      await referralController.showConfirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should render the confirm personal details page using the draft referral id', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      const personalDetails = { personalDetails: { crn: 'X123456' } } as unknown as ConfirmPersonDetailsBffDto
      referralService.getPersonalDetails.mockResolvedValue(personalDetails)

      await referralController.showConfirmPersonalDetails(req, res)

      expect(referralService.getPersonalDetails).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(ConfirmPersonalDetailsPresenter).toHaveBeenCalledWith(personalDetails)
      expect(ConfirmPersonalDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should redirect to find a person page when fetching personal details fails', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' }, flash: jest.fn() } as unknown as Request
      referralService.getPersonalDetails.mockRejectedValue(new Error('error retrieving personal details'))

      await referralController.showConfirmPersonalDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })
  })

  describe('showRiskSummary', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: {} } as unknown as Request

      await referralController.showRiskSummary(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should render the risk summary page using the draft referral id', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      const risk = { firstName: 'Alex', lastName: 'River', crn: 'X123456' } as unknown as CommunitySupportRiskDto
      referralService.getRoshRisksByReferralId.mockResolvedValue(risk)

      await referralController.showRiskSummary(req, res)

      expect(referralService.getPersonalDetails).not.toHaveBeenCalled()
      expect(referralService.getRoshRisksByReferralId).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(RiskSummaryPresenter).toHaveBeenCalledWith(risk, 'referral-uuid-1')
      expect(RiskSummaryPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should propagate the error when the risk information cannot be retrieved', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      const apiError = new Error('error retrieving risk information')
      referralService.getRoshRisksByReferralId.mockRejectedValue(apiError)

      await expect(referralController.showRiskSummary(req, res)).rejects.toThrow('error retrieving risk information')

      expect(RiskSummaryPresenter.prototype.renderPage).not.toHaveBeenCalled()
    })
  })

  describe('confirmRiskSummary', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: {} } as unknown as Request

      await referralController.confirmRiskSummary(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should save the risk information and redirect to the task list', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      const risk = {
        firstName: 'Alex',
        lastName: 'River',
        crn: 'X123456',
        summary: {
          whoIsAtRisk: 'Public, known adults and staff are at risk.',
          natureOfRisk: 'Physical violence and intimidation towards others.',
          riskImminence: 'Risk is immediate.',
        },
        riskToSelf: {
          suicide: { risk: 'YES', currentConcernsText: 'Suicide concern' },
          selfHarm: { risk: 'DK' },
          hostelSetting: { risk: 'NO' },
          vulnerability: { risk: 'YES', currentConcernsText: 'Vulnerability concern' },
        },
        additionalInformation: 'Custody concern',
      } as unknown as CommunitySupportRiskDto
      referralService.getRoshRisksByReferralId.mockResolvedValue(risk)

      await referralController.confirmRiskSummary(req, res)

      expect(referralService.getRoshRisksByReferralId).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(referralService.saveRiskInformation).toHaveBeenCalledWith(
        'referral-uuid-1',
        {
          riskSummaryWhoIsAtRisk: 'Public, known adults and staff are at risk.',
          riskSummaryNatureOfRisk: 'Physical violence and intimidation towards others.',
          riskSummaryRiskImminence: 'Risk is immediate.',
          riskToSelfSuicide: 'Suicide concern',
          riskToSelfSelfHarm: undefined,
          riskToSelfHostelSetting: undefined,
          riskToSelfVulnerability: 'Vulnerability concern',
          additionalInformation: 'Custody concern',
        },
        'user1',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list')
    })

    it('should propagate the error when the risk information cannot be retrieved', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      referralService.getRoshRisksByReferralId.mockRejectedValue(new Error('error retrieving risk information'))

      await expect(referralController.confirmRiskSummary(req, res)).rejects.toThrow('error retrieving risk information')

      expect(referralService.saveRiskInformation).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('should propagate the error when saving the risk information fails', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      const risk = { firstName: 'Alex', lastName: 'River', crn: 'X123456' } as unknown as CommunitySupportRiskDto
      referralService.getRoshRisksByReferralId.mockResolvedValue(risk)
      referralService.saveRiskInformation.mockRejectedValue(new Error('error saving risk information'))

      await expect(referralController.confirmRiskSummary(req, res)).rejects.toThrow('error saving risk information')

      expect(res.redirect).not.toHaveBeenCalledWith('/referral/task-list')
    })
  })

  describe('showEditRiskSummary', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: {} } as unknown as Request

      await referralController.showEditRiskSummary(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should render the edit risk summary page using the draft referral risk data', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      const risk = { firstName: 'Alex', lastName: 'River', crn: 'X123456' } as unknown as CommunitySupportRiskDto
      referralService.getRoshRisksByReferralId.mockResolvedValue(risk)

      await referralController.showEditRiskSummary(req, res)

      expect(referralService.getRoshRisksByReferralId).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(EditRiskSummaryPresenter).toHaveBeenCalledWith(risk)
      expect(EditRiskSummaryPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should propagate the error when the risk information cannot be retrieved', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request
      referralService.getRoshRisksByReferralId.mockRejectedValue(new Error('error retrieving risk information'))

      await expect(referralController.showEditRiskSummary(req, res)).rejects.toThrow(
        'error retrieving risk information',
      )

      expect(EditRiskSummaryPresenter.prototype.renderPage).not.toHaveBeenCalled()
    })
  })

  describe('submitEditRiskSummary', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: {}, body: {} } as unknown as Request

      await referralController.submitEditRiskSummary(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should save the submitted risk information and redirect to the view risk summary page', async () => {
      req = {
        session: { draftReferralId: 'referral-uuid-1' },
        body: {
          riskSummaryWhoIsAtRisk: 'Public, known adults and staff are at risk.',
          riskSummaryNatureOfRisk: 'Physical violence and intimidation towards others.',
          riskSummaryRiskImminence: 'Risk is immediate.',
          riskToSelfSuicide: 'Suicide concern',
          riskToSelfSelfHarm: 'Self harm concern',
          riskToSelfHostelSetting: 'Hostel setting concern',
          riskToSelfVulnerability: 'Vulnerability concern',
          additionalInformation: 'Custody concern',
        },
      } as unknown as Request

      await referralController.submitEditRiskSummary(req, res)

      expect(referralService.saveRiskInformation).toHaveBeenCalledWith(
        'referral-uuid-1',
        {
          riskSummaryWhoIsAtRisk: 'Public, known adults and staff are at risk.',
          riskSummaryNatureOfRisk: 'Physical violence and intimidation towards others.',
          riskSummaryRiskImminence: 'Risk is immediate.',
          riskToSelfSuicide: 'Suicide concern',
          riskToSelfSelfHarm: 'Self harm concern',
          riskToSelfHostelSetting: 'Hostel setting concern',
          riskToSelfVulnerability: 'Vulnerability concern',
          additionalInformation: 'Custody concern',
        },
        'user1',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list/view-risk-summary')
    })

    it('should propagate the error when saving the risk information fails', async () => {
      req = {
        session: { draftReferralId: 'referral-uuid-1' },
        body: { riskSummaryWhoIsAtRisk: 'Updated information.' },
      } as unknown as Request
      referralService.saveRiskInformation.mockRejectedValue(new Error('error saving risk information'))

      await expect(referralController.submitEditRiskSummary(req, res)).rejects.toThrow('error saving risk information')

      expect(res.redirect).not.toHaveBeenCalledWith('/referral/task-list/view-risk-summary')
    })
  })

  describe('showPersonNeeds', () => {
    beforeEach(() => {
      delete req.session
    })
    it('should redirect to find a person when there is no draft referral in session', async () => {
      req = { session: {}, body: {} } as unknown as Request

      await referralController.showPersonNeeds(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should render the person needs page with a blank form the first time', async () => {
      req = {
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: {
            personDetails: {
              firstName: 'Alex',
              lastName: 'Smith',
            },
          },
        },
      } as unknown as Request
      referralService.getPersonNeeds.mockRejectedValue('Person Needs not found')

      const expectedPageData = {
        referralId: 'referral-uuid-1',
        refereeName: { firstName: 'Alex', middleName: undefined, lastName: 'Smith' },
      } as unknown as personNeedsFormData

      await referralController.showPersonNeeds(req, res)

      expect(referralService.getPersonNeeds).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(PersonNeedsPresenter).toHaveBeenCalledWith(expectedPageData, undefined)
      expect(PersonNeedsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should render the person needs page with form data from the back end', async () => {
      req = {
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: {},
        },
      } as unknown as Request
      const mockPersonNeeds = {
        id: 'uuid-1',
        referralId: 'referral-uuid-1',
        refereeName: { firstName: 'Alex', lastName: 'Smith' },
        hasAccommodationNeeds: true,
        accommodationDetails: 'accommodation details',
      } as ReferralCriminogenicNeedsDto
      referralService.getPersonNeeds.mockResolvedValue(mockPersonNeeds)

      await referralController.showPersonNeeds(req, res)

      expect(referralService.getPersonNeeds).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(PersonNeedsPresenter).toHaveBeenCalledWith(mockPersonNeeds, undefined)
      expect(PersonNeedsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should render the person needs page with form data from the session and not call the back end', async () => {
      req = {
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: {
            personDetails: {
              firstName: 'Alex',
              lastName: 'Smith',
            },
            personNeeds: {
              personNeedsCheckboxes: ['employment'],
              employmentInput: 'employment details',
            },
          },
        },
      } as unknown as Request

      const expectedPageData = {
        referralId: 'referral-uuid-1',
        refereeName: { firstName: 'Alex', middleName: undefined, lastName: 'Smith' },
        hasAccommodationNeeds: false,
        accommodationDetails: undefined,
        hasEmploymentEducationNeeds: true,
        employmentEducationDetails: 'employment details',
        hasFinancialNeeds: false,
        financialDetails: undefined,
        hasPersonalRelationshipsCommunityNeeds: false,
        personalRelationshipsCommunityDetails: undefined,
        hasDrugUseNeeds: false,
        drugUseDetails: undefined,
        hasAlcoholUseNeeds: false,
        alcoholUseDetails: undefined,
        hasHealthWellbeingNeeds: false,
        healthWellbeingDetails: undefined,
        hasThinkingBehavioursAttitudeNeeds: false,
        thinkingBehavioursAttitudeDetails: undefined,
      } as unknown as personNeedsFormData

      await referralController.showPersonNeeds(req, res)

      expect(referralService.getPersonNeeds).not.toHaveBeenCalled()
      expect(PersonNeedsPresenter).toHaveBeenCalledWith(expectedPageData, undefined)
      expect(PersonNeedsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('showConfirmAnAreaForReferral', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = {
        session: {
          selectedProviderId: 'provider-id-123',
          referralCreationDetails: { personDetails: { firstName: 'Alex', lastName: 'River' } },
        },
      } as unknown as Request

      await referralController.showConfirmAnAreaForReferral(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
      expect(communityServiceProviderService.getCommunityServiceProviderDetails).not.toHaveBeenCalled()
    })

    it('should redirect to find a person page when there is no person in session', async () => {
      req = {
        session: { draftReferralId: 'referral-uuid-1', selectedProviderId: 'provider-id-123' },
      } as unknown as Request

      await referralController.showConfirmAnAreaForReferral(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
      expect(communityServiceProviderService.getCommunityServiceProviderDetails).not.toHaveBeenCalled()
    })

    it('should redirect to select an area for referral when there is no selected provider in session', async () => {
      req = {
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: { firstName: 'Alex', lastName: 'River' } },
        },
      } as unknown as Request

      await referralController.showConfirmAnAreaForReferral(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list/select-an-area-for-referral')
      expect(communityServiceProviderService.getCommunityServiceProviderDetails).not.toHaveBeenCalled()
    })

    it('should render the confirm an area for referral page using the provider details and the person details from session', async () => {
      const personDetails = { firstName: 'Alex', lastName: 'River', dateOfBirth: '1975-02-20' }
      req = {
        session: {
          draftReferralId: 'referral-uuid-1',
          selectedProviderId: 'provider-id-123',
          referralCreationDetails: { personDetails },
        },
      } as unknown as Request
      const providerDetails = {
        deliveryPartner: 'Ingeus UK Limited',
        contractArea: 'Avon and Somerset, Gloucestershire, Wiltshire.',
        associatedPdus: ['Bath and North Somerset'],
        crn: 'X123456',
        dateOfBirth: '1975-02-20',
      }
      communityServiceProviderService.getCommunityServiceProviderDetails.mockResolvedValue(providerDetails)

      await referralController.showConfirmAnAreaForReferral(req, res)

      expect(communityServiceProviderService.getCommunityServiceProviderDetails).toHaveBeenCalledWith(
        'referral-uuid-1',
        'provider-id-123',
        'user1',
      )
      expect(referralService.getPersonalDetails).not.toHaveBeenCalled()
      expect(ConfirmAnAreaForReferralPresenter).toHaveBeenCalledWith(providerDetails, personDetails)
      expect(ConfirmAnAreaForReferralPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should propagate the error when the provider details cannot be retrieved', async () => {
      req = {
        session: {
          draftReferralId: 'referral-uuid-1',
          selectedProviderId: 'provider-id-123',
          referralCreationDetails: { personDetails: { firstName: 'Alex', lastName: 'River' } },
        },
      } as unknown as Request
      communityServiceProviderService.getCommunityServiceProviderDetails.mockRejectedValue(
        new Error('error retrieving provider details'),
      )

      await expect(referralController.showConfirmAnAreaForReferral(req, res)).rejects.toThrow(
        'error retrieving provider details',
      )

      expect(ConfirmAnAreaForReferralPresenter.prototype.renderPage).not.toHaveBeenCalled()
    })
  })

  describe('submitConfirmAnAreaForReferral', () => {
    it('should redirect to find a person page when there is no draft referral in session', async () => {
      req = { session: { selectedProviderId: 'provider-id-123' } } as unknown as Request

      await referralController.submitConfirmAnAreaForReferral(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
      expect(communityServiceProviderService.saveCommunityServiceProvider).not.toHaveBeenCalled()
    })

    it('should redirect to select an area for referral when there is no selected provider in session', async () => {
      req = { session: { draftReferralId: 'referral-uuid-1' } } as unknown as Request

      await referralController.submitConfirmAnAreaForReferral(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list/select-an-area-for-referral')
      expect(communityServiceProviderService.saveCommunityServiceProvider).not.toHaveBeenCalled()
    })

    it('should save the selected provider and redirect to the task list', async () => {
      req = {
        session: { draftReferralId: 'referral-uuid-1', selectedProviderId: 'provider-id-123' },
      } as unknown as Request

      await referralController.submitConfirmAnAreaForReferral(req, res)

      expect(communityServiceProviderService.saveCommunityServiceProvider).toHaveBeenCalledWith(
        'referral-uuid-1',
        'provider-id-123',
        'user1',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list')
    })

    it('should propagate the error when saving the selected provider fails', async () => {
      req = {
        session: { draftReferralId: 'referral-uuid-1', selectedProviderId: 'provider-id-123' },
      } as unknown as Request
      communityServiceProviderService.saveCommunityServiceProvider.mockRejectedValue(new Error('error saving provider'))

      await expect(referralController.submitConfirmAnAreaForReferral(req, res)).rejects.toThrow('error saving provider')

      expect(res.redirect).not.toHaveBeenCalledWith('/referral/task-list')
    })
  })

  describe('showSelectArea', () => {
    const mockLocations = {
      communitySupportServices: {
        Cleveland: [
          {
            id: 'service-1',
            area: 'Cleveland North',
            region: 'Cleveland',
            pdus: ['PDU1'],
            name: 'Community Support Service in Cleveland',
            providerName: 'ProviderName',
            description: 'description',
          },
        ],
      },
    }
    const mockPersonDetails = {
      firstName: 'Alex',
      lastName: 'River',
      personIdentifier: 'X123456',
      prisonNumbers: ['A1234BC'],
      sex: 'Male',
      id: 'ID123',
      dateOfBirth: '20 Feb 1975 (51 years old)',
    }

    it('should redirect to find a person when there is no draft referral in session', async () => {
      req = { method: 'GET', session: {} } as unknown as Request

      await referralController.showSelectArea(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
    })

    it('should render the select area page on a GET request', async () => {
      req = {
        method: 'GET',
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      res = { ...res, locals: { user: { username: 'user1' }, errors: undefined } } as unknown as Response
      referralService.getCommunitySupportServiceProviders.mockResolvedValue(mockLocations)

      await referralController.showSelectArea(req, res)

      expect(referralService.getCommunitySupportServiceProviders).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(SelectAreaPresenter).toHaveBeenCalledWith(mockPersonDetails, mockLocations, undefined, undefined)
      expect(SelectAreaPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should pass the previously selected provider from session to the presenter', async () => {
      req = {
        method: 'GET',
        session: {
          draftReferralId: 'referral-uuid-1',
          selectedProviderId: 'service-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      res = { ...res, locals: { user: { username: 'user1' }, errors: undefined } } as unknown as Response
      referralService.getCommunitySupportServiceProviders.mockResolvedValue(mockLocations)

      await referralController.showSelectArea(req, res)

      expect(SelectAreaPresenter).toHaveBeenCalledWith(mockPersonDetails, mockLocations, undefined, 'service-1')
      expect(SelectAreaPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should pass validation errors to presenter on GET after failed POST', async () => {
      const validationErrors = {
        list: [{ href: '#selectArea', text: 'Select an area for the referral' }],
        messages: { selectArea: { text: 'Select an area for the referral' } },
      }
      req = {
        method: 'GET',
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      res = { ...res, locals: { user: { username: 'user1' }, errors: validationErrors } } as unknown as Response
      referralService.getCommunitySupportServiceProviders.mockResolvedValue(mockLocations)

      await referralController.showSelectArea(req, res)

      expect(SelectAreaPresenter).toHaveBeenCalledWith(
        mockPersonDetails,
        mockLocations,
        expect.objectContaining({
          list: expect.arrayContaining([
            expect.objectContaining({ href: '#selectArea', text: 'Select an area for the referral' }),
          ]),
          messages: expect.objectContaining({
            selectArea: { text: 'Select an area for the referral' },
          }),
        }),
        undefined,
      )
      expect(SelectAreaPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should store the selected provider in session and redirect to the confirm an area page on a valid POST', async () => {
      const session: Record<string, unknown> = {
        draftReferralId: 'referral-uuid-1',
        referralCreationDetails: { personDetails: mockPersonDetails },
      }
      req = {
        method: 'POST',
        body: { selectArea: 'service-1' },
        session,
      } as unknown as Request

      await referralController.showSelectArea(req, res)

      expect(session.selectedProviderId).toBe('service-1')
      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list/confirm-an-area-for-referral')
    })
  })

  describe('showCheckPPDetails', () => {
    const mockPersonDetails = {
      firstName: 'Alex',
      lastName: 'River',
      personIdentifier: 'X123456',
      prisonNumbers: ['A1234BC'],
      sex: 'Male',
      id: 'ID123',
      dateOfBirth: '20 Feb 1975 (51 years old)',
    }
    const mockPPDetails = {
      name: 'Fake PP',
      jobRole: 'Probation Practitioner',
      emailAddress: 'fake.pp@example.com',
      pdu: 'Northumberland',
    }

    it('should redirect to find a person when there is no draft referral in session', async () => {
      req = { method: 'GET', session: {} } as unknown as Request

      await referralController.showCheckPPDetails(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
      expect(referralService.getPPDetails).not.toHaveBeenCalled()
    })

    it('should render the check PP details page on a GET request', async () => {
      req = {
        method: 'GET',
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      res = { ...res, locals: { user: { username: 'user1' }, errors: undefined } } as unknown as Response
      referralService.getPPDetails.mockResolvedValue(mockPPDetails)

      await referralController.showCheckPPDetails(req, res)

      expect(referralService.getPPDetails).toHaveBeenCalledWith('referral-uuid-1', 'user1')
      expect(CheckPPDetailsPresenter).toHaveBeenCalledWith(mockPersonDetails, mockPPDetails, undefined)
      expect(CheckPPDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should pass validation errors to presenter on GET after failed POST', async () => {
      const validationErrors = {
        list: [{ href: '#detailsCorrect', text: 'Select yes if these details are correct' }],
        messages: { detailsCorrect: { text: 'Select yes if these details are correct' } },
      }
      req = {
        method: 'GET',
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      res = { ...res, locals: { user: { username: 'user1' }, errors: validationErrors } } as unknown as Response
      referralService.getPPDetails.mockResolvedValue(mockPPDetails)

      await referralController.showCheckPPDetails(req, res)

      expect(CheckPPDetailsPresenter).toHaveBeenCalledWith(mockPersonDetails, mockPPDetails, validationErrors)
      expect(CheckPPDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('should confirm the PP details and redirect to the task list when details are correct', async () => {
      req = {
        method: 'POST',
        body: { detailsCorrect: 'true' },
        flash: jest.fn(),
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      referralService.getPPDetails.mockResolvedValue({ ...mockPPDetails })

      await referralController.showCheckPPDetails(req, res)

      expect(referralService.submitPPDetails).toHaveBeenCalledWith(
        'referral-uuid-1',
        'user1',
        expect.objectContaining({ ...mockPPDetails, ppDetailsFoundAndCorrect: true }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list')
      expect(CheckPPDetailsPresenter.prototype.renderPage).not.toHaveBeenCalled()
    })

    it('should not submit PP details when details are not correct', async () => {
      req = {
        method: 'POST',
        body: { detailsCorrect: 'false' },
        flash: jest.fn(),
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      referralService.getPPDetails.mockResolvedValue({ ...mockPPDetails })

      await referralController.showCheckPPDetails(req, res)

      expect(referralService.submitPPDetails).not.toHaveBeenCalled()
      // TODO: this currently redirects to the task list in following PR will redirect to the add contact page
      expect(res.redirect).toHaveBeenCalledWith('/referral/task-list')
    })

    it('should propagate the error when the PP details cannot be retrieved', async () => {
      req = {
        method: 'GET',
        session: {
          draftReferralId: 'referral-uuid-1',
          referralCreationDetails: { personDetails: mockPersonDetails },
        },
      } as unknown as Request
      referralService.getPPDetails.mockRejectedValue(new Error('error retrieving PP details'))

      await expect(referralController.showCheckPPDetails(req, res)).rejects.toThrow('error retrieving PP details')

      expect(CheckPPDetailsPresenter.prototype.renderPage).not.toHaveBeenCalled()
    })
  })
})

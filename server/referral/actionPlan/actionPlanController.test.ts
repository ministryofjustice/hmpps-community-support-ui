import { Request, Response } from 'express'
import type {
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSessionDeliveryDetailsResponse,
  ActionPlanSummaryDto,
} from '@community-support-api'
import ReferralService from '../../services/referralService'
import ActionPlanController from './actionPlanController'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSessionDeliveryDetailsPresenter from './sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter'
import buildSessionDeliveryDetailsRequestFromForm from './sessionDeliveryDetails/buildSessionDeliveryDetailsRequestFromForm'
import applySessionDeliveryDetailsData from './sessionDeliveryDetails/applySessionDeliveryDetailsData'

jest.mock('../../services/referralService')
jest.mock('./actionPlanPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter')
jest.mock('./sessionDeliveryDetails/buildSessionDeliveryDetailsRequestFromForm')
jest.mock('./sessionDeliveryDetails/applySessionDeliveryDetailsData')

describe('ActionPlanController', () => {
  let referralService: jest.Mocked<ReferralService>
  let actionPlanController: ActionPlanController
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = {
      getActionPlanSummary: jest.fn(),
      getSessionDeliveryDetails: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>

    actionPlanController = new ActionPlanController(referralService)

    req = {
      params: {
        id: 'AB1234CD',
      },
      body: {},
      session: {},
    } as unknown as Request

    res = {
      locals: {
        user: { username: 'user1' },
        content: {
          pageHeader: 'Action plan for {{ fullName }}',
        },
      },
      render: jest.fn(),
    } as unknown as Response
  })

  it('renders action plan page with summary data', async () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: {
        fullName: 'Alex River',
      },
      needs: [],
    }

    referralService.getActionPlanSummary.mockResolvedValue(actionPlanSummary)

    await actionPlanController.showActionPlanPage(req, res)

    expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
    expect(ActionPlanPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
  })

  it('renders the session delivery details page with backend questions', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }
    jest.mocked(applySessionDeliveryDetailsData).mockReturnValue(sessionDeliveryDetails)

    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

    expect(referralService.getSessionDeliveryDetails).toHaveBeenCalledWith('AB1234CD', 'user1')
    expect(applySessionDeliveryDetailsData).toHaveBeenCalledWith(sessionDeliveryDetails, undefined)
    expect(ActionPlanSessionDeliveryDetailsPresenter).toHaveBeenCalledWith('AB1234CD', sessionDeliveryDetails)
    expect(ActionPlanSessionDeliveryDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
  })

  it('uses the saved session-delivery draft for the current referral only', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }
    const draft: ActionPlanSessionDeliveryDetailsRequest = {
      answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'saved' }] }],
    }
    jest.mocked(applySessionDeliveryDetailsData).mockReturnValue(sessionDeliveryDetails)
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    req.session = {
      actionPlanSessionDelivery: {
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: draft,
      },
    } as Request['session']

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

    expect(applySessionDeliveryDetailsData).toHaveBeenCalledWith(sessionDeliveryDetails, draft)
  })

  it('ignores a saved session-delivery draft from a different referral', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }
    jest.mocked(applySessionDeliveryDetailsData).mockReturnValue(sessionDeliveryDetails)
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    req.session = {
      actionPlanSessionDelivery: {
        caseReference: 'ZZ9999ZZ',
        sessionDeliveryDetails: {
          answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'saved' }] }],
        },
      },
    } as Request['session']

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

    expect(applySessionDeliveryDetailsData).toHaveBeenCalledWith(sessionDeliveryDetails, undefined)
  })

  it('stores the session-delivery draft as a single session object', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }
    const requestPayload: ActionPlanSessionDeliveryDetailsRequest = {
      answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'saved' }] }],
    }
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    jest.mocked(buildSessionDeliveryDetailsRequestFromForm).mockReturnValue(requestPayload)
    res.redirect = jest.fn()

    await actionPlanController.saveSessionDeliveryDetails(req, res)

    expect(req.session.actionPlanSessionDelivery).toEqual({
      caseReference: 'AB1234CD',
      sessionDeliveryDetails: requestPayload,
    })
    expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
  })
})

import { Request, Response } from 'express'
import { ActionPlanSummaryDto } from '@community-support-api'
import ReferralService from '../../services/referralService'
import ActionPlanController from './actionPlanController'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'

jest.mock('../../services/referralService')
jest.mock('./actionPlanPresenter')
jest.mock('./selectANeed/actionPlanSelectANeedPresenter')

describe('ActionPlanController', () => {
  let referralService: jest.Mocked<ReferralService>
  let actionPlanController: ActionPlanController
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = {
      getActionPlanSummary: jest.fn(),
      getActionPlanNeedsAndOutcomes: jest.fn(),
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
      redirect: jest.fn(),
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

  describe('select a need', () => {
    const needs = [
      { id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'outcome-1', text: 'Outcome one' }] },
      {
        id: 'need-2',
        label: 'Employment',
        outcomes: [
          { id: 'outcome-2', text: 'Outcome two' },
          { id: 'outcome-3', text: 'Outcome three' },
        ],
      },
    ]

    it('stores the needs and outcomes in session and renders the page', async () => {
      referralService.getActionPlanNeedsAndOutcomes.mockResolvedValue({ needs })

      await actionPlanController.showSelectANeedPage(req, res)

      expect(referralService.getActionPlanNeedsAndOutcomes).toHaveBeenCalledWith('user1')
      expect(req.session.actionPlan).toEqual({ needs })
      expect(ActionPlanSelectANeedPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('redirects to select an outcome when the selected need has more than one outcome', async () => {
      req.session.actionPlan = { needs }
      req.body = { needId: 'need-2' }

      await actionPlanController.submitSelectedNeed(req, res)

      expect(req.session.actionPlan).toEqual({ needs, selectedNeedId: 'need-2' })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/select-an-outcome')
    })

    it('redirects to activities when the selected need has a single outcome', async () => {
      req.session.actionPlan = { needs }
      req.body = { needId: 'need-1' }

      await actionPlanController.submitSelectedNeed(req, res)

      expect(req.session.actionPlan).toEqual({ needs, selectedNeedId: 'need-1' })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/add-activities')
    })
  })
})

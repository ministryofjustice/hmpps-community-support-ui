import { Request, Response } from 'express'
import { ActionPlanSummaryDto } from '@community-support-api'
import ReferralService from '../../services/referralService'
import ActionPlanController from './actionPlanController'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanAddActivityPresenter from './addActivity/actionPlanAddActivityPresenter'

jest.mock('../../services/referralService')
jest.mock('./actionPlanPresenter')
jest.mock('./selectANeed/actionPlanSelectANeedPresenter')
jest.mock('./selectOutcome/actionPlanSelectOutcomePresenter')
jest.mock('./addActivity/actionPlanAddActivityPresenter')

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
      flash: jest.fn(),
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
        firstName: 'Alex',
        lastName: 'River',
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

      expect(req.session.actionPlanAction).toEqual({ needId: 'need-2' })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/select-an-outcome')
    })

    it('flashes an error and redirects back when no need is selected', async () => {
      req.session.actionPlan = { needs }

      await actionPlanController.submitSelectedNeed(req, res)

      expect(req.flash).toHaveBeenCalledWith('needIdError', 'Select which need you are creating an action for')
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/select-a-need')
    })

    it('redirects to activities when the selected need has a single outcome', async () => {
      req.session.actionPlan = { needs }
      req.body = { needId: 'need-1' }

      await actionPlanController.submitSelectedNeed(req, res)

      expect(req.session.actionPlanAction).toEqual({ needId: 'need-1', outcomeId: 'outcome-1' })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('throws when the selected need has no outcomes', async () => {
      req.session.actionPlan = {
        needs: [...needs, { id: 'need-3', label: 'Education', outcomes: [] }],
      }
      req.body = { needId: 'need-3' }

      await expect(actionPlanController.submitSelectedNeed(req, res)).rejects.toThrow(
        "No outcome found for need 'need-3'",
      )
    })
  })

  describe('select an outcome', () => {
    it('pre-selects the outcome previously chosen for the current need', async () => {
      req.session.actionPlan = {
        needs: [{ id: 'need-2', label: 'Employment', outcomes: [{ id: 'outcome-2', text: 'Outcome two' }] }],
      }
      req.session.actionPlanAction = { needId: 'need-2', outcomeId: 'outcome-2' }
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
      })

      await actionPlanController.showSelectOutcomePage(req, res)

      expect(ActionPlanSelectOutcomePresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Alex River',
        [{ id: 'outcome-2', text: 'Outcome two' }],
        'outcome-2',
      )
    })

    it('renders with no outcome pre-selected when none has been chosen yet', async () => {
      req.session.actionPlan = {
        needs: [{ id: 'need-2', label: 'Employment', outcomes: [{ id: 'outcome-2', text: 'Outcome two' }] }],
      }
      req.session.actionPlanAction = { needId: 'need-2' }
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
      })

      await actionPlanController.showSelectOutcomePage(req, res)

      expect(ActionPlanSelectOutcomePresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Alex River',
        [{ id: 'outcome-2', text: 'Outcome two' }],
        undefined,
      )
    })

    it('flashes an error and redirects back when no outcome is selected', async () => {
      req.session.actionPlan = { needs: [] }
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
      })

      await actionPlanController.submitOutcome(req, res)

      expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(req.session.formKeys).toEqual(['selectOutcomeRadio'])
      expect(req.flash).toHaveBeenCalledWith('selectOutcomeRadioError', 'Select which outcome is appropriate for Alex')
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/select-an-outcome')
    })

    it('redirects to add activity when an outcome is selected and there are no activities in session', async () => {
      req.session.actionPlanAction = { needId: 'need-2' }
      req.body = { selectOutcomeRadio: 'outcome-2' }

      await actionPlanController.submitOutcome(req, res)

      expect(req.session.actionPlanAction).toEqual({ needId: 'need-2', outcomeId: 'outcome-2' })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities/add')
    })

    it('redirects to activities when an outcome is selected and activities already exist', async () => {
      req.session.actionPlanAction = { needId: 'need-2' }
      req.session.actionPlanActivities = [{ activityProvider: 'Provider', activityDescription: 'Activity' }]
      req.body = { selectOutcomeRadio: 'outcome-2' }

      await actionPlanController.submitOutcome(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })
  })

  describe('add activity', () => {
    it('renders the add activity page with the selected need and outcome', async () => {
      req.session.actionPlan = {
        needs: [{ id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'outcome-1', text: 'Find housing' }] }],
      }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }

      await actionPlanController.showAddActivityPage(req, res)

      expect(ActionPlanAddActivityPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Accommodation',
        'Find housing',
        undefined,
        undefined,
      )
      expect(ActionPlanAddActivityPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('stores the submitted activity and returns to the activities page', async () => {
      req.session.actionPlanActivities = [
        { activityProvider: 'Existing provider', activityDescription: 'Existing activity' },
      ]
      req.body = { activityProvider: 'Local charity', activityDescription: 'Weekly support sessions' }

      await actionPlanController.addActivity(req, res)

      expect(req.session.actionPlanActivities).toEqual([
        { activityProvider: 'Existing provider', activityDescription: 'Existing activity' },
        { activityProvider: 'Local charity', activityDescription: 'Weekly support sessions' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('updates an existing activity when its index is submitted', async () => {
      req.session.actionPlanActivities = [
        { activityProvider: 'Old provider', activityDescription: 'Old details' },
        { activityProvider: 'Other provider', activityDescription: 'Other details' },
      ]
      req.body = { activityProvider: 'Updated provider', activityDescription: 'Updated details', activityIndex: '0' }

      await actionPlanController.addActivity(req, res)

      expect(req.session.actionPlanActivities).toEqual([
        { activityProvider: 'Updated provider', activityDescription: 'Updated details' },
        { activityProvider: 'Other provider', activityDescription: 'Other details' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('shows the confirmation page for the selected activity', async () => {
      req.params = { id: 'AB1234CD', activityIndex: '0' }
      req.session.actionPlanActivities = [
        { activityProvider: 'Remove provider', activityDescription: 'Remove details' },
        { activityProvider: 'Keep provider', activityDescription: 'Keep details' },
      ]

      await actionPlanController.removeActivity(req, res)

      expect(req.session.actionPlanActivities).toHaveLength(2)
      expect(res.render).toHaveBeenCalled()
    })

    it('removes an activity after confirmation', async () => {
      req.params = { id: 'AB1234CD', activityIndex: '0' }
      req.session.actionPlanActivities = [
        { activityProvider: 'Remove provider', activityDescription: 'Remove details' },
        { activityProvider: 'Keep provider', activityDescription: 'Keep details' },
      ]

      await actionPlanController.confirmRemoveActivity(req, res)

      expect(req.session.actionPlanActivities).toEqual([
        { activityProvider: 'Keep provider', activityDescription: 'Keep details' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })
  })

  describe('save activities', () => {
    it('redirects to add activity when yes is selected', async () => {
      req.body = { addAnotherActivity: 'yes' }

      await actionPlanController.saveActivities(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities/add')
    })

    it('redirects to the action plan when no is selected', async () => {
      req.body = { addAnotherActivity: 'no' }

      await actionPlanController.saveActivities(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })

    it('requires a yes or no selection', async () => {
      req.body = {}

      await actionPlanController.saveActivities(req, res)

      expect(req.session.formKeys).toEqual(['addAnotherActivity'])
      expect(req.flash).toHaveBeenCalledWith(
        'addAnotherActivityError',
        'Select yes if you want to add another activity',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })
  })
})

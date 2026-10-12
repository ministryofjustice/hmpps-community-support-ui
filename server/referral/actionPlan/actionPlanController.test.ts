import { Request, Response } from 'express'
import type { ActionPlanSessionDeliveryDetailsResponse, ActionPlanSummaryDto } from '@community-support-api'
import type { ErrorMiddlewareErrors } from '../../@types/express'
import ReferralService from '../../services/referralService'
import ActionPlanController from './actionPlanController'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanAddActivityPresenter from './addActivity/actionPlanAddActivityPresenter'
import ActionPlanViewActivitiesPresenter from './viewActivities/actionPlanViewActivitiesPresenter'
import ActionPlanRemoveActivityPresenter from './removeActivity/actionPlanRemoveActivityPresenter'
import ActionPlanSessionDeliveryDetailsPresenter from './sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter'
import ActionPlanRisksAndAdjustmentsPresenter from './sessionDeliveryDetails/actionPlanRisksAndAdjustmentsPresenter'
import ActionPlanServiceEndDateCheckPresenter from './sessionDeliveryDetails/actionPlanServiceEndDateCheckPresenter'
import ActionPlanChangeServiceEndDatePresenter from './sessionDeliveryDetails/actionPlanChangeServiceEndDatePresenter'
import buildReferralProgress from '../../testutils/buildReferralProgress'

jest.mock('../../services/referralService')
jest.mock('./actionPlanPresenter')
jest.mock('./selectANeed/actionPlanSelectANeedPresenter')
jest.mock('./selectOutcome/actionPlanSelectOutcomePresenter')
jest.mock('./addActivity/actionPlanAddActivityPresenter')
jest.mock('./viewActivities/actionPlanViewActivitiesPresenter')
jest.mock('./removeActivity/actionPlanRemoveActivityPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanRisksAndAdjustmentsPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanServiceEndDateCheckPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanChangeServiceEndDatePresenter')

describe('ActionPlanController', () => {
  let referralService: jest.Mocked<ReferralService>
  let actionPlanController: ActionPlanController
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = {
      getActionPlanSummary: jest.fn(),
      getReferralProgress: jest.fn(),
      getActionPlanNeedsAndOutcomes: jest.fn(),
      getSessionDeliveryDetails: jest.fn(),
      getRisksAndAdjustments: jest.fn(),
      getServiceEndDateCheck: jest.fn(),
      submitAction: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>

    actionPlanController = new ActionPlanController(referralService)

    req = {
      params: {
        id: 'AB1234CD',
      },
      body: {},
      session: {},
      flash: jest.fn().mockReturnValue([]),
    } as unknown as Request

    res = {
      locals: {
        user: { username: 'user1' },
        content: {
          pageHeader: 'Action plan',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('action plan page', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: {
        firstName: 'Alex',
        lastName: 'River',
      },
      needs: [],
    }

    beforeEach(() => {
      referralService.getActionPlanSummary.mockResolvedValue(actionPlanSummary)
    })

    it('renders action plan page with summary data', async () => {
      referralService.getReferralProgress.mockResolvedValue(buildReferralProgress([]))

      await actionPlanController.showActionPlanPage(req, res)

      expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(referralService.getReferralProgress).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(ActionPlanPresenter).toHaveBeenLastCalledWith(actionPlanSummary, 'AB1234CD', false)
      expect(ActionPlanPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('passes icsFeedbackSubmitted as true when the ICS feedback has been submitted', async () => {
      referralService.getReferralProgress.mockResolvedValue(
        buildReferralProgress([{ event: { status: 'COMPLETED', icsFeedbackId: 'feedback-1' } }]),
      )

      await actionPlanController.showActionPlanPage(req, res)

      expect(ActionPlanPresenter).toHaveBeenLastCalledWith(actionPlanSummary, 'AB1234CD', true)
    })

    it('passes icsFeedbackSubmitted as false when the ICS feedback has not been submitted', async () => {
      referralService.getReferralProgress.mockResolvedValue(
        buildReferralProgress([{ event: { status: 'NEEDS_FEEDBACK' } }]),
      )

      await actionPlanController.showActionPlanPage(req, res)

      expect(ActionPlanPresenter).toHaveBeenLastCalledWith(actionPlanSummary, 'AB1234CD', false)
    })
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

    it('redirects to add activity when the selected need has one outcome and no activities exist', async () => {
      req.session.actionPlan = { needs }
      req.body = { needId: 'need-1' }

      await actionPlanController.submitSelectedNeed(req, res)

      expect(req.session.actionPlanAction).toEqual({ needId: 'need-1', outcomeId: 'outcome-1' })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities/add')
    })

    it('redirects to activities when a single-outcome need is selected and this referral already has activities', async () => {
      req.session.actionPlan = { needs }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Provider', activityDescription: 'Activity' }],
      }
      req.body = { needId: 'need-1' }

      await actionPlanController.submitSelectedNeed(req, res)

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
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Provider', activityDescription: 'Activity' }],
      }
      req.body = { selectOutcomeRadio: 'outcome-2' }

      await actionPlanController.submitOutcome(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('does not treat activities from another referral as existing activities', async () => {
      req.params = { id: 'ZZ9876YY' }
      req.session.actionPlanAction = { needId: 'need-2' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Provider A', activityDescription: 'Activity for referral A' }],
      }
      req.body = { selectOutcomeRadio: 'outcome-2' }

      await actionPlanController.submitOutcome(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/ZZ9876YY/action-plan/activities/add')
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
        undefined,
      )
      expect(ActionPlanAddActivityPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('stores the submitted activity and returns to the activities page', async () => {
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Existing provider', activityDescription: 'Existing activity' }],
      }
      req.body = { activityProvider: 'Local charity', activityDescription: 'Weekly support sessions' }

      await actionPlanController.addActivity(req, res)

      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'AB1234CD',
        activities: [
          { activityProvider: 'Existing provider', activityDescription: 'Existing activity' },
          { activityProvider: 'Local charity', activityDescription: 'Weekly support sessions' },
        ],
      })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('rejects blank or whitespace-only activity fields without changing the session activities', async () => {
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Existing provider', activityDescription: 'Existing activity' }],
      }
      req.url = '/referral/AB1234CD/action-plan/activities/add'
      req.body = { activityProvider: '  ', activityDescription: '' }

      await actionPlanController.addActivity(req, res)

      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Existing provider', activityDescription: 'Existing activity' }],
      })
      expect(req.session.formKeys).toEqual(['activityProvider', 'activityDescription'])
      expect(req.flash).toHaveBeenCalledWith('activityProviderError', 'Enter who will deliver the activity')
      expect(req.flash).toHaveBeenCalledWith('activityDescriptionError', 'Enter what the activity involves')
      expect(req.flash).toHaveBeenCalledWith(
        'value',
        JSON.stringify({ activityProvider: '  ', activityDescription: '' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities/add')
    })

    it('redisplays an invalid submission with the submitted values and field errors', async () => {
      req.flash = jest.fn(key =>
        key === 'value' ? [JSON.stringify({ activityProvider: 'Community group', activityDescription: '   ' })] : [],
      ) as unknown as Request['flash']
      res.locals.errors = {
        list: [],
        messages: { activityDescription: { text: 'Enter what the activity involves' } },
      } as ErrorMiddlewareErrors
      req.query = { activityIndex: '0' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Old provider', activityDescription: 'Old details' }],
      }

      await actionPlanController.showAddActivityPage(req, res)

      expect(ActionPlanAddActivityPresenter).toHaveBeenLastCalledWith(
        'AB1234CD',
        '',
        '',
        { activityProvider: 'Old provider', activityDescription: 'Old details' },
        0,
        { activityProvider: 'Community group', activityDescription: '   ' },
      )
    })

    it('updates an existing activity when its index is submitted', async () => {
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [
          { activityProvider: 'Old provider', activityDescription: 'Old details' },
          { activityProvider: 'Other provider', activityDescription: 'Other details' },
        ],
      }
      req.body = { activityProvider: 'Updated provider', activityDescription: 'Updated details', activityIndex: '0' }

      await actionPlanController.addActivity(req, res)

      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'AB1234CD',
        activities: [
          { activityProvider: 'Updated provider', activityDescription: 'Updated details' },
          { activityProvider: 'Other provider', activityDescription: 'Other details' },
        ],
      })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('starts a separate activity collection when saving for a different referral', async () => {
      req.params = { id: 'ZZ9876YY' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Provider A', activityDescription: 'Activity for referral A' }],
      }
      req.body = { activityProvider: 'Provider B', activityDescription: 'Activity for referral B' }

      await actionPlanController.addActivity(req, res)

      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'ZZ9876YY',
        activities: [{ activityProvider: 'Provider B', activityDescription: 'Activity for referral B' }],
      })
      expect(res.redirect).toHaveBeenCalledWith('/referral/ZZ9876YY/action-plan/activities')
    })

    it('shows the remove page without the only-activity hint when there are several activities', async () => {
      req.query = { activityIndex: '0' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [
          { activityProvider: 'Remove provider', activityDescription: 'Remove details' },
          { activityProvider: 'Keep provider', activityDescription: 'Keep details' },
        ],
      }

      await actionPlanController.showRemoveActivityPage(req, res)

      expect(ActionPlanRemoveActivityPresenter).toHaveBeenCalledWith('AB1234CD', 0, false)
      expect(ActionPlanRemoveActivityPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('shows the only-activity hint when it is the only activity', async () => {
      req.query = { activityIndex: '0' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Only provider', activityDescription: 'Only details' }],
      }

      await actionPlanController.showRemoveActivityPage(req, res)

      expect(ActionPlanRemoveActivityPresenter).toHaveBeenCalledWith('AB1234CD', 0, true)
    })

    it('redirects to activities when the activity index is invalid', async () => {
      req.query = { activityIndex: '5' }

      await actionPlanController.showRemoveActivityPage(req, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('requires an option to be selected before removing', async () => {
      req.query = { activityIndex: '0' }
      req.url = '/referral/AB1234CD/action-plan/activities/remove?activityIndex=0'
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Only provider', activityDescription: 'Only details' }],
      }

      await actionPlanController.removeActivity(req, res)

      expect(req.flash).toHaveBeenCalledWith('removeActivityError', 'Select yes if you want to remove this activity')
      expect(req.session.actionPlanActivities?.activities).toHaveLength(1)
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities/remove?activityIndex=0')
    })

    it('removes the need and outcome and returns to select a need when the only activity is removed', async () => {
      req.query = { activityIndex: '0' }
      req.body = { removeActivity: 'yes' }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Only provider', activityDescription: 'Only details' }],
      }

      await actionPlanController.removeActivity(req, res)

      expect(req.session.actionPlanActivities).toBeUndefined()
      expect(req.session.actionPlanAction).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/select-a-need')
    })
  })

  describe('save activities', () => {
    it('redirects to add activity when yes is selected', async () => {
      req.body = { addAnotherActivity: 'yes' }

      await actionPlanController.saveActivities(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities/add')
    })

    it('submits the selected need, outcome and activities before redirecting when no is selected', async () => {
      req.body = { addAnotherActivity: 'no' }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
      }
      referralService.submitAction.mockResolvedValue({ success: true, message: 'Action submitted successfully' })

      await actionPlanController.saveActivities(req, res)

      expect(referralService.submitAction).toHaveBeenCalledWith(
        'AB1234CD',
        {
          needId: 'need-1',
          outcomeId: 'outcome-1',
          activities: [{ who: 'Local group', activityDetails: 'Weekly sessions', status: 'Active' }],
        },
        'user1',
      )
      expect(req.session.actionPlanAction).toBeUndefined()
      expect(req.session.actionPlanActivities).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })

    it('does not redirect to the action plan when the API reports an unsuccessful submission', async () => {
      req.body = { addAnotherActivity: 'no' }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
      }
      referralService.submitAction.mockResolvedValue({ success: false, message: 'Submission failed' })

      await expect(actionPlanController.saveActivities(req, res)).rejects.toThrow('Submission failed')
      expect(res.redirect).not.toHaveBeenCalled()
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

  describe('view activities', () => {
    it('renders the selected need, outcome, and session activities', async () => {
      req.session.actionPlan = {
        needs: [{ id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'outcome-1', text: 'Find housing' }] }],
      }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
      }

      await actionPlanController.showViewActivitiesPage(req, res)

      expect(ActionPlanViewActivitiesPresenter).toHaveBeenCalledWith('AB1234CD', 'Accommodation', 'Find housing', [
        { activityProvider: 'Local group', activityDescription: 'Weekly sessions' },
      ])
      expect(ActionPlanViewActivitiesPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('does not display or edit activities belonging to a different referral', async () => {
      req.params = { id: 'ZZ9876YY' }
      req.session.actionPlan = {
        needs: [{ id: 'need-2', label: 'Employment', outcomes: [{ id: 'outcome-2', text: 'Find work' }] }],
      }
      req.session.actionPlanAction = { needId: 'need-2', outcomeId: 'outcome-2' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Provider A', activityDescription: 'Activity for referral A' }],
      }

      await actionPlanController.showViewActivitiesPage(req, res)

      expect(ActionPlanViewActivitiesPresenter).toHaveBeenCalledWith('ZZ9876YY', 'Employment', 'Find work', [])

      req.query = { activityIndex: '0' }
      await actionPlanController.showAddActivityPage(req, res)

      expect(ActionPlanAddActivityPresenter).toHaveBeenLastCalledWith(
        'ZZ9876YY',
        'Employment',
        'Find work',
        undefined,
        undefined,
        undefined,
      )
    })
  })

  it('renders the update service end date page with the presenter', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }

    referralService.getServiceEndDateCheck.mockResolvedValue(sessionDeliveryDetails)

    await actionPlanController.showUpdateServiceEndDatePage(req, res)

    expect(referralService.getServiceEndDateCheck).toHaveBeenCalledWith('AB1234CD', 'user1')
    expect(ActionPlanChangeServiceEndDatePresenter).toHaveBeenCalledWith(
      'AB1234CD',
      sessionDeliveryDetails,
      undefined,
      undefined,
    )
    expect(ActionPlanChangeServiceEndDatePresenter.prototype.renderPage).toHaveBeenCalledWith(res)
  })

  describe('risks and adjustments', () => {
    const risksAndAdjustmentsDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'Are there risks associated with the planned activities?',
          key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'YES',
              label: 'Yes',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Provide risk information',
              additionalDetailsHint: null,
            },
            {
              value: 'NO',
              label: 'No',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
        {
          id: 'question-2',
          displayOrder: 2,
          label: 'Are reasonable adjustments needed for the planned activities?',
          key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'YES',
              label: 'Yes',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Provide adjustment information',
              additionalDetailsHint: null,
            },
            {
              value: 'NO',
              label: 'No',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
      ],
    }

    it('renders the risks and adjustments page with backend questions', async () => {
      referralService.getRisksAndAdjustments.mockResolvedValue(risksAndAdjustmentsDetails)

      await actionPlanController.showRisksAndAdjustmentsPage(req, res)

      expect(referralService.getRisksAndAdjustments).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(ActionPlanRisksAndAdjustmentsPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        risksAndAdjustmentsDetails,
        undefined,
        undefined,
      )
      expect(ActionPlanRisksAndAdjustmentsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('redirects to the service end date check page when the submitted form is valid', async () => {
      req.body = {
        RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'YES',
        RISK_INFO: 'Staff should be nearby',
        REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'YES',
        ADJUSTMENT_INFO: 'Use large print materials',
      }
      referralService.getRisksAndAdjustments.mockResolvedValue(risksAndAdjustmentsDetails)
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
      })

      await actionPlanController.submitRisksAndAdjustmentsPage(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/service-end-date-check')
      expect(req.session.actionPlanSessionDelivery).toEqual({
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: {
          answers: [
            {
              questionId: 'question-1',
              incomingAnswerDetails: [{ value: 'YES', additionalDetails: 'Staff should be nearby' }],
            },
            {
              questionId: 'question-2',
              incomingAnswerDetails: [{ value: 'YES', additionalDetails: 'Use large print materials' }],
            },
          ],
        },
      })
    })
  })

  it('renders the session delivery details page with backend questions', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }

    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

    expect(referralService.getSessionDeliveryDetails).toHaveBeenCalledWith('AB1234CD', 'user1')
    expect(ActionPlanSessionDeliveryDetailsPresenter).toHaveBeenCalledWith(
      'AB1234CD',
      sessionDeliveryDetails,
      undefined,
      undefined,
    )
    expect(ActionPlanSessionDeliveryDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
  })

  it('merges a saved session-delivery draft for the current referral into the questions passed to the presenter', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'How often will sessions take place?',
          key: 'SESSION_FREQUENCY',
          hint: null,
          answerType: 'TEXTAREA',
          maximumNumberOfResponses: 1,
          choices: null,
          savedResponses: [],
        },
      ],
    }
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    req.session = {
      actionPlanSessionDelivery: {
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: {
          answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'Every week' }] }],
        },
      },
    } as Request['session']

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

    expect(ActionPlanSessionDeliveryDetailsPresenter).toHaveBeenCalledWith(
      'AB1234CD',
      {
        questions: [
          {
            ...sessionDeliveryDetails.questions[0],
            savedResponses: [{ value: 'Every week', additionalDetails: null }],
          },
        ],
      },
      undefined,
      undefined,
    )
  })

  it('ignores a saved session-delivery draft from a different referral', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }
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

    expect(ActionPlanSessionDeliveryDetailsPresenter).toHaveBeenCalledWith(
      'AB1234CD',
      sessionDeliveryDetails,
      undefined,
      undefined,
    )
  })

  it('passes flashed form values and validation errors through to the presenter', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }
    const validationErrors: ErrorMiddlewareErrors = {
      list: [],
      messages: { SESSION_FREQUENCY: { text: 'Enter how often' } },
    }
    const flashedValue = { SESSION_FREQUENCY: 'Every week' }
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    req.flash = jest.fn().mockReturnValue([JSON.stringify(flashedValue)])
    res.locals.errors = validationErrors

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

    expect(ActionPlanSessionDeliveryDetailsPresenter).toHaveBeenCalledWith(
      'AB1234CD',
      sessionDeliveryDetails,
      validationErrors,
      flashedValue,
    )
  })

  it('redirects to the risks-and-adjustments page when the submitted form is valid', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'How often will sessions take place?',
          key: 'SESSION_FREQUENCY',
          hint: null,
          answerType: 'TEXTAREA',
          maximumNumberOfResponses: 1,
          choices: null,
          savedResponses: [],
        },
        {
          id: 'question-2',
          displayOrder: 2,
          label: 'How will the sessions take place?',
          key: 'SESSION_DELIVERY_METHOD',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'IN_PERSON',
              label: 'In person',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
        {
          id: 'question-3',
          displayOrder: 3,
          label: 'What format will you use for the sessions?',
          key: 'SESSION_FORMAT',
          hint: null,
          answerType: 'CHECKBOX',
          maximumNumberOfResponses: 2,
          choices: [
            {
              value: 'ONE_TO_ONE_SESSION',
              label: 'One-to-one session',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
      ],
    }
    req.body = {
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: 'ONE_TO_ONE_SESSION',
    }
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    res.redirect = jest.fn()

    await actionPlanController.submitSessionDeliveryDetailsPage(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/risks-and-adjustments')
    expect(req.session.actionPlanSessionDelivery).toEqual({
      caseReference: 'AB1234CD',
      sessionDeliveryDetails: {
        answers: [
          { questionId: 'question-1', incomingAnswerDetails: [{ value: 'Every week', additionalDetails: undefined }] },
          { questionId: 'question-2', incomingAnswerDetails: [{ value: 'IN_PERSON', additionalDetails: undefined }] },
          {
            questionId: 'question-3',
            incomingAnswerDetails: [{ value: 'ONE_TO_ONE_SESSION', additionalDetails: undefined }],
          },
        ],
      },
    })
  })

  it('flashes validation errors and redirects back when the submitted form is invalid', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }
    req.url = '/referral/AB1234CD/action-plan/session-delivery-details'
    req.body = {}
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    res.redirect = jest.fn()

    await actionPlanController.submitSessionDeliveryDetailsPage(req, res)

    expect(req.flash).toHaveBeenCalledWith('SESSION_DELIVERY_METHODError', 'Select how the sessions will take place')
    expect(req.flash).toHaveBeenCalledWith('SESSION_FORMATError', 'Select which format you will use for the sessions')
    expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/session-delivery-details')
  })

  describe('service end date check', () => {
    const serviceEndDateCheckDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'Is the service end date still 24 May 2026?',
          key: 'SERVICE_END_DATE_CHECK',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'YES',
              label: 'Yes',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
            {
              value: 'NO',
              label: 'No, I need to change the date',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
      ],
    }

    it('renders the service end date check page with backend questions', async () => {
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)

      await actionPlanController.showServiceEndDateCheckPage(req, res)

      expect(referralService.getServiceEndDateCheck).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(ActionPlanServiceEndDateCheckPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        serviceEndDateCheckDetails,
        undefined,
        undefined,
      )
      expect(ActionPlanServiceEndDateCheckPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('merges a saved session-delivery draft for the current referral into the questions passed to the presenter', async () => {
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)
      req.session = {
        actionPlanSessionDelivery: {
          caseReference: 'AB1234CD',
          sessionDeliveryDetails: {
            answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'NO' }] }],
          },
        },
      } as Request['session']

      await actionPlanController.showServiceEndDateCheckPage(req, res)

      expect(ActionPlanServiceEndDateCheckPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        {
          questions: [
            {
              ...serviceEndDateCheckDetails.questions[0],
              savedResponses: [{ value: 'NO', additionalDetails: null }],
            },
          ],
        },
        undefined,
        undefined,
      )
    })

    it('ignores a saved session-delivery draft from a different referral', async () => {
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)
      req.session = {
        actionPlanSessionDelivery: {
          caseReference: 'ZZ9999ZZ',
          sessionDeliveryDetails: {
            answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'NO' }] }],
          },
        },
      } as Request['session']

      await actionPlanController.showServiceEndDateCheckPage(req, res)

      expect(ActionPlanServiceEndDateCheckPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        serviceEndDateCheckDetails,
        undefined,
        undefined,
      )
    })

    it('passes flashed form values and validation errors through to the presenter', async () => {
      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: { SERVICE_END_DATE_CHECK: { text: 'Select yes if the service end date is still 24 May 2026' } },
      }
      const flashedValue = { SERVICE_END_DATE_CHECK: 'NO' }
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)
      req.flash = jest.fn().mockReturnValue([JSON.stringify(flashedValue)])
      res.locals.errors = validationErrors

      await actionPlanController.showServiceEndDateCheckPage(req, res)

      expect(ActionPlanServiceEndDateCheckPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        serviceEndDateCheckDetails,
        validationErrors,
        flashedValue,
      )
    })

    it('redirects to the person involvement page when the service end date is unchanged', async () => {
      req.body = { SERVICE_END_DATE_CHECK: 'YES' }
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)
      res.redirect = jest.fn()

      await actionPlanController.submitServiceEndDateCheckPage(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/person-involvement')
      expect(req.session.actionPlanSessionDelivery).toEqual({
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: {
          answers: [
            { questionId: 'question-1', incomingAnswerDetails: [{ value: 'YES', additionalDetails: undefined }] },
          ],
        },
      })
    })

    it('redirects to the update service end date page when the service end date has changed', async () => {
      req.body = { SERVICE_END_DATE_CHECK: 'NO' }
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)
      res.redirect = jest.fn()

      await actionPlanController.submitServiceEndDateCheckPage(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/update-service-end-date')
      expect(req.session.actionPlanSessionDelivery).toEqual({
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: {
          answers: [
            { questionId: 'question-1', incomingAnswerDetails: [{ value: 'NO', additionalDetails: undefined }] },
          ],
        },
      })
    })

    it('flashes a validation error and redirects back when the submitted form is invalid', async () => {
      req.url = '/referral/AB1234CD/action-plan/service-end-date-check'
      req.body = {}
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)
      res.redirect = jest.fn()

      await actionPlanController.submitServiceEndDateCheckPage(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'SERVICE_END_DATE_CHECKError',
        'Select yes if the service end date is still 24 May 2026',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/service-end-date-check')
    })
  })
})

import { Request, Response } from 'express'
import type {
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSessionDeliveryDetailsResponse,
  ActionPlanSummaryDto,
} from '@community-support-api'
import { addDays, format } from 'date-fns'
import type { ErrorMiddlewareErrors } from '../../@types/express'
import type { ActionPlanCheckYourAnswersDetails } from '../../services/referralService'
import ReferralService from '../../services/referralService'
import ActionPlanController from './actionPlanController'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanAddActivityPresenter from './addActivity/actionPlanAddActivityPresenter'
import ActionPlanViewActivitiesPresenter from './viewActivities/actionPlanViewActivitiesPresenter'
import ActionPlanRemoveActivityPresenter from './removeActivity/actionPlanRemoveActivityPresenter'
import ActionPlanRemoveOutcomePresenter from './removeOutcome/actionPlanRemoveOutcomePresenter'
import ActionPlanSessionDeliveryDetailsPresenter from './sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter'
import ActionPlanRisksAndAdjustmentsPresenter from './sessionDeliveryDetails/actionPlanRisksAndAdjustmentsPresenter'
import ActionPlanServiceEndDateCheckPresenter from './sessionDeliveryDetails/actionPlanServiceEndDateCheckPresenter'
import ActionPlanChangeServiceEndDatePresenter from './sessionDeliveryDetails/actionPlanChangeServiceEndDatePresenter'
import ActionPlanServiceUserInvolvementPresenter from './sessionDeliveryDetails/actionPlanServiceUserInvolvementPresenter'
import ServiceDeliveryPresenter from './serviceDelivery/serviceDeliveryPresenter'
import ServiceDeliveryCheckYourAnswersPresenter from './sessionDeliveryDetails/serviceDeliveryCheckYourAnswersPresenter'
import buildReferralProgress from '../../testutils/buildReferralProgress'
import {
  actionPlanSessionDeliveryDetailsFactory,
  actionPlanRisksAndAdjustmentsFactory,
  actionPlanCheckServiceEndDateFactory,
  actionPlanUpdateServiceEndDateFactory,
  actionPlanPersonInvolvementFactory,
} from '../../testutils/factories/ActionPlanSessionDeliveryDetailsResponse'

jest.mock('../../services/referralService')
jest.mock('./actionPlanPresenter')
jest.mock('./serviceDelivery/serviceDeliveryPresenter')
jest.mock('./selectANeed/actionPlanSelectANeedPresenter')
jest.mock('./selectOutcome/actionPlanSelectOutcomePresenter')
jest.mock('./addActivity/actionPlanAddActivityPresenter')
jest.mock('./viewActivities/actionPlanViewActivitiesPresenter')
jest.mock('./removeActivity/actionPlanRemoveActivityPresenter')
jest.mock('./removeOutcome/actionPlanRemoveOutcomePresenter')
jest.mock('./sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanRisksAndAdjustmentsPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanServiceEndDateCheckPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanChangeServiceEndDatePresenter')
jest.mock('./sessionDeliveryDetails/actionPlanServiceUserInvolvementPresenter')
jest.mock('./sessionDeliveryDetails/serviceDeliveryCheckYourAnswersPresenter')

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
      getUpdateServiceEndDate: jest.fn(),
      getPersonInvolvement: jest.fn(),
      getCheckYourAnswers: jest.fn(),
      submitServiceDeliveryDetails: jest.fn(),
      submitAction: jest.fn(),
      moveNeed: jest.fn(),
      deleteAction: jest.fn(),
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
      lastUpdatedAt: '',
    }

    beforeEach(() => {
      referralService.getActionPlanSummary.mockResolvedValue(actionPlanSummary)
    })

    it('renders action plan page with summary data', async () => {
      referralService.getReferralProgress.mockResolvedValue(buildReferralProgress([]))

      await actionPlanController.showActionPlanPage(req, res)

      expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(referralService.getReferralProgress).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(ActionPlanPresenter).toHaveBeenLastCalledWith(actionPlanSummary, 'AB1234CD', false, undefined)
      expect(ActionPlanPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('passes icsFeedbackSubmitted as true when the ICS feedback has been submitted', async () => {
      referralService.getReferralProgress.mockResolvedValue(
        buildReferralProgress([{ event: { status: 'COMPLETED', icsFeedbackId: 'feedback-1' } }]),
      )

      await actionPlanController.showActionPlanPage(req, res)

      expect(ActionPlanPresenter).toHaveBeenLastCalledWith(actionPlanSummary, 'AB1234CD', true, undefined)
    })

    it('passes icsFeedbackSubmitted as false when the ICS feedback has not been submitted', async () => {
      referralService.getReferralProgress.mockResolvedValue(
        buildReferralProgress([{ event: { status: 'NEEDS_FEEDBACK' } }]),
      )

      await actionPlanController.showActionPlanPage(req, res)

      expect(ActionPlanPresenter).toHaveBeenLastCalledWith(actionPlanSummary, 'AB1234CD', false, undefined)
    })
  })

  describe('remove outcome', () => {
    const summary: ActionPlanSummaryDto = {
      personDetails: { firstName: 'Alex', lastName: 'River' },
      lastUpdatedAt: '2026-10-12T09:00:00Z',
      needs: [
        {
          id: 'need-1',
          label: 'Accommodation',
          orderNumber: 1,
          outcomes: [
            {
              id: 'answer-outcome-1',
              label: 'Find housing',
              activities: [{ id: 'activity-1', who: 'Housing service', details: 'Attend weekly sessions' }],
            },
          ],
        },
      ],
    }
    const selectableNeeds = {
      needs: [{ id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'outcome-1', text: 'Find housing' }] }],
      selectedNeeds: [{ id: 'selected-need-1', label: 'Accommodation' }],
    }

    beforeEach(() => {
      req.params = { id: 'AB1234CD' }
      req.query = { needId: 'need-1', outcomeAnswerId: 'answer-outcome-1' }
      req.body = { needId: 'need-1', outcomeAnswerId: 'answer-outcome-1' }
      referralService.getActionPlanSummary.mockResolvedValue(summary)
      referralService.getActionPlanNeedsAndOutcomes.mockResolvedValue(selectableNeeds)
    })

    it('renders the selected need, first name and summary outcome answer', async () => {
      await actionPlanController.showRemoveOutcomePage(req, res)

      expect(ActionPlanRemoveOutcomePresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Alex',
        summary.needs[0],
        'answer-outcome-1',
      )
      expect(ActionPlanRemoveOutcomePresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('rejects invalid need and answer IDs on the POST route', async () => {
      req.body = { needId: 'missing', outcomeAnswerId: 'missing' }

      await actionPlanController.removeOutcome(req, res)

      expect(referralService.deleteAction).not.toHaveBeenCalled()
      expect(req.session.actionPlanAlertType).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })

    it('redirects to the action plan when the requested outcome cannot be resolved', async () => {
      req.query = { needId: 'missing', outcomeAnswerId: 'missing' }

      await actionPlanController.showRemoveOutcomePage(req, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(req.session.actionPlanAlertType).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })

    it('deletes the selected action and clears matching session data after success', async () => {
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Housing service', activityDescription: 'Attend weekly sessions' }],
      }
      req.session.actionPlanSessionDelivery = {
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: { answers: [] },
      }
      referralService.deleteAction.mockResolvedValue({ success: true, message: 'Action deleted successfully' })

      await actionPlanController.removeOutcome(req, res)

      expect(referralService.deleteAction).toHaveBeenCalledWith('AB1234CD', 'answer-outcome-1', 'user1')
      expect(req.session.actionPlanAction).toBeUndefined()
      expect(req.session.actionPlanActivities).toBeUndefined()
      expect(req.session.actionPlanSessionDelivery).toEqual({
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: { answers: [] },
      })
      expect(req.session.actionPlanAlertType).toBe('REMOVE')
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })

    it('preserves unrelated case session data after removing this outcome', async () => {
      req.session.actionPlanAction = { needId: 'other-need', outcomeId: 'other-outcome' }
      req.session.actionPlanActivities = {
        caseReference: 'OTHER123',
        activities: [{ activityProvider: 'Other provider', activityDescription: 'Other activity' }],
      }
      referralService.deleteAction.mockResolvedValue({ success: true, message: 'Action deleted successfully' })

      await actionPlanController.removeOutcome(req, res)

      expect(req.session.actionPlanAction).toEqual({ needId: 'other-need', outcomeId: 'other-outcome' })
      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'OTHER123',
        activities: [{ activityProvider: 'Other provider', activityDescription: 'Other activity' }],
      })
      expect(req.session.actionPlanAlertType).toBe('REMOVE')
    })

    it('preserves same-case activity drafts for a different selected outcome', async () => {
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'another-outcome' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Other provider', activityDescription: 'Other outcome activity' }],
      }
      referralService.deleteAction.mockResolvedValue({ success: true, message: 'Action deleted successfully' })

      await actionPlanController.removeOutcome(req, res)

      expect(req.session.actionPlanAction).toEqual({ needId: 'need-1', outcomeId: 'another-outcome' })
      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Other provider', activityDescription: 'Other outcome activity' }],
      })
      expect(req.session.actionPlanAlertType).toBe('REMOVE')
    })

    it('preserves activity and selection data for another referral', async () => {
      req.session.actionPlanAction = { needId: 'other-need', outcomeId: 'other-outcome' }
      req.session.actionPlanActivities = {
        caseReference: 'OTHER123',
        activities: [{ activityProvider: 'Other service', activityDescription: 'Other activities' }],
      }
      referralService.deleteAction.mockResolvedValue({ success: true, message: 'Action deleted successfully' })

      await actionPlanController.removeOutcome(req, res)

      expect(req.session.actionPlanAction).toEqual({ needId: 'other-need', outcomeId: 'other-outcome' })
      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'OTHER123',
        activities: [{ activityProvider: 'Other service', activityDescription: 'Other activities' }],
      })
      expect(req.session.actionPlanAlertType).toBe('REMOVE')
    })

    it('preserves session drafts when the API submission fails', async () => {
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Housing service', activityDescription: 'Attend weekly sessions' }],
      }
      referralService.deleteAction.mockResolvedValue({ success: false, message: 'Removal failed' })

      await expect(actionPlanController.removeOutcome(req, res)).rejects.toThrow('Removal failed')

      expect(req.session.actionPlanAction).toEqual({ needId: 'need-1', outcomeId: 'outcome-1' })
      expect(req.session.actionPlanActivities?.activities).toHaveLength(1)
      expect(req.session.actionPlanAlertType).toBeUndefined()
      expect(res.redirect).not.toHaveBeenCalled()
    })
  })

  describe('service delivery page', () => {
    it('renders the service delivery page for the referral', async () => {
      await actionPlanController.showServiceDeliveryPage(req, res)

      expect(ServiceDeliveryPresenter).toHaveBeenCalledWith('AB1234CD')
      expect(ServiceDeliveryPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
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

    beforeEach(() => {
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
        lastUpdatedAt: '',
      })
    })

    it('stores the needs and outcomes in session and renders the page', async () => {
      const selectedNeeds = [{ id: 'selected-need-1', label: 'Accommodation' }]
      referralService.getActionPlanNeedsAndOutcomes.mockResolvedValue({ needs, selectedNeeds })

      await actionPlanController.showSelectANeedPage(req, res)

      expect(referralService.getActionPlanNeedsAndOutcomes).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(req.session.actionPlan).toEqual({ needs })
      expect(ActionPlanSelectANeedPresenter).toHaveBeenCalledWith('AB1234CD', needs, selectedNeeds, undefined)
      expect(ActionPlanSelectANeedPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it.each([{ activities: [] }, { activities: [{ id: 'activity-1', who: 'Provider', details: 'Activity' }] }])(
      'excludes needs with saved outcomes regardless of activities ($activities)',
      async ({ activities }) => {
        const selectedNeeds = [{ id: 'selected-need-1', label: 'Employment' }]
        referralService.getActionPlanNeedsAndOutcomes.mockResolvedValue({ needs, selectedNeeds })
        referralService.getActionPlanSummary.mockResolvedValue({
          personDetails: { firstName: 'Alex', lastName: 'River' },
          lastUpdatedAt: '',
          needs: [
            {
              id: 'need-2',
              label: 'Employment',
              orderNumber: 1,
              outcomes: [{ id: 'saved-outcome-2', label: 'Outcome two', activities }],
            },
          ],
        })
        req.session.actionPlanAction = { needId: 'need-2' }

        await actionPlanController.showSelectANeedPage(req, res)

        expect(req.session.actionPlan?.needs).toEqual([needs[0]])
        expect(ActionPlanSelectANeedPresenter).toHaveBeenLastCalledWith('AB1234CD', [needs[0]], selectedNeeds, 'need-2')
      },
    )

    it('keeps needs without saved outcomes and matches existing actions by ID rather than label', async () => {
      referralService.getActionPlanNeedsAndOutcomes.mockResolvedValue({ needs, selectedNeeds: [] })
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        lastUpdatedAt: '',
        needs: [
          { id: 'need-1', label: 'Accommodation', orderNumber: 1, outcomes: [] },
          {
            id: 'another-need',
            label: 'Employment',
            orderNumber: 2,
            outcomes: [{ id: 'saved-outcome', label: 'Outcome', activities: [] }],
          },
        ],
      })

      await actionPlanController.showSelectANeedPage(req, res)

      expect(req.session.actionPlan?.needs).toEqual(needs)
      expect(ActionPlanSelectANeedPresenter).toHaveBeenLastCalledWith('AB1234CD', needs, [], undefined)
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

      expect(req.flash).toHaveBeenCalledWith('needIdError', 'Select which need you want to address')
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
        lastUpdatedAt: '',
      })

      await actionPlanController.showSelectOutcomePage(req, res)

      expect(ActionPlanSelectOutcomePresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Alex',
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
        lastUpdatedAt: '',
      })

      await actionPlanController.showSelectOutcomePage(req, res)

      expect(ActionPlanSelectOutcomePresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Alex',
        [{ id: 'outcome-2', text: 'Outcome two' }],
        undefined,
      )
    })

    it('flashes an error and redirects back when no outcome is selected', async () => {
      req.session.actionPlan = { needs: [] }
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
        lastUpdatedAt: '',
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
      expect(req.session.actionPlanActivityAlertType).toBe('ADD')
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
      expect(req.session.actionPlanActivityAlertType).toBeUndefined()
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

    it('sets a remove alert when one of several activities is removed', async () => {
      req.query = { activityIndex: '0' }
      req.body = { removeActivity: 'yes' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [
          { activityProvider: 'Remove provider', activityDescription: 'Remove details' },
          { activityProvider: 'Keep provider', activityDescription: 'Keep details' },
        ],
      }

      await actionPlanController.removeActivity(req, res)

      expect(req.session.actionPlanActivities?.activities).toEqual([
        { activityProvider: 'Keep provider', activityDescription: 'Keep details' },
      ])
      expect(req.session.actionPlanActivityAlertType).toBe('REMOVE')
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it('deletes a saved outcome when its last activity is removed', async () => {
      req.query = { activityIndex: '0' }
      req.body = { removeActivity: 'yes' }
      req.session.actionPlanAction = {
        needId: 'need-1',
        outcomeId: 'outcome-1',
        outcomeAnswerId: 'answer-outcome-1',
      }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Only provider', activityDescription: 'Only details' }],
      }
      referralService.deleteAction.mockResolvedValue({ success: true, message: 'Action deleted successfully' })

      await actionPlanController.removeActivity(req, res)

      expect(referralService.deleteAction).toHaveBeenCalledWith('AB1234CD', 'answer-outcome-1', 'user1')
      expect(req.session.actionPlanActivities).toBeUndefined()
      expect(req.session.actionPlanAction).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/select-a-need')
    })

    it('preserves the saved outcome and activities when deleting the last activity fails', async () => {
      req.query = { activityIndex: '0' }
      req.body = { removeActivity: 'yes' }
      req.session.actionPlanAction = {
        needId: 'need-1',
        outcomeId: 'outcome-1',
        outcomeAnswerId: 'answer-outcome-1',
      }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Only provider', activityDescription: 'Only details' }],
      }
      referralService.deleteAction.mockResolvedValue({ success: false, message: 'Removal failed' })

      await actionPlanController.removeActivity(req, res)

      expect(req.session.actionPlanActivities?.activities).toHaveLength(1)
      expect(req.session.actionPlanAction?.outcomeAnswerId).toBe('answer-outcome-1')
      expect(res.redirect).toHaveBeenCalledWith('/error')
    })
  })

  describe('save activities', () => {
    it('redirects to add activity when yes is selected', async () => {
      req.body = { addAnotherActivity: 'yes' }

      await actionPlanController.saveActivities(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities/add')
      expect(req.session.actionPlanAlertType).toBeUndefined()
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
      expect(req.session.actionPlanAlertType).toBe('ADD')
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
      expect(req.session.actionPlanAlertType).toBeUndefined()
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
      expect(req.session.actionPlanAlertType).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })

    it("doesn't show the alert banner if nothing has changed", async () => {
      req.body = { addAnotherActivity: 'no' }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
      }
      req.session.preChangeActivities = {
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
      }

      await actionPlanController.saveActivities(req, res)

      expect(referralService.submitAction).not.toHaveBeenCalled()
      expect(req.session.actionPlanAction).toBeUndefined()
      expect(req.session.actionPlanActivities).toBeUndefined()
      expect(req.session.actionPlanAlertType).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })
  })

  describe('view activities', () => {
    it('loads the selected need, outcome and activities from the action-plan summary', async () => {
      req.query = { needId: 'need-1', outcomeAnswerId: 'outcome-answer-1' }
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        lastUpdatedAt: '2026-10-12T09:00:00Z',
        needs: [
          {
            id: 'need-1',
            label: 'Accommodation',
            orderNumber: 1,
            outcomes: [
              {
                id: 'outcome-answer-1',
                label: 'reference-outcome-1',
                activities: [{ id: 'activity-1', who: 'Local group', details: 'Weekly sessions' }],
              },
            ],
          },
        ],
      })
      const selectableNeeds = [
        { id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'reference-outcome-1', text: 'Find housing' }] },
      ]
      referralService.getActionPlanNeedsAndOutcomes.mockResolvedValue({ needs: selectableNeeds, selectedNeeds: [] })

      await actionPlanController.showViewActivitiesPage(req, res)

      expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(referralService.getActionPlanNeedsAndOutcomes).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(req.session.actionPlanAction).toEqual({
        needId: 'need-1',
        outcomeId: 'reference-outcome-1',
        outcomeAnswerId: 'outcome-answer-1',
      })
      expect(req.session.actionPlan).toEqual({ needs: selectableNeeds })
      expect(req.session.actionPlanActivities).toEqual({
        caseReference: 'AB1234CD',
        activities: [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
      })
      expect(ActionPlanViewActivitiesPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Accommodation',
        'Find housing',
        [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
        undefined,
        'Alex',
      )
    })

    it('redirects to the action plan when the requested need or outcome is not found', async () => {
      req.query = { needId: 'missing-need', outcomeAnswerId: 'missing-outcome-answer' }
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        lastUpdatedAt: '2026-10-12T09:00:00Z',
        needs: [],
      })
      referralService.getActionPlanNeedsAndOutcomes.mockResolvedValue({ needs: [], selectedNeeds: [] })
      jest.clearAllMocks()

      await actionPlanController.showViewActivitiesPage(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
      expect(ActionPlanViewActivitiesPresenter).not.toHaveBeenCalled()
    })

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

      expect(ActionPlanViewActivitiesPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Accommodation',
        'Find housing',
        [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }],
        undefined,
        undefined,
      )
      expect(ActionPlanViewActivitiesPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('loads the first name and consumes the activity alert when displaying the page', async () => {
      req.session.actionPlan = {
        needs: [{ id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'outcome-1', text: 'Find housing' }] }],
      }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivityAlertType = 'ADD'
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        lastUpdatedAt: '',
        needs: [],
      })

      await actionPlanController.showViewActivitiesPage(req, res)

      expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(req.session.actionPlanActivityAlertType).toBeUndefined()
      expect(ActionPlanViewActivitiesPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        'Accommodation',
        'Find housing',
        [],
        'ADD',
        'Alex',
      )
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

      expect(ActionPlanViewActivitiesPresenter).toHaveBeenCalledWith(
        'ZZ9876YY',
        'Employment',
        'Find work',
        [],
        undefined,
        undefined,
      )

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

  describe('reorder needs', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: {
        firstName: 'Alex',
        lastName: 'River',
      },
      needs: [
        {
          id: 'need-1',
          label: 'Accomodation',
          orderNumber: 1,
          outcomes: [
            {
              id: 'outcome-1',
              label: 'Find housing',
              activities: [
                {
                  id: 'activity-1',
                  who: 'Service provider',
                  details: 'activity for need-1',
                },
              ],
            },
          ],
        },
        {
          id: 'need-2',
          label: 'Employment',
          orderNumber: 2,
          outcomes: [
            {
              id: 'outcome-2',
              label: 'Get a job',
              activities: [
                {
                  id: 'activity-2',
                  who: 'Alex',
                  details: 'activity for need-2',
                },
              ],
            },
          ],
        },
      ],
      lastUpdatedAt: '2026-15-10',
    }

    beforeEach(() => {
      referralService.getActionPlanSummary.mockResolvedValue(actionPlanSummary)
    })

    it('moves a need down when the action is DOWN', async () => {
      req.params = { id: 'AB1234CD', outcomeId: 'outcome-1', action: 'DOWN' }
      referralService.moveNeed.mockResolvedValue({})

      await actionPlanController.moveNeed(req, res)

      expect(referralService.moveNeed).toHaveBeenCalledWith(
        'AB1234CD',
        { stepQuestionAnswerHeaderId: 'outcome-1', action: 'DOWN' },
        'user1',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })

    it('moves a need up when the action is UP', async () => {
      req.params = { id: 'AB1234CD', outcomeId: 'outcome-2', action: 'UP' }
      referralService.moveNeed.mockResolvedValue({})

      await actionPlanController.moveNeed(req, res)

      expect(referralService.moveNeed).toHaveBeenCalledWith(
        'AB1234CD',
        { stepQuestionAnswerHeaderId: 'outcome-2', action: 'UP' },
        'user1',
      )
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
    })
  })

  describe('editing service delivery from check your answers', () => {
    it('stores changed session details in the session and preserves other draft answers', async () => {
      req.query = {}
      const details = actionPlanSessionDeliveryDetailsFactory.build()
      referralService.getSessionDeliveryDetails.mockResolvedValue(details)
      req.session.actionPlanSessionDelivery = {
        caseReference: 'AB1234CD',
        isServiceEndDateChanged: true,
        sessionDeliveryDetails: {
          answers: [{ questionId: 'existing-risk-answer', incomingAnswerDetails: [{ value: 'NO' }] }],
        },
      }
      req.body = {
        SESSION_FREQUENCY: 'Every fortnight',
        SESSION_DELIVERY_METHOD: 'VIDEO_CALL',
        VIDEO_CALL: 'Travel restrictions',
        SESSION_FORMAT: ['GROUP_SESSION'],
      }

      await actionPlanController.submitSessionDeliveryDetailsPage(req, res, true)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/service-delivery-check-your-answers')
      expect(req.session.actionPlanSessionDelivery?.isServiceEndDateChanged).toBe(true)
      expect(req.session.actionPlanSessionDelivery?.sessionDeliveryDetails?.answers).toEqual([
        { questionId: 'existing-risk-answer', incomingAnswerDetails: [{ value: 'NO' }] },
        { questionId: details.questions[0].id, incomingAnswerDetails: [{ value: 'Every fortnight' }] },
        {
          questionId: details.questions[1].id,
          incomingAnswerDetails: [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
        },
        {
          questionId: details.questions[2].id,
          incomingAnswerDetails: [{ value: 'GROUP_SESSION', additionalDetails: undefined }],
        },
      ])
      expect(referralService.getSessionDeliveryDetails).toHaveBeenCalledTimes(1)
      expect(referralService.getCheckYourAnswers).not.toHaveBeenCalled()
      expect(referralService.submitServiceDeliveryDetails).not.toHaveBeenCalled()
    })

    it('returns invalid session detail edits to the change page without clearing the draft', async () => {
      req.query = {}
      req.url = '/referral/AB1234CD/action-plan/change-session-delivery-details'
      referralService.getSessionDeliveryDetails.mockResolvedValue(actionPlanSessionDeliveryDetailsFactory.build())
      req.session.actionPlanSessionDelivery = { caseReference: 'AB1234CD', isServiceEndDateChanged: true }

      await actionPlanController.submitSessionDeliveryDetailsPage(req, res, true)

      expect(res.redirect).toHaveBeenCalledWith(req.url)
      expect(req.session.actionPlanSessionDelivery).toEqual({
        caseReference: 'AB1234CD',
        isServiceEndDateChanged: true,
      })
      expect(referralService.submitServiceDeliveryDetails).not.toHaveBeenCalled()
    })

    const pages = [
      {
        path: 'session-delivery-details',
        show: 'showSessionDeliveryDetailsPage',
        submit: 'submitSessionDeliveryDetailsPage',
        get: 'getSessionDeliveryDetails',
        presenter: ActionPlanSessionDeliveryDetailsPresenter,
        details: actionPlanSessionDeliveryDetailsFactory.build(),
        form: {
          SESSION_FREQUENCY: 'Every fortnight',
          SESSION_DELIVERY_METHOD: 'VIDEO_CALL',
          VIDEO_CALL: 'Travel restrictions',
          SESSION_FORMAT: ['GROUP_SESSION'],
        },
      },
      {
        path: 'risks-and-adjustments',
        show: 'showRisksAndAdjustmentsPage',
        submit: 'submitRisksAndAdjustmentsPage',
        get: 'getRisksAndAdjustments',
        presenter: ActionPlanRisksAndAdjustmentsPresenter,
        details: actionPlanRisksAndAdjustmentsFactory.build(),
        form: {
          RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'NO',
          REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'NO',
        },
      },
      {
        path: 'service-end-date-check',
        show: 'showServiceEndDateCheckPage',
        submit: 'submitServiceEndDateCheckPage',
        get: 'getServiceEndDateCheck',
        presenter: ActionPlanServiceEndDateCheckPresenter,
        details: actionPlanCheckServiceEndDateFactory.build(),
        form: { SERVICE_END_DATE_CHECK: 'YES' },
      },
      {
        path: 'update-service-end-date',
        show: 'showUpdateServiceEndDatePage',
        submit: 'submitUpdateServiceEndDatePage',
        get: 'getUpdateServiceEndDate',
        presenter: ActionPlanChangeServiceEndDatePresenter,
        details: actionPlanUpdateServiceEndDateFactory.build(),
        form: {
          'NEW_SERVICE_END_DATE-day': format(addDays(new Date(), 10), 'd'),
          'NEW_SERVICE_END_DATE-month': format(addDays(new Date(), 10), 'M'),
          'NEW_SERVICE_END_DATE-year': format(addDays(new Date(), 10), 'yyyy'),
          SERVICE_END_DATE_CHANGE_REASON: 'More time needed',
        },
      },
      {
        path: 'person-involvement',
        show: 'showUserInvolvementPage',
        submit: 'submitUserInvolvementPage',
        get: 'getPersonInvolvement',
        presenter: ActionPlanServiceUserInvolvementPresenter,
        details: actionPlanPersonInvolvementFactory.build(),
        form: { USER_INVOLVEMENT_IN_ACTION_PLAN: 'YES' },
      },
    ] as const

    beforeEach(() => {
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
        lastUpdatedAt: '',
      })
    })

    it.each(pages)('passes edit mode to the $path presenter', async page => {
      referralService[page.get].mockResolvedValue(page.details)

      await actionPlanController[page.show](req, res, true)

      expect(page.presenter).toHaveBeenCalledWith('AB1234CD', page.details, undefined, undefined, true)
    })

    it.each(pages)(
      'stores $path answers in the session and returns to check your answers without saving to the backend',
      async page => {
        referralService[page.get].mockResolvedValue(page.details)
        req.body = page.form

        await actionPlanController[page.submit](req, res, true)

        expect(req.session.actionPlanSessionDelivery).toEqual(
          expect.objectContaining({
            caseReference: 'AB1234CD',
            sessionDeliveryDetails: {
              answers: page.details.questions.map(question => expect.objectContaining({ questionId: question.id })),
            },
          }),
        )
        expect(referralService.submitServiceDeliveryDetails).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/service-delivery-check-your-answers')
      },
    )

    it.each(pages)('preserves edit mode when $path validation fails', async page => {
      referralService[page.get].mockResolvedValue(page.details)
      req.url = `/referral/AB1234CD/action-plan/change-${page.path}`
      req.body = {}

      await actionPlanController[page.submit](req, res, true)

      expect(res.redirect).toHaveBeenCalledWith(req.url)
      expect(req.session.actionPlanSessionDelivery).toBeUndefined()
      expect(req.flash).toHaveBeenCalledWith('value', '{}')
      expect(referralService.submitServiceDeliveryDetails).not.toHaveBeenCalled()
    })

    it('completes the new end date step before returning to check your answers', async () => {
      referralService.getServiceEndDateCheck.mockResolvedValue(actionPlanCheckServiceEndDateFactory.build())
      req.body = { SERVICE_END_DATE_CHECK: 'NO' }

      await actionPlanController.submitServiceEndDateCheckPage(req, res, true)

      expect(req.session.actionPlanSessionDelivery?.isServiceEndDateChanged).toBe(true)
      expect(referralService.submitServiceDeliveryDetails).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/change-update-service-end-date')
    })
  })

  it('renders the update service end date page with the presenter', async () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }

    referralService.getUpdateServiceEndDate.mockResolvedValue(sessionDeliveryDetails)

    await actionPlanController.showUpdateServiceEndDatePage(req, res)

    expect(referralService.getUpdateServiceEndDate).toHaveBeenCalledWith('AB1234CD', 'user1')
    expect(ActionPlanChangeServiceEndDatePresenter).toHaveBeenCalledWith(
      'AB1234CD',
      sessionDeliveryDetails,
      undefined,
      undefined,
      false,
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
        false,
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
        lastUpdatedAt: '',
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
      false,
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
      false,
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
      false,
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
      false,
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

    it('renders the service end date check page with backend questions', async () => {
      referralService.getServiceEndDateCheck.mockResolvedValue(serviceEndDateCheckDetails)

      await actionPlanController.showServiceEndDateCheckPage(req, res)

      expect(referralService.getServiceEndDateCheck).toHaveBeenCalledWith('AB1234CD', 'user1')
      expect(ActionPlanServiceEndDateCheckPresenter).toHaveBeenCalledWith(
        'AB1234CD',
        serviceEndDateCheckDetails,
        undefined,
        undefined,
        false,
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
        false,
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
        false,
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
        false,
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
        isServiceEndDateChanged: false,
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
        isServiceEndDateChanged: true,
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

  describe('user involvement', () => {
    const userInvolvementDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'Was the person involved in creating the action plan?',
          key: 'USER_INVOLVEMENT_IN_ACTION_PLAN',
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
              label: 'No',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Why were they not involved?',
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
      ],
    }

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {})
      referralService.getPersonInvolvement.mockResolvedValue(userInvolvementDetails)
      referralService.getActionPlanSummary.mockResolvedValue({
        personDetails: { firstName: 'Alex', lastName: 'River' },
        needs: [],
        lastUpdatedAt: '',
      })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    describe('showUserInvolvementPage', () => {
      it('renders the page with backend questions', async () => {
        await actionPlanController.showUserInvolvementPage(req, res)

        expect(referralService.getPersonInvolvement).toHaveBeenCalledWith('AB1234CD', 'user1')
        expect(ActionPlanServiceUserInvolvementPresenter).toHaveBeenCalledWith(
          'AB1234CD',
          userInvolvementDetails,
          undefined,
          undefined,
          false,
        )
        expect(ActionPlanServiceUserInvolvementPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
      })

      it('merges a saved session-delivery draft for the current referral into the questions', async () => {
        req.session = {
          actionPlanSessionDelivery: {
            caseReference: 'AB1234CD',
            sessionDeliveryDetails: {
              answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'YES' }] }],
            },
          },
        } as Request['session']

        await actionPlanController.showUserInvolvementPage(req, res)

        expect(ActionPlanServiceUserInvolvementPresenter).toHaveBeenCalledWith(
          'AB1234CD',
          {
            questions: [
              { ...userInvolvementDetails.questions[0], savedResponses: [{ value: 'YES', additionalDetails: null }] },
            ],
          },
          undefined,
          undefined,
          false,
        )
      })

      it('ignores a saved session-delivery draft from a different referral', async () => {
        req.session = {
          actionPlanSessionDelivery: {
            caseReference: 'ZZ9999ZZ',
            sessionDeliveryDetails: {
              answers: [{ questionId: 'question-1', incomingAnswerDetails: [{ value: 'YES' }] }],
            },
          },
        } as Request['session']

        await actionPlanController.showUserInvolvementPage(req, res)

        expect(ActionPlanServiceUserInvolvementPresenter).toHaveBeenCalledWith(
          'AB1234CD',
          userInvolvementDetails,
          undefined,
          undefined,
          false,
        )
      })

      it('passes flashed form values and validation errors through to the presenter', async () => {
        const validationErrors: ErrorMiddlewareErrors = {
          list: [],
          messages: { USER_INVOLVEMENT_IN_ACTION_PLAN: { text: 'Select an option' } },
        }
        const flashedValue = { USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO' }
        req.flash = jest.fn().mockReturnValue([JSON.stringify(flashedValue)])
        res.locals.errors = validationErrors

        await actionPlanController.showUserInvolvementPage(req, res)

        expect(ActionPlanServiceUserInvolvementPresenter).toHaveBeenCalledWith(
          'AB1234CD',
          userInvolvementDetails,
          validationErrors,
          flashedValue,
          false,
        )
      })
    })

    describe('submitUserInvolvementPage', () => {
      it('saves the answer to the session when the submitted form is valid', async () => {
        req.body = { USER_INVOLVEMENT_IN_ACTION_PLAN: 'YES' }

        await actionPlanController.submitUserInvolvementPage(req, res)

        expect(referralService.getPersonInvolvement).toHaveBeenCalledWith('AB1234CD', 'user1')
        expect(referralService.getActionPlanSummary).toHaveBeenCalledWith('AB1234CD', 'user1')
        expect(req.session.actionPlanSessionDelivery).toEqual({
          caseReference: 'AB1234CD',
          sessionDeliveryDetails: {
            answers: [
              { questionId: 'question-1', incomingAnswerDetails: [{ value: 'YES', additionalDetails: undefined }] },
            ],
          },
        })
        expect(res.redirect).toHaveBeenCalledTimes(1)
      })

      it('saves the why not involved details against the NO answer', async () => {
        req.body = { USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO', WHY_NOT_INVOLVED: 'They were unavailable' }

        await actionPlanController.submitUserInvolvementPage(req, res)

        expect(req.session.actionPlanSessionDelivery).toEqual({
          caseReference: 'AB1234CD',
          sessionDeliveryDetails: {
            answers: [
              {
                questionId: 'question-1',
                incomingAnswerDetails: [{ value: 'NO', additionalDetails: 'They were unavailable' }],
              },
            ],
          },
        })
      })

      it('flashes an error against WHY_NOT_INVOLVED when NO is selected without details', async () => {
        req.url = '/referral/AB1234CD/action-plan/person-involvement'
        req.body = { USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO' }

        await actionPlanController.submitUserInvolvementPage(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'WHY_NOT_INVOLVEDError',
          'Enter details about why Alex was not involved in creating the action plan',
        )
        expect(req.session.actionPlanSessionDelivery).toBeUndefined()
      })

      it('flashes a validation error naming the person and redirects back when nothing is selected', async () => {
        req.url = '/referral/AB1234CD/action-plan/person-involvement'
        req.body = {}

        await actionPlanController.submitUserInvolvementPage(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'USER_INVOLVEMENT_IN_ACTION_PLANError',
          'Select yes if Alex was involved in creating the action plan',
        )
        expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/person-involvement')
        expect(req.session.actionPlanSessionDelivery).toBeUndefined()
      })

      it('flashes a validation error when the selected value is not one of the choices', async () => {
        req.url = '/referral/AB1234CD/action-plan/person-involvement'
        req.body = { USER_INVOLVEMENT_IN_ACTION_PLAN: 'MAYBE' }

        await actionPlanController.submitUserInvolvementPage(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'USER_INVOLVEMENT_IN_ACTION_PLANError',
          'Select yes if Alex was involved in creating the action plan',
        )
        expect(req.session.actionPlanSessionDelivery).toBeUndefined()
      })
    })
  })

  describe('service delivery check your answers', () => {
    const question = (id: string, label: string): ActionPlanSessionDeliveryDetailsResponse['questions'][number] => ({
      id,
      displayOrder: 1,
      label,
      key: id,
      hint: null,
      answerType: 'TEXTAREA',
      maximumNumberOfResponses: 1,
      choices: null,
      savedResponses: [],
    })

    const checkYourAnswers: ActionPlanCheckYourAnswersDetails = {
      sessionDetails: { questions: [question('session-details', 'Session details')] },
      risksAndAdjustments: { questions: [question('risks', 'Risks and adjustments')] },
      serviceEndDate: { questions: [question('service-end-date', 'Service end date')] },
      personInvolvement: { questions: [question('person-involvement', 'Person involvement')] },
    }

    beforeEach(() => {
      referralService.getCheckYourAnswers.mockResolvedValue(checkYourAnswers)
    })

    describe('submission', () => {
      it('submits all displayed answers with draft edits taking precedence and clears the draft after saving', async () => {
        referralService.getCheckYourAnswers.mockResolvedValue({
          sessionDetails: {
            questions: [
              {
                ...question('session-details', 'Session details'),
                savedResponses: [{ value: 'Saved session answer', additionalDetails: null }],
              },
            ],
          },
          risksAndAdjustments: {
            questions: [
              {
                ...question('risks', 'Risks and adjustments'),
                savedResponses: [{ value: 'YES', additionalDetails: 'Saved risk details' }],
              },
            ],
          },
          serviceEndDate: {
            questions: [
              {
                ...question('service-end-date', 'Service end date'),
                savedResponses: [{ value: 'YES', additionalDetails: null }],
              },
            ],
          },
          personInvolvement: {
            questions: [
              {
                ...question('person-involvement', 'Person involvement'),
                savedResponses: [{ value: 'YES', additionalDetails: null }],
              },
            ],
          },
        })
        req.session.actionPlanSessionDelivery = {
          caseReference: 'AB1234CD',
          isServiceEndDateChanged: false,
          sessionDeliveryDetails: {
            answers: [
              {
                questionId: 'session-details',
                incomingAnswerDetails: [
                  { value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' },
                  { value: 'IN_PERSON' },
                ],
              },
              { questionId: 'old-service-end-date', incomingAnswerDetails: [{ value: '2026-12-01' }] },
            ],
          },
        }

        await actionPlanController.submitServiceDeliveryCheckYourAnswersPage(req, res)

        expect(referralService.getCheckYourAnswers).toHaveBeenCalledWith('AB1234CD', 'user1', false)
        expect(referralService.submitServiceDeliveryDetails).toHaveBeenCalledWith(
          'AB1234CD',
          {
            answers: [
              {
                questionId: 'session-details',
                incomingAnswerDetails: [
                  { value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' },
                  { value: 'IN_PERSON', additionalDetails: null },
                ],
              },
              {
                questionId: 'risks',
                incomingAnswerDetails: [{ value: 'YES', additionalDetails: 'Saved risk details' }],
              },
              {
                questionId: 'service-end-date',
                incomingAnswerDetails: [{ value: 'YES', additionalDetails: null }],
              },
              {
                questionId: 'person-involvement',
                incomingAnswerDetails: [{ value: 'YES', additionalDetails: null }],
              },
            ],
          },
          'user1',
        )
        expect(req.session.actionPlanSessionDelivery).toBeUndefined()
        expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan')
      })

      it('includes changed service-end-date answers when the draft requires a date change', async () => {
        const answers = [
          { questionId: 'service-end-date', incomingAnswerDetails: [{ value: 'NO' }] },
          { questionId: 'new-date', incomingAnswerDetails: [{ value: '2026-12-01' }] },
          { questionId: 'change-reason', incomingAnswerDetails: [{ value: 'More time needed' }] },
        ]
        referralService.getCheckYourAnswers.mockResolvedValue({
          ...checkYourAnswers,
          serviceEndDate: {
            questions: answers.map(answer => question(answer.questionId, answer.questionId)),
          },
        })
        req.session.actionPlanSessionDelivery = {
          caseReference: 'AB1234CD',
          isServiceEndDateChanged: true,
          sessionDeliveryDetails: { answers },
        }

        await actionPlanController.submitServiceDeliveryCheckYourAnswersPage(req, res)

        expect(referralService.getCheckYourAnswers).toHaveBeenCalledWith('AB1234CD', 'user1', true)
        expect(referralService.submitServiceDeliveryDetails).toHaveBeenCalledWith(
          'AB1234CD',
          expect.objectContaining({
            answers: expect.arrayContaining(
              answers.map((answer): ActionPlanSessionDeliveryDetailsRequest['answers'][number] => ({
                ...answer,
                incomingAnswerDetails: answer.incomingAnswerDetails.map(
                  (
                    detail,
                  ): ActionPlanSessionDeliveryDetailsRequest['answers'][number]['incomingAnswerDetails'][number] => ({
                    ...detail,
                    additionalDetails: null,
                  }),
                ),
              })),
            ),
          }),
          'user1',
        )
      })

      it.each([false, true])('ignores drafts for other referrals (draft present: %s)', async hasDraft => {
        if (hasDraft) {
          req.session.actionPlanSessionDelivery = {
            caseReference: 'ZZ9999ZZ',
            isServiceEndDateChanged: true,
            sessionDeliveryDetails: {
              answers: [{ questionId: 'risks', incomingAnswerDetails: [{ value: 'Other referral answer' }] }],
            },
          }
        }
        const draft = req.session.actionPlanSessionDelivery

        await actionPlanController.submitServiceDeliveryCheckYourAnswersPage(req, res)

        expect(referralService.getCheckYourAnswers).toHaveBeenCalledWith('AB1234CD', 'user1', false)
        expect(referralService.submitServiceDeliveryDetails).toHaveBeenCalledWith(
          'AB1234CD',
          {
            answers: Object.values(checkYourAnswers).flatMap(section =>
              section.questions.map((q): ActionPlanSessionDeliveryDetailsRequest['answers'][number] => ({
                questionId: q.id,
                incomingAnswerDetails: [],
              })),
            ),
          },
          'user1',
        )
        expect(req.session.actionPlanSessionDelivery).toEqual(draft)
      })

      it('preserves the draft and propagates API errors without redirecting', async () => {
        req.session.actionPlanSessionDelivery = {
          caseReference: 'AB1234CD',
          sessionDeliveryDetails: {
            answers: [{ questionId: 'risks', incomingAnswerDetails: [{ value: 'NO' }] }],
          },
        }
        const draft = req.session.actionPlanSessionDelivery
        referralService.submitServiceDeliveryDetails.mockRejectedValue(new Error('Unable to save answers'))

        await expect(actionPlanController.submitServiceDeliveryCheckYourAnswersPage(req, res)).rejects.toThrow(
          'Unable to save answers',
        )

        expect(req.session.actionPlanSessionDelivery).toEqual(draft)
        expect(res.redirect).not.toHaveBeenCalled()
      })
    })

    it('loads all answer sections and renders the page', async () => {
      await actionPlanController.showServiceDeliveryCheckYourAnswersPage(req, res)

      expect(referralService.getCheckYourAnswers).toHaveBeenCalledWith('AB1234CD', 'user1', false)
      expect(ServiceDeliveryCheckYourAnswersPresenter).toHaveBeenCalledWith(
        [
          checkYourAnswers.sessionDetails.questions,
          checkYourAnswers.risksAndAdjustments.questions,
          checkYourAnswers.serviceEndDate.questions,
          checkYourAnswers.personInvolvement.questions,
        ],
        'AB1234CD',
      )
      expect(ServiceDeliveryCheckYourAnswersPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('applies saved answers from this referral draft', async () => {
      req.session.actionPlanSessionDelivery = {
        caseReference: 'AB1234CD',
        sessionDeliveryDetails: {
          answers: [
            {
              questionId: 'risks',
              incomingAnswerDetails: [{ value: 'Risk answer', additionalDetails: 'More details' }],
            },
          ],
        },
      }

      await actionPlanController.showServiceDeliveryCheckYourAnswersPage(req, res)

      expect(ServiceDeliveryCheckYourAnswersPresenter).toHaveBeenCalledWith(
        [
          checkYourAnswers.sessionDetails.questions,
          [
            {
              ...checkYourAnswers.risksAndAdjustments.questions[0],
              savedResponses: [{ value: 'Risk answer', additionalDetails: 'More details' }],
            },
          ],
          checkYourAnswers.serviceEndDate.questions,
          checkYourAnswers.personInvolvement.questions,
        ],
        'AB1234CD',
      )
    })

    it('requests changed service-end-date questions when the saved answer requires a date change', async () => {
      req.session.actionPlanSessionDelivery = {
        caseReference: 'AB1234CD',
        isServiceEndDateChanged: true,
      }

      await actionPlanController.showServiceDeliveryCheckYourAnswersPage(req, res)

      expect(referralService.getCheckYourAnswers).toHaveBeenCalledWith('AB1234CD', 'user1', true)
    })

    it('ignores a saved answer draft belonging to a different referral', async () => {
      req.session.actionPlanSessionDelivery = {
        caseReference: 'ZZ9999ZZ',
        sessionDeliveryDetails: {
          answers: [{ questionId: 'risks', incomingAnswerDetails: [{ value: 'Other referral answer' }] }],
        },
      }

      await actionPlanController.showServiceDeliveryCheckYourAnswersPage(req, res)

      expect(ServiceDeliveryCheckYourAnswersPresenter).toHaveBeenCalledWith(
        [
          checkYourAnswers.sessionDetails.questions,
          checkYourAnswers.risksAndAdjustments.questions,
          checkYourAnswers.serviceEndDate.questions,
          checkYourAnswers.personInvolvement.questions,
        ],
        'AB1234CD',
      )
    })
  })
})

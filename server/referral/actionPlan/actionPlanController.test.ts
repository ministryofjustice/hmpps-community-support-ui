import { Request, Response } from 'express'
import type { ActionPlanSessionDeliveryDetailsResponse, ActionPlanSummaryDto } from '@community-support-api'
import type { ErrorMiddlewareErrors } from '../../@types/express'
import ReferralService from '../../services/referralService'
import ActionPlanController from './actionPlanController'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanViewActivitiesPresenter from './viewActivities/actionPlanViewActivitiesPresenter'
import ActionPlanSessionDeliveryDetailsPresenter from './sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter'

jest.mock('../../services/referralService')
jest.mock('./actionPlanPresenter')
jest.mock('./selectANeed/actionPlanSelectANeedPresenter')
jest.mock('./selectOutcome/actionPlanSelectOutcomePresenter')
jest.mock('./viewActivities/actionPlanViewActivitiesPresenter')
jest.mock('./sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter')

describe('ActionPlanController', () => {
  let referralService: jest.Mocked<ReferralService>
  let actionPlanController: ActionPlanController
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = {
      getActionPlanSummary: jest.fn(),
      getActionPlanNeedsAndOutcomes: jest.fn(),
      getSessionDeliveryDetails: jest.fn(),
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

    it('redirects to activities when an outcome is selected', async () => {
      req.session.actionPlanAction = { needId: 'need-2' }
      req.body = { selectOutcomeRadio: 'outcome-2' }

      await actionPlanController.submitOutcome(req, res)

      expect(req.session.actionPlanAction).toEqual({ needId: 'need-2', outcomeId: 'outcome-2' })
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/activities')
    })
  })

  describe('view activities', () => {
    it('renders the selected need, outcome, and session activities', async () => {
      req.session.actionPlan = {
        needs: [{ id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'outcome-1', text: 'Find housing' }] }],
      }
      req.session.actionPlanAction = { needId: 'need-1', outcomeId: 'outcome-1' }
      req.session.actionPlanActivities = [{ activityProvider: 'Local group', activityDescription: 'Weekly sessions' }]

      await actionPlanController.showViewActivitiesPage(req, res)

      expect(ActionPlanViewActivitiesPresenter).toHaveBeenCalledWith('AB1234CD', 'Accommodation', 'Find housing', [
        { activityProvider: 'Local group', activityDescription: 'Weekly sessions' },
      ])
      expect(ActionPlanViewActivitiesPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
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
    req.method = 'POST'
    req.body = {
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: 'ONE_TO_ONE_SESSION',
    }
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    res.redirect = jest.fn()

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

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
    req.method = 'POST'
    req.url = '/referral/AB1234CD/action-plan/session-delivery-details'
    req.body = {}
    referralService.getSessionDeliveryDetails.mockResolvedValue(sessionDeliveryDetails)
    res.redirect = jest.fn()

    await actionPlanController.showSessionDeliveryDetailsPage(req, res)

    expect(req.flash).toHaveBeenCalledWith('SESSION_DELIVERY_METHODError', 'Select how the sessions will take place')
    expect(req.flash).toHaveBeenCalledWith('SESSION_FORMATError', 'Select which format you will use for the sessions')
    expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/action-plan/session-delivery-details')
  })
})

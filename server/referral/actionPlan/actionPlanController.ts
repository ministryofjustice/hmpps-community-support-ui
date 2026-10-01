import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import logger from '../../../logger'
import formatFullName from '../../utils/presenterFormatters'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanViewActivitiesPresenter from './viewActivities/actionPlanViewActivitiesPresenter'
import ActionPlanAddActivityPresenter from './addActivity/actionPlanAddActivityPresenter'
import ActionPlanRemoveActivityPresenter from './removeActivity/actionPlanRemoveActivityPresenter'

class ActionPlanController {
  constructor(private readonly referralService: ReferralService) {}

  async showActionPlanPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const actionPlanSummary = await this.referralService.getActionPlanSummary(caseReference, username)
    const presenter = new ActionPlanPresenter(actionPlanSummary, caseReference)

    return presenter.renderPage(res)
  }

  async createActionPlan(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    res.redirect(`/referral/${caseReference}/action-plan/select-a-need`)
  }

  async showSelectANeedPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const { needs } = await this.referralService.getActionPlanNeedsAndOutcomes(username)

    req.session.actionPlan = { ...req.session.actionPlan, needs }

    const presenter = new ActionPlanSelectANeedPresenter(caseReference, needs, req.session.actionPlanAction?.needId)

    return presenter.renderPage(res)
  }

  async submitSelectedNeed(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { needId } = req.body as { needId?: string }

    const needs = req.session.actionPlan?.needs ?? []
    if (!needId) {
      req.session.formKeys = ['needId']
      req.flash('needIdError', 'Select which need you are creating an action for')
      return res.redirect(`/referral/${caseReference}/action-plan/select-a-need`)
    }

    const selectedNeed = needs.find(need => need.id === needId)

    if ((selectedNeed?.outcomes?.length ?? 0) > 1) {
      req.session.actionPlanAction = { needId }
      return res.redirect(`/referral/${caseReference}/action-plan/select-an-outcome`)
    }

    const outcomeId = selectedNeed?.outcomes?.[0]?.id
    if (!outcomeId) {
      logger.error(`No outcome found for need '${needId}' on case '${caseReference}'`)
      throw new Error(`No outcome found for need '${needId}'`)
    }

    req.session.actionPlanAction = { needId, outcomeId }

    return res.redirect(`/referral/${caseReference}/action-plan/activities`)
  }

  async showSelectOutcomePage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const { needId: selectedNeedId, outcomeId: selectedOutcomeId } = req.session.actionPlanAction ?? {}
    if (!selectedNeedId) {
      return res.redirect(`/referral/${caseReference}/action-plan/select-a-need`)
    }

    const outcomes = req.session.actionPlan?.needs?.find(need => need.id === selectedNeedId)?.outcomes ?? []

    const actionPlanSummary = await this.referralService.getActionPlanSummary(caseReference, username)
    const { firstName, lastName } = actionPlanSummary.personDetails
    const presenter = new ActionPlanSelectOutcomePresenter(
      caseReference,
      formatFullName(firstName, lastName),
      outcomes,
      selectedOutcomeId,
    )

    return presenter.renderPage(res)
  }

  async submitOutcome(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user
    const { selectOutcomeRadio } = req.body as { selectOutcomeRadio?: string }

    if (!selectOutcomeRadio) {
      const actionPlanSummary = await this.referralService.getActionPlanSummary(caseReference, username)
      const { firstName } = actionPlanSummary.personDetails

      req.session.formKeys = ['selectOutcomeRadio']
      req.flash('selectOutcomeRadioError', `Select which outcome is appropriate for ${firstName}`)
      return res.redirect(`/referral/${caseReference}/action-plan/select-an-outcome`)
    }

    req.session.actionPlanAction = { needId: req.session.actionPlanAction?.needId, outcomeId: selectOutcomeRadio }

    const activitiesPath = req.session.actionPlanActivities?.length
      ? `/referral/${caseReference}/action-plan/activities`
      : `/referral/${caseReference}/action-plan/activities/add`

    return res.redirect(activitiesPath)
  }

  async showViewActivitiesPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const { needId: selectedNeedId, outcomeId: selectedOutcomeId } = req.session.actionPlanAction ?? {}
    const selectedNeed = req.session.actionPlan?.needs?.find(need => need.id === selectedNeedId)
    const selectedOutcome = selectedNeed?.outcomes?.find(outcome => outcome.id === selectedOutcomeId)

    const presenter = new ActionPlanViewActivitiesPresenter(
      caseReference,
      selectedNeed?.label ?? '',
      selectedOutcome?.text ?? '',
      req.session.actionPlanActivities ?? [],
    )

    return presenter.renderPage(res)
  }

  async showAddActivityPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const { needId: selectedNeedId, outcomeId: selectedOutcomeId } = req.session.actionPlanAction ?? {}
    const selectedNeed = req.session.actionPlan?.needs?.find(need => need.id === selectedNeedId)
    const selectedOutcome = selectedNeed?.outcomes?.find(outcome => outcome.id === selectedOutcomeId)
    const activityIndex = Number(req.query?.activityIndex)
    const activity = Number.isInteger(activityIndex) ? req.session.actionPlanActivities?.[activityIndex] : undefined

    const presenter = new ActionPlanAddActivityPresenter(
      caseReference,
      selectedNeed?.label ?? '',
      selectedOutcome?.text ?? '',
      activity,
      activity ? activityIndex : undefined,
    )

    return presenter.renderPage(res)
  }

  async addActivity(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const {
      activityProvider,
      activityDescription,
      activityIndex: submittedActivityIndex,
    } = req.body as {
      activityProvider?: string
      activityDescription?: string
      activityIndex?: string
    }
    const actionPlanActivity = {
      activityProvider: activityProvider ?? '',
      activityDescription: activityDescription ?? '',
    }

    const activities = req.session.actionPlanActivities ?? []
    const activityIndex = Number(submittedActivityIndex)
    if (submittedActivityIndex !== undefined && Number.isInteger(activityIndex) && activities[activityIndex]) {
      activities[activityIndex] = actionPlanActivity
      req.session.actionPlanActivities = activities
    } else {
      req.session.actionPlanActivities = [...activities, actionPlanActivity]
    }

    return res.redirect(`/referral/${caseReference}/action-plan/activities`)
  }

  async removeActivity(req: Request, res: Response) {
    const { id: caseReference, activityIndex: activityIndexParam } = req.params as {
      id: string
      activityIndex: string
    }
    const activities = req.session.actionPlanActivities ?? []
    const activityIndex = Number(activityIndexParam)
    const activity = Number.isInteger(activityIndex) ? activities[activityIndex] : undefined

    if (!activity || activityIndex < 0 || activityIndex >= activities.length) {
      return res.redirect(`/referral/${caseReference}/action-plan/activities`)
    }

    const presenter = new ActionPlanRemoveActivityPresenter(caseReference, activityIndex, activity)
    return presenter.renderPage(res)
  }

  async confirmRemoveActivity(req: Request, res: Response) {
    const { id: caseReference, activityIndex: activityIndexParam } = req.params as {
      id: string
      activityIndex: string
    }
    const activities = req.session.actionPlanActivities ?? []
    const activityIndex = Number(activityIndexParam)

    if (Number.isInteger(activityIndex) && activityIndex >= 0 && activityIndex < activities.length) {
      activities.splice(activityIndex, 1)
      req.session.actionPlanActivities = activities
    }

    return res.redirect(`/referral/${caseReference}/action-plan/activities`)
  }

  async saveActivities(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { addAnotherActivity } = req.body as { addAnotherActivity?: string }

    if (addAnotherActivity === 'yes') {
      return res.redirect(`/referral/${caseReference}/action-plan/activities/add`)
    }

    if (addAnotherActivity !== 'no') {
      req.session.formKeys = ['addAnotherActivity']
      req.flash('addAnotherActivityError', 'Select yes if you want to add another activity')
      return res.redirect(`/referral/${caseReference}/action-plan/activities`)
    }

    // Post to backend

    return res.redirect(`/referral/${caseReference}/action-plan`)
  }
}

export default ActionPlanController

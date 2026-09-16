import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanAddActivitiesPresenter from './addActivities/actionPlanAddActivitiesPresenter'

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

    const presenter = new ActionPlanSelectANeedPresenter(caseReference, needs, req.session.actionPlan.selectedNeedId)

    return presenter.renderPage(res)
  }

  async submitSelectedNeed(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { needId } = req.body as { needId?: string }

    const needs = req.session.actionPlan?.needs ?? []
    const selectedNeed = needs.find(need => need.id === needId)

    req.session.actionPlan = { needs, selectedNeedId: needId }

    if ((selectedNeed?.outcomes?.length ?? 0) > 1) {
      return res.redirect(`/referral/${caseReference}/action-plan/select-an-outcome`)
    }

    return res.redirect(`/referral/${caseReference}/action-plan/add-activities`)
  }

  async showSelectOutcomePage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const actionPlanSummary = await this.referralService.getActionPlanSummary(caseReference, username)
    const presenter = new ActionPlanSelectOutcomePresenter(caseReference, actionPlanSummary?.personDetails?.fullName)

    return presenter.renderPage(res)
  }

  async submitOutcome(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    res.redirect(`/referral/${caseReference}/action-plan/add-activities`)
  }

  async showAddActivitiesPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const presenter = new ActionPlanAddActivitiesPresenter(caseReference)

    return presenter.renderPage(res)
  }

  async addActivity(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    // Add activity to session for rendering

    res.redirect(`/referral/${caseReference}/action-plan/add-activities`)
  }

  async saveActivities(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    // Post to backend

    res.redirect(`/referral/${caseReference}/action-plan`)
  }
}

export default ActionPlanController

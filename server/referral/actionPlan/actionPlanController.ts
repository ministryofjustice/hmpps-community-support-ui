import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanNeedsPresenter from './needs/actionPlanNeedsPresenter'
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

    res.redirect(`/referral/${caseReference}/action-plan/needs`)
  }

  async showNeedsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const presenter = new ActionPlanNeedsPresenter(caseReference)

    return presenter.renderPage(res)
  }

  async submitNeeds(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    res.redirect(`/referral/${caseReference}/action-plan/select-an-outcome`)
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

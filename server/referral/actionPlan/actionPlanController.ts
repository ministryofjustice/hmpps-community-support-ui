import { Request, Response } from 'express'
import type { ActionPlanSessionDeliveryData } from '../../@types/express'
import ReferralService from '../../services/referralService'
import logger from '../../../logger'
import formatFullName from '../../utils/presenterFormatters'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanAddActivitiesPresenter from './addActivities/actionPlanAddActivitiesPresenter'
import ActionPlanSessionDeliveryDetailsPresenter from './sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter'
import applySessionDeliveryDetailsData from './sessionDeliveryDetails/applySessionDeliveryDetailsData'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import {
  ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder
} from '../../validation/ActionPlanSessionDeliveryDetailsFormData'

class ActionPlanController {
  constructor(private readonly referralService: ReferralService) {}

  private getActionPlanSessionDelivery(req: Request, caseReference: string) {
    return req.session.actionPlanSessionDelivery?.caseReference === caseReference
      ? req.session.actionPlanSessionDelivery
      : undefined
  }

  private setActionPlanSessionDelivery(
    req: Request,
    caseReference: string,
    sessionDelivery: Partial<ActionPlanSessionDeliveryData>,
  ) {
    req.session.actionPlanSessionDelivery = {
      ...(this.getActionPlanSessionDelivery(req, caseReference) ?? { caseReference }),
      ...sessionDelivery,
    }
  }

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

    return res.redirect(`/referral/${caseReference}/action-plan/add-activities`)
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

    return res.redirect(`/referral/${caseReference}/action-plan/add-activities`)
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

  async showSessionDeliveryDetailsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getSessionDeliveryDetails(caseReference, username)
    const sessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
    const flashData = req.flash('value')
    const flashedInputData = flashData.length > 0 ? JSON.parse(flashData[0]) : undefined
    let userInputData = flashedInputData // check for session data here when ready

    if (req.method === 'POST') {
      const schema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder()
      return validateRequestBodyAgainstSchema(schema, req, res, async form => {
        //Format this into the request object for the API when we know what it looks like and pass it to the session
        //req.session.sessionDetails = form
        return res.redirect(`/referral/${caseReference}/action-plan`)
      })
    }


    const validationErrors = res.locals.errors
    const presenter = new ActionPlanSessionDeliveryDetailsPresenter(
      caseReference,
      applySessionDeliveryDetailsData(sessionDeliveryDetails, sessionDelivery),
      validationErrors,
      userInputData
    )

    return presenter.renderPage(res)
  }
}

export default ActionPlanController

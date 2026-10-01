import { Request, Response } from 'express'
import type { ActionPlanSessionDeliveryDetailsRequest } from '@community-support-api'
import type { ActionPlanSessionDeliveryData } from '../../@types/express'
import ReferralService from '../../services/referralService'
import logger from '../../../logger'
import formatFullName from '../../utils/presenterFormatters'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanViewActivitiesPresenter from './viewActivities/actionPlanViewActivitiesPresenter'
import ActionPlanAddActivitiesPresenter from './addActivities/actionPlanAddActivitiesPresenter'
import ActionPlanSessionDeliveryDetailsPresenter from './sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter'
import buildSessionDeliveryDetailsRequestFromForm, {
  buildAdditionalDetailsFieldNameResolver,
} from './sessionDeliveryDetails/buildSessionDeliveryDetailsRequestFromForm'
import applySessionDeliveryDetailsData from './sessionDeliveryDetails/applySessionDeliveryDetailsData'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import { ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder } from '../../validation/ActionPlanSessionDeliveryDetailsFormData'
import ActionPlanRisksAndAdjustmentsPresenter from './sessionDeliveryDetails/actionPlanRisksAndAdjustmentsPresenter'
import { ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder } from '../../validation/ActionPlanRisksAndAdjustmentsFormData'

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

  // Merges answers for the questions just submitted into any already-saved session-delivery
  // answers, so that submitting one page (e.g. risks-and-adjustments) doesn't discard the
  // answers saved by another page (e.g. session-delivery-details) that share the same session key.
  private mergeSessionDeliveryDetailsAnswers(
    existing: ActionPlanSessionDeliveryDetailsRequest | undefined,
    incoming: ActionPlanSessionDeliveryDetailsRequest,
  ): ActionPlanSessionDeliveryDetailsRequest {
    const incomingQuestionIds = new Set(incoming.answers.map(answer => answer.questionId))
    const retainedAnswers = (existing?.answers ?? []).filter(answer => !incomingQuestionIds.has(answer.questionId))

    return { answers: [...retainedAnswers, ...incoming.answers] }
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

    return res.redirect(`/referral/${caseReference}/action-plan/activities`)
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

  async showSessionDeliveryDetailsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getSessionDeliveryDetails(caseReference, username)
    const flashData = req.flash('value')
    const userInputData = flashData.length > 0 ? JSON.parse(flashData[0]) : undefined

    if (req.method === 'POST') {
      const schema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder(sessionDeliveryDetails)
      return validateRequestBodyAgainstSchema(schema, req, res, async form => {
        const request = buildSessionDeliveryDetailsRequestFromForm(sessionDeliveryDetails, form)
        const existingSessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
        const mergedSessionDelivery = this.mergeSessionDeliveryDetailsAnswers(existingSessionDelivery, request)
        this.setActionPlanSessionDelivery(req, caseReference, { sessionDeliveryDetails: mergedSessionDelivery })
        return res.redirect(`/referral/${caseReference}/action-plan/risks-and-adjustments`)
      })
    }

    const sessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
    const validationErrors = res.locals.errors
    const presenter = new ActionPlanSessionDeliveryDetailsPresenter(
      caseReference,
      applySessionDeliveryDetailsData(sessionDeliveryDetails, sessionDelivery),
      validationErrors,
      userInputData,
    )

    return presenter.renderPage(res)
  }

  async showRisksAndAdjustmentsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getRisksAndAdjustments(caseReference, username)
    const flashData = req.flash('value')
    const userInputData = flashData.length > 0 ? JSON.parse(flashData[0]) : undefined

    if (req.method === 'POST') {
      const actionPlanSummary = await this.referralService.getActionPlanSummary(caseReference, username)
      const { firstName } = actionPlanSummary.personDetails
      const schema = ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder(sessionDeliveryDetails, firstName)
      return validateRequestBodyAgainstSchema(schema, req, res, async form => {
        const request = buildSessionDeliveryDetailsRequestFromForm(
          sessionDeliveryDetails,
          form,
          buildAdditionalDetailsFieldNameResolver({
            RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'RISK_INFO',
            REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'ADJUSTMENT_INFO',
          }),
        )
        const existingSessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
        const mergedSessionDelivery = this.mergeSessionDeliveryDetailsAnswers(existingSessionDelivery, request)
        this.setActionPlanSessionDelivery(req, caseReference, { sessionDeliveryDetails: mergedSessionDelivery })
        return res.redirect(`/referral/${caseReference}/action-plan`)
      })
    }

    const sessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
    const validationErrors = res.locals.errors
    const presenter = new ActionPlanRisksAndAdjustmentsPresenter(
      caseReference,
      applySessionDeliveryDetailsData(sessionDeliveryDetails, sessionDelivery),
      validationErrors,
      userInputData,
    )

    return presenter.renderPage(res)
  }
}

export default ActionPlanController

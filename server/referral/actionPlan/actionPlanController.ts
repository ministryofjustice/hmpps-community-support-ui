import { Request, Response } from 'express'
import type { ActionPlanActionRequest, ActionPlanSessionDeliveryDetailsRequest } from '@community-support-api'
import type { ActionPlanActivitiesData, ActionPlanActivity, ActionPlanSessionDeliveryData } from '../../@types/express'
import ReferralService from '../../services/referralService'
import logger from '../../../logger'
import formatFullName from '../../utils/presenterFormatters'
import ActionPlanPresenter from './actionPlanPresenter'
import ActionPlanSelectANeedPresenter from './selectANeed/actionPlanSelectANeedPresenter'
import ActionPlanSelectOutcomePresenter from './selectOutcome/actionPlanSelectOutcomePresenter'
import ActionPlanViewActivitiesPresenter from './viewActivities/actionPlanViewActivitiesPresenter'
import ActionPlanAddActivityPresenter from './addActivity/actionPlanAddActivityPresenter'
import ActionPlanRemoveActivityPresenter from './removeActivity/actionPlanRemoveActivityPresenter'
import ActionPlanSessionDeliveryDetailsPresenter from './sessionDeliveryDetails/actionPlanSessionDeliveryDetailsPresenter'
import buildSessionDeliveryDetailsRequestFromForm, {
  buildAdditionalDetailsFieldNameResolver,
} from './sessionDeliveryDetails/buildSessionDeliveryDetailsRequestFromForm'
import applySessionDeliveryDetailsData from './sessionDeliveryDetails/applySessionDeliveryDetailsData'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import { ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder } from '../../validation/ActionPlanSessionDeliveryDetailsFormData'
import ActionPlanRisksAndAdjustmentsPresenter from './sessionDeliveryDetails/actionPlanRisksAndAdjustmentsPresenter'
import { ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder } from '../../validation/ActionPlanRisksAndAdjustmentsFormData'
import { ActionPlanActivityFormDataSchema } from '../../validation/ActionPlanActivityFormData'
import { ActionPlanRemoveActivityFormDataSchema } from '../../validation/ActionPlanRemoveActivityFormData'

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

  private getActionPlanActivities(req: Request, caseReference: string): ActionPlanActivity[] {
    return req.session.actionPlanActivities?.caseReference === caseReference
      ? req.session.actionPlanActivities.activities
      : []
  }

  private setActionPlanActivities(req: Request, caseReference: string, activities: ActionPlanActivity[]) {
    req.session.actionPlanActivities = {
      caseReference,
      activities,
    } satisfies ActionPlanActivitiesData
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

    const activitiesPath = this.getActionPlanActivities(req, caseReference).length
      ? `/referral/${caseReference}/action-plan/activities`
      : `/referral/${caseReference}/action-plan/activities/add`

    return res.redirect(activitiesPath)
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

    const activitiesPath = this.getActionPlanActivities(req, caseReference).length
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
      this.getActionPlanActivities(req, caseReference),
    )
    return presenter.renderPage(res)
  }

  async showAddActivityPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const { needId: selectedNeedId, outcomeId: selectedOutcomeId } = req.session.actionPlanAction ?? {}
    const selectedNeed = req.session.actionPlan?.needs?.find(need => need.id === selectedNeedId)
    const selectedOutcome = selectedNeed?.outcomes?.find(outcome => outcome.id === selectedOutcomeId)
    const activityIndex = Number(req.query?.activityIndex)
    const activities = this.getActionPlanActivities(req, caseReference)
    const activity = Number.isInteger(activityIndex) ? activities[activityIndex] : undefined
    const flashData = req.flash('value')
    const userInputData = flashData.length > 0 ? (JSON.parse(flashData[0]) as Record<string, string>) : undefined

    const presenter = new ActionPlanAddActivityPresenter(
      caseReference,
      selectedNeed?.label ?? '',
      selectedOutcome?.text ?? '',
      activity,
      activity ? activityIndex : undefined,
      userInputData,
    )

    return presenter.renderPage(res)
  }

  async addActivity(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    return validateRequestBodyAgainstSchema(ActionPlanActivityFormDataSchema, req, res, async form => {
      const { activityIndex: submittedActivityIndex, ...actionPlanActivity } = form
      const activities = this.getActionPlanActivities(req, caseReference)
      const activityIndex = Number(submittedActivityIndex)
      if (submittedActivityIndex !== undefined && Number.isInteger(activityIndex) && activities[activityIndex]) {
        activities[activityIndex] = actionPlanActivity
        this.setActionPlanActivities(req, caseReference, activities)
      } else {
        this.setActionPlanActivities(req, caseReference, [...activities, actionPlanActivity])
      }

      return res.redirect(`/referral/${caseReference}/action-plan/activities`)
    })
  }

  private getRemoveActivityIndex(req: Request, activities: ActionPlanActivity[]): number | undefined {
    const { activityIndex } = (req.query ?? {}) as { activityIndex?: string }
    if (typeof activityIndex !== 'string' || !/^\d+$/.test(activityIndex)) return undefined

    const index = Number(activityIndex)
    return index < activities.length ? index : undefined
  }

  async showRemoveActivityPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const activities = this.getActionPlanActivities(req, caseReference)
    const activityIndex = this.getRemoveActivityIndex(req, activities)

    if (activityIndex === undefined) {
      return res.redirect(`/referral/${caseReference}/action-plan/activities`)
    }

    const presenter = new ActionPlanRemoveActivityPresenter(caseReference, activityIndex, activities.length === 1)
    return presenter.renderPage(res)
  }

  async removeActivity(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const activitiesPath = `/referral/${caseReference}/action-plan/activities`
    const activities = this.getActionPlanActivities(req, caseReference)
    const activityIndex = this.getRemoveActivityIndex(req, activities)

    if (activityIndex === undefined) {
      return res.redirect(activitiesPath)
    }

    return validateRequestBodyAgainstSchema(ActionPlanRemoveActivityFormDataSchema, req, res, async form => {
      if (form.removeActivity === 'no') {
        return res.redirect(activitiesPath)
      }

      if (activities.length === 1) {
        delete req.session.actionPlanActivities
        delete req.session.actionPlanAction
        if (req.session.actionPlanSessionDelivery?.caseReference === caseReference) {
          delete req.session.actionPlanSessionDelivery
        }
        return res.redirect(`/referral/${caseReference}/action-plan/select-a-need`)
      }

      this.setActionPlanActivities(
        req,
        caseReference,
        activities.filter((_, index) => index !== activityIndex),
      )
      return res.redirect(activitiesPath)
    })
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

    const { username } = res.locals.user
    const { needId, outcomeId } = req.session.actionPlanAction ?? {}
    if (!needId || !outcomeId) {
      return res.redirect(`/referral/${caseReference}/action-plan/select-a-need`)
    }

    const actionPlanAction: ActionPlanActionRequest = {
      needId,
      outcomeId,
      activities: this.getActionPlanActivities(req, caseReference).map(activity => ({
        who: activity.activityProvider,
        activityDetails: activity.activityDescription,
        status: 'Active',
      })),
    }
    const result = await this.referralService.submitAction(caseReference, actionPlanAction, username)
    if (!result.success) {
      throw new Error(result.message || 'Unable to save action plan activities')
    }

    delete req.session.actionPlanAction
    delete req.session.actionPlanActivities

    return res.redirect(`/referral/${caseReference}/action-plan`)
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

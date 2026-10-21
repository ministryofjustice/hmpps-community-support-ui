import { Request, Response } from 'express'
import type {
  ActionPlanActionRequest,
  ActionPlanNeedsOrderRequest,
  ActionPlanSessionDeliveryDetailsRequest,
} from '@community-support-api'
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
import ActionPlanServiceEndDateCheckPresenter from './sessionDeliveryDetails/actionPlanServiceEndDateCheckPresenter'
import ActionPlanChangeServiceEndDatePresenter from './sessionDeliveryDetails/actionPlanChangeServiceEndDatePresenter'
import {
  ActionPlanServiceEndDateCheckFormDataSchemaBuilder,
  getServiceEndDateValue,
} from '../../validation/ActionPlanServiceEndDateCheckFormData'
import { ActionPlanChangeServiceEndDateDataSchemaBuilder } from '../../validation/ActionPlanChangeServiceEndDateFormData'
import ActionPlanRemoveOutcomePresenter from './removeOutcome/actionPlanRemoveOutcomePresenter'
import ActionPlanServiceUserInvolvementPresenter from './sessionDeliveryDetails/actionPlanServiceUserInvolvementPresenter'
import { ActionPlanUserInvolvementFormDataSchemaBuilder } from '../../validation/ActionPlanUserInvolvementFormData'
import ServiceDeliveryPresenter from './serviceDelivery/serviceDeliveryPresenter'

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

  private getActionPlanActivities(req: Request, caseReference: string): [ActionPlanActivity[], ActionPlanActivity[]] {
    return req.session.actionPlanActivities?.caseReference === caseReference
      ? [req.session.actionPlanActivities.activities, req.session.preChangeActivities?.activities || []]
      : [[], []]
  }

  private setActionPlanActivities(req: Request, caseReference: string, activities: ActionPlanActivity[]) {
    req.session.actionPlanActivities = {
      caseReference,
      activities,
    } satisfies ActionPlanActivitiesData
  }

  private actionPlanActivitiesHasChanges(
    preChangeActivities: ActionPlanActivity[],
    activities: ActionPlanActivity[],
  ): boolean {
    if (!preChangeActivities) return true
    if (preChangeActivities.length !== activities.length) return true
    return activities.some(
      (activity, index) =>
        preChangeActivities[index].activityProvider !== activity.activityProvider ||
        preChangeActivities[index].activityDescription !== activity.activityDescription,
    )
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

  private getFlashedFormValues(req: Request) {
    const flashData = req.flash('value')
    return flashData.length > 0 ? JSON.parse(flashData[0]) : undefined
  }

  private saveSessionDeliveryDetails(
    req: Request,
    caseReference: string,
    request: ActionPlanSessionDeliveryDetailsRequest,
  ) {
    const existingSessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
    const mergedSessionDelivery = this.mergeSessionDeliveryDetailsAnswers(existingSessionDelivery, request)
    this.setActionPlanSessionDelivery(req, caseReference, { sessionDeliveryDetails: mergedSessionDelivery })
  }

  async showActionPlanPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user
    const bannerType = req.session.actionPlanAlertType

    delete req.session.actionPlanAlertType

    const [actionPlanSummary, referralProgress] = await Promise.all([
      this.referralService.getActionPlanSummary(caseReference, username),
      this.referralService.getReferralProgress(caseReference, username),
    ])
    const icsFeedbackSubmitted = referralProgress.appointments.some(
      appointment => appointment.type === 'ICS' && Boolean(appointment.icsFeedbackId),
    )
    const presenter = new ActionPlanPresenter(actionPlanSummary, caseReference, icsFeedbackSubmitted, bannerType)

    return presenter.renderPage(res)
  }

  async showServiceDeliveryPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const presenter = new ServiceDeliveryPresenter(caseReference)

    return presenter.renderPage(res)
  }

  private async resolveActionPlanOutcome(
    caseReference: string,
    needId: string,
    outcomeAnswerId: string,
    username: string,
  ) {
    const [actionPlanSummary, needsAndOutcomes] = await Promise.all([
      this.referralService.getActionPlanSummary(caseReference, username),
      this.referralService.getActionPlanNeedsAndOutcomes(caseReference, username),
    ])
    const selectedNeed = actionPlanSummary.needs.find(need => need.id === needId)
    const selectedOutcome = selectedNeed?.outcomes.find(outcome => outcome.id === outcomeAnswerId)
    const selectableNeed = needsAndOutcomes.needs.find(need => need.id === needId)
    const selectableOutcome = selectableNeed?.outcomes.find(
      outcome => outcome.id === selectedOutcome?.label || outcome.text === selectedOutcome?.label,
    )

    if (!selectedNeed || !selectedOutcome || !selectableNeed || !selectableOutcome) return undefined

    return { actionPlanSummary, selectedNeed, selectedOutcome, selectableOutcome }
  }

  async showRemoveOutcomePage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { needId, outcomeAnswerId } = req.query ?? {}
    const { username } = res.locals.user

    if (typeof needId !== 'string' || typeof outcomeAnswerId !== 'string') {
      return res.redirect(`/referral/${caseReference}/action-plan`)
    }

    const resolved = await this.resolveActionPlanOutcome(caseReference, needId, outcomeAnswerId, username)
    if (!resolved) return res.redirect(`/referral/${caseReference}/action-plan`)

    const presenter = new ActionPlanRemoveOutcomePresenter(
      caseReference,
      resolved.actionPlanSummary.personDetails.firstName,
      resolved.selectedNeed,
      outcomeAnswerId,
    )

    return presenter.renderPage(res)
  }

  async removeOutcome(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user
    const { needId, outcomeAnswerId } = req.body as { needId?: string; outcomeAnswerId?: string }

    if (!needId || !outcomeAnswerId) return res.redirect(`/referral/${caseReference}/action-plan`)

    const resolved = await this.resolveActionPlanOutcome(caseReference, needId, outcomeAnswerId, username)
    if (!resolved) return res.redirect(`/referral/${caseReference}/action-plan`)

    const result = await this.referralService.deleteAction(caseReference, outcomeAnswerId, username)
    if (!result.success) {
      throw new Error(result.message || 'Unable to remove action plan outcome')
    }

    const removesSelectedAction =
      req.session.actionPlanActivities?.caseReference === caseReference &&
      req.session.actionPlanAction?.needId === needId &&
      req.session.actionPlanAction?.outcomeId === resolved.selectableOutcome.id
    if (removesSelectedAction) {
      delete req.session.actionPlanAction
      if (req.session.actionPlanActivities?.caseReference === caseReference) {
        delete req.session.actionPlanActivities
      }
    }
    req.session.actionPlanAlertType = 'REMOVE'

    return res.redirect(`/referral/${caseReference}/action-plan`)
  }

  async createActionPlan(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    res.redirect(`/referral/${caseReference}/action-plan/select-a-need`)
  }

  async showSelectANeedPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const [{ needs, selectedNeeds }, actionPlanSummary] = await Promise.all([
      this.referralService.getActionPlanNeedsAndOutcomes(caseReference, username),
      this.referralService.getActionPlanSummary(caseReference, username),
    ])
    const needsWithSavedOutcomes = new Set(
      actionPlanSummary.needs.filter(need => need.outcomes.length > 0).map(need => need.id),
    )
    const availableNeeds = needs.filter(need => !needsWithSavedOutcomes.has(need.id))

    req.session.actionPlan = { ...req.session.actionPlan, needs: availableNeeds }

    const presenter = new ActionPlanSelectANeedPresenter(
      caseReference,
      availableNeeds,
      selectedNeeds,
      req.session.actionPlanAction?.needId,
    )

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

    const activitiesPath = this.getActionPlanActivities(req, caseReference)[0].length
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

    const activitiesPath = this.getActionPlanActivities(req, caseReference)[0].length
      ? `/referral/${caseReference}/action-plan/activities`
      : `/referral/${caseReference}/action-plan/activities/add`

    return res.redirect(activitiesPath)
  }

  async showViewActivitiesPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { needId, outcomeAnswerId } = req.query ?? {}

    if (needId !== undefined || outcomeAnswerId !== undefined) {
      if (typeof needId !== 'string' || typeof outcomeAnswerId !== 'string') {
        return res.redirect(`/referral/${caseReference}/action-plan`)
      }

      const { username } = res.locals.user
      const [actionPlanSummary, needsAndOutcomes] = await Promise.all([
        this.referralService.getActionPlanSummary(caseReference, username),
        this.referralService.getActionPlanNeedsAndOutcomes(caseReference, username),
      ])
      const selectedNeed = actionPlanSummary.needs.find(need => need.id === needId)
      const selectedOutcome = selectedNeed?.outcomes.find(outcome => outcome.id === outcomeAnswerId)
      const selectableNeed = needsAndOutcomes.needs.find(need => need.id === needId)
      const selectableOutcome = selectableNeed?.outcomes.find(
        outcome => outcome.id === selectedOutcome?.label || outcome.text === selectedOutcome?.label,
      )

      if (!selectedNeed || !selectedOutcome || !selectableNeed || !selectableOutcome) {
        return res.redirect(`/referral/${caseReference}/action-plan`)
      }

      req.session.actionPlan = {
        needs: needsAndOutcomes.needs,
      }
      req.session.actionPlanAction = { needId, outcomeId: selectableOutcome.id }
      const activities = selectedOutcome.activities.map(activity => ({
        activityProvider: activity.who,
        activityDescription: activity.details,
      }))
      this.setActionPlanActivities(req, caseReference, activities)
      req.session.preChangeActivities = {
        caseReference,
        activities,
      } satisfies ActionPlanActivitiesData
    }

    const { needId: selectedNeedId, outcomeId: selectedOutcomeId } = req.session.actionPlanAction ?? {}
    const selectedNeed = req.session.actionPlan?.needs?.find(need => need.id === selectedNeedId)
    const selectedOutcome = selectedNeed?.outcomes?.find(outcome => outcome.id === selectedOutcomeId)

    const presenter = new ActionPlanViewActivitiesPresenter(
      caseReference,
      selectedNeed?.label ?? '',
      selectedOutcome?.text ?? '',
      this.getActionPlanActivities(req, caseReference)[0],
    )
    return presenter.renderPage(res)
  }

  async showAddActivityPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const { needId: selectedNeedId, outcomeId: selectedOutcomeId } = req.session.actionPlanAction ?? {}
    const selectedNeed = req.session.actionPlan?.needs?.find(need => need.id === selectedNeedId)
    const selectedOutcome = selectedNeed?.outcomes?.find(outcome => outcome.id === selectedOutcomeId)
    const activityIndex = Number(req.query?.activityIndex)
    const activities = this.getActionPlanActivities(req, caseReference)[0]
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
      const activities = this.getActionPlanActivities(req, caseReference)[0]
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
    const activities = this.getActionPlanActivities(req, caseReference)[0]
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
    const activities = this.getActionPlanActivities(req, caseReference)[0]
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

    const [activities, preChangeActivities] = this.getActionPlanActivities(req, caseReference)

    if (this.actionPlanActivitiesHasChanges(preChangeActivities, activities)) {
      const actionPlanAction: ActionPlanActionRequest = {
        needId,
        outcomeId,
        activities: activities.map(activity => ({
          who: activity.activityProvider,
          activityDetails: activity.activityDescription,
          status: 'Active',
        })),
      }
      const result = await this.referralService.submitAction(caseReference, actionPlanAction, username)
      if (!result.success) {
        throw new Error(result.message || 'Unable to save action plan activities')
      }
      req.session.actionPlanAlertType = 'ADD'
    }

    delete req.session.actionPlanAction
    delete req.session.actionPlanActivities
    delete req.session.preChangeActivities

    return res.redirect(`/referral/${caseReference}/action-plan`)
  }

  async showSessionDeliveryDetailsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getSessionDeliveryDetails(caseReference, username)
    const userInputData = this.getFlashedFormValues(req)
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

  async submitSessionDeliveryDetailsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getSessionDeliveryDetails(caseReference, username)
    const schema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder(sessionDeliveryDetails)

    return validateRequestBodyAgainstSchema(schema, req, res, async form => {
      const request = buildSessionDeliveryDetailsRequestFromForm(sessionDeliveryDetails, form)
      this.saveSessionDeliveryDetails(req, caseReference, request)
      return res.redirect(`/referral/${caseReference}/action-plan/risks-and-adjustments`)
    })
  }

  async showRisksAndAdjustmentsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getRisksAndAdjustments(caseReference, username)
    const userInputData = this.getFlashedFormValues(req)

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

  async submitRisksAndAdjustmentsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getRisksAndAdjustments(caseReference, username)
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
      this.saveSessionDeliveryDetails(req, caseReference, request)
      return res.redirect(`/referral/${caseReference}/action-plan/service-end-date-check`)
    })
  }

  async showServiceEndDateCheckPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getServiceEndDateCheck(caseReference, username)
    const userInputData = this.getFlashedFormValues(req)
    const sessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
    const validationErrors = res.locals.errors
    const presenter = new ActionPlanServiceEndDateCheckPresenter(
      caseReference,
      applySessionDeliveryDetailsData(sessionDeliveryDetails, sessionDelivery),
      validationErrors,
      userInputData,
    )
    return presenter.renderPage(res)
  }

  async submitServiceEndDateCheckPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getServiceEndDateCheck(caseReference, username)
    const serviceEndDate = getServiceEndDateValue(sessionDeliveryDetails)
    const schema = ActionPlanServiceEndDateCheckFormDataSchemaBuilder(sessionDeliveryDetails, serviceEndDate)

    return validateRequestBodyAgainstSchema(schema, req, res, async form => {
      const request = buildSessionDeliveryDetailsRequestFromForm(sessionDeliveryDetails, form)
      this.saveSessionDeliveryDetails(req, caseReference, request)

      if (form.SERVICE_END_DATE_CHECK === 'YES') {
        return res.redirect(`/referral/${caseReference}/action-plan/person-involvement`)
      }

      return res.redirect(`/referral/${caseReference}/action-plan/update-service-end-date`)
    })
  }

  async showUpdateServiceEndDatePage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getUpdateServiceEndDate(caseReference, username)
    const userInputData = this.getFlashedFormValues(req)
    const sessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
    const validationErrors = res.locals.errors
    const presenter = new ActionPlanChangeServiceEndDatePresenter(
      caseReference,
      applySessionDeliveryDetailsData(sessionDeliveryDetails, sessionDelivery),
      validationErrors,
      userInputData,
    )
    return presenter.renderPage(res)
  }

  async submitUpdateServiceEndDatePage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getUpdateServiceEndDate(caseReference, username)
    const schema = ActionPlanChangeServiceEndDateDataSchemaBuilder()

    return validateRequestBodyAgainstSchema(schema, req, res, async form => {
      const request = buildSessionDeliveryDetailsRequestFromForm(sessionDeliveryDetails, form)
      this.saveSessionDeliveryDetails(req, caseReference, request)
      return res.redirect(`/referral/${caseReference}/action-plan/person-involvement`)
    })
  }

  async moveNeed(req: Request, res: Response) {
    const {
      id: caseReference,
      outcomeId,
      action,
    } = req.params as { id: string; outcomeId: string; action: 'UP' | 'DOWN' }
    const { username } = res.locals.user

    const moveNeedRequest: ActionPlanNeedsOrderRequest = {
      stepQuestionAnswerHeaderId: outcomeId,
      action,
    }

    await this.referralService.moveNeed(caseReference, moveNeedRequest, username)
    return res.redirect(`/referral/${caseReference}/action-plan`)
  }

  async showUserInvolvementPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getPersonInvolvement(caseReference, username)
    const userInputData = this.getFlashedFormValues(req)
    const sessionDelivery = this.getActionPlanSessionDelivery(req, caseReference)?.sessionDeliveryDetails
    const validationErrors = res.locals.errors
    const presenter = new ActionPlanServiceUserInvolvementPresenter(
      caseReference,
      applySessionDeliveryDetailsData(sessionDeliveryDetails, sessionDelivery),
      validationErrors,
      userInputData,
    )
    return presenter.renderPage(res)
  }

  async submitUserInvolvementPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const sessionDeliveryDetails = await this.referralService.getPersonInvolvement(caseReference, username)
    const actionPlanSummary = await this.referralService.getActionPlanSummary(caseReference, username)
    const { firstName } = actionPlanSummary.personDetails
    const schema = ActionPlanUserInvolvementFormDataSchemaBuilder(sessionDeliveryDetails, firstName)

    return validateRequestBodyAgainstSchema(schema, req, res, async form => {
      const request = buildSessionDeliveryDetailsRequestFromForm(
        sessionDeliveryDetails,
        form,
        buildAdditionalDetailsFieldNameResolver({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'WHY_NOT_INVOLVED' }),
      )
      this.saveSessionDeliveryDetails(req, caseReference, request)
      return res.redirect(`/referral/${caseReference}/action-plan/person-involvement`)
    })
  }
}

export default ActionPlanController

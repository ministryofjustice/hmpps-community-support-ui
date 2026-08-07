import { type RequestHandler, Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'

import ReferralController from '../referral/referralController'
import CaseListController from '../caseList/caseListController'
import CommunityServiceProviderController from '../referral/communityServiceProviders/communityServiceProviderController'
import AppointmentController from '../appointment/appointmentController'
import IcsFeedbackController from '../appointment/icsFeedbackController'
import asyncMiddleware from '../middleware/asyncMiddleware'
import LandingController from '../landing/landingController'
import ActionPlanController from '../referral/actionPlan/actionPlanController'

export default function routes({
  auditService,
  communityServiceProviderService,
  personService,
  referralService,
  caseListService,
  appointmentService,
  referenceDataService,
}: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  // unused for now but added for future expansion

  const post = (path: string, handler: RequestHandler): Router => router.post(path, asyncMiddleware(handler))

  const referralController = new ReferralController(referralService, personService)
  const communityServiceProviderController = new CommunityServiceProviderController(communityServiceProviderService)
  const caseListController = new CaseListController(caseListService)
  const appointmentController = new AppointmentController(referralService, appointmentService, referenceDataService)
  const icsFeedbackController = new IcsFeedbackController(appointmentService)
  const landingController = new LandingController()
  const actionPlanController = new ActionPlanController(referralService)

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.INDEX_PAGE, { who: res.locals.user.username, correlationId: req.id })
    next()
  })

  get('/', (req, res) => landingController.showLandingPage(req, res))

  // NOTE: Generic `:id` route is declared after more-specific `/referral/*` routes

  get('/referral-details/:id', (req, res) => referralController.showReferralDetailsPage(req, res))

  get('/referral/new/find-a-person', (req, res, next) => referralController.handleGetFindPersonRequest(req, res, next))

  post('/referral/new/find-a-person', (req, res) => referralController.handlePostFindPersonRequest(req, res))

  get('/referral/new/select-a-service', (req, res) =>
    communityServiceProviderController.showCommunityServiceProviderPage(req, res),
  )

  post('/referral/new/select-a-service', (req, res) => referralController.communityServiceProviderPage(req, res))

  get('/referral/:id/confirmation', (req, res) => referralController.viewConfirmation(req, res))

  get('/referral/check-referral-information/:id', (req, res) => referralController.checkReferralInformation(req, res))

  post('/referral/:referralId/submit-referral-information', (req, res, next) =>
    referralController.submitReferralInformation(req, res, next),
  )

  get('/unassigned-cases', (req, res) => caseListController.showCaseList(req, res))

  get('/cases-in-progress', (req, res) => caseListController.showCaseList(req, res))

  get('/referral/:identifier/assign', (req, res) => referralController.showAssignCaseWorkersPage(req, res))

  post('/referral/:identifier/assign', (req, res) => referralController.submitReferralUserAssignments(req, res))

  get('/referral/referral-assignments/:identifier', (req, res) =>
    referralController.showAssignCaseWorkersPage(req, res),
  )

  get('/referral/:caseRefId/appointment/confirm-ics', (req, res) => appointmentController.checkIcs(req, res))

  get('/referral/:caseRefId/appointment/schedule-ics', (req, res) => appointmentController.showScheduleIcs(req, res))

  post('/referral/:caseRefId/appointment/schedule-ics', (req, res) => appointmentController.scheduleIcs(req, res))

  get('/referral-details/:caseRefId/ics-view-or-change', (req, res) => appointmentController.viewOrChangeIcs(req, res))

  get('/referral-details/:caseRefId/changed-ics-details/:icsId', (req, res) =>
    appointmentController.viewIcsDetails(req, res),
  )

  get('/ics-feedback/:caseRefId/did-session-take-place', async (req, res) =>
    appointmentController.didSessionTakePlace(req, res),
  )

  post('/ics-feedback/:caseRefId/did-session-take-place', async (req, res) =>
    appointmentController.recordDidSessionTakePlace(req, res),
  )

  get('/referral-details/:caseReference/progress', async (req, res) =>
    referralController.showReferralProgressDetails(req, res),
  )

  get('/referral/:referralId/ics/:icsId/view-session-details', async (req, res) =>
    appointmentController.viewChangeSessionDetails(req, res),
  )

  post('/referral/:caseRefId/appointment/submit-ics', async (req, res) => appointmentController.submitIcs(req, res))

  get('/progress/:caseReference', (req, res) => referralController.showReferralProgressDetails(req, res))

  get('/ics-feedback/:caseRefId/attendance', async (req, res) =>
    appointmentController.icsAppointmentAttendance(req, res),
  )

  post('/ics-feedback/:caseRefId/attendance', async (req, res) =>
    appointmentController.recordIcsAppointmentAttendance(req, res),
  )

  get('/ics-feedback/:caseRefId/session-feedback', (req, res) => appointmentController.getSessionFeedback(req, res))

  post('/ics-feedback/:caseRefId/session-feedback', (req, res) => appointmentController.submitSessionFeedback(req, res))

  get('/ics-feedback/:caseRefId/session-details', (req, res) => appointmentController.sessionDetails(req, res))

  post('/ics-feedback/:caseRefId/session-details', (req, res) => appointmentController.recordSessionDetails(req, res))

  get('/ics-feedback/:caseRefId/check-answers', (req, res) => appointmentController.checkIcsFeedback(req, res))

  post('/ics-feedback/:caseRefId/submit', (req, res) => appointmentController.submitFeedback(req, res))

  get('/ics-feedback/:caseRefId/session/:icsFeedbackId', (req, res) => icsFeedbackController.viewFeedback(req, res))

  get('/ics-feedback/:caseRefId/why-did-the-session-not-happen', (req, res) =>
    appointmentController.whyDidSessionNotHappen(req, res),
  )

  post('/ics-feedback/:caseRefId/why-did-the-session-not-happen', (req, res) =>
    appointmentController.recordWhySessionDidNotHappen(req, res),
  )

  get('/ics-feedback/:caseRefId/how-they-tried-to-contact-the-person', (req, res) =>
    appointmentController.howTheyTriedToContactThePerson(req, res),
  )

  post('/ics-feedback/:caseRefId/how-they-tried-to-contact-the-person', (req, res) =>
    appointmentController.recordHowTheyTriedToContactThePerson(req, res),
  )

  get('/referral/:caseRefId/ics-change-details/reason', (req, res) =>
    appointmentController.changeIcsDetailsReason(req, res),
  )

  post('/referral/:caseRefId/ics-change-details/reason', (req, res) =>
    appointmentController.recordChangeIcsDetailsReason(req, res),
  )

  get('/referral/:caseRefId/ics-change-details/check-answers', (req, res) =>
    appointmentController.changeIcsDetailsCYA(req, res),
  )

  post('/referral/:caseRefId/ics-change-details/submit-ics', (req, res) =>
    appointmentController.submitChangeIcsDetails(req, res),
  )

  get('/referral/:caseRefId/ics-change-details', (req, res) => appointmentController.showRescheduleIcs(req, res))

  post('/referral/:caseRefId/ics-change-details', (req, res) => appointmentController.rescheduleIcs(req, res))

  get('/referral/task-list/confirm-personal-details', (req, res) =>
    referralController.showConfirmPersonalDetails(req, res),
  )

  get('/referral/task-list/additional-support-needs', (req, res) =>
    referralController.showAdditionalSupportNeeds(req, res),
  )

  get('/referral/task-list/needs-an-interpreter', (req, res) => referralController.showNeedsAnInterpreter(req, res))

  get('/referral/task-list/view-risk-summary', (req, res) => referralController.showRiskSummary(req, res))

  post('/referral/task-list/view-risk-summary', (req, res) => referralController.confirmRiskSummary(req, res))

  get('/referral/task-list/edit-risk-summary', (req, res) => referralController.showEditRiskSummary(req, res))

  post('/referral/task-list/edit-risk-summary', (req, res) => referralController.submitEditRiskSummary(req, res))

  post('/referral/task-list/confirm-personal-details', (req, res) =>
    referralController.confirmPersonalDetails(req, res),
  )

  get('/referral/task-list', (req, res) => referralController.showTaskList(req, res))

  get('/referral/:id/action-plan', (req, res) => actionPlanController.showActionPlanPage(req, res))

  get('/referral/:id', (req, res, next) => referralController.showReferralPage(req, res, next))

  return router
}

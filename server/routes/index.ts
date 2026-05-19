import { type RequestHandler, Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'

import ReferralController from '../referral/referralController'
import CaseListController from '../caseList/caseListController'
import CommunityServiceProviderController from '../referral/communityServiceProviders/communityServiceProviderController'
import AppointmentController from '../appointment/appointmentController'
import asyncMiddleware from '../middleware/asyncMiddleware'

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

  const getOrPost = (path: string, handler: RequestHandler) =>
    router.route(path).get(asyncMiddleware(handler)).post(asyncMiddleware(handler))

  const referralController = new ReferralController(referralService, personService)
  const communityServiceProviderController = new CommunityServiceProviderController(communityServiceProviderService)
  const caseListController = new CaseListController(caseListService)
  const appointmentController = new AppointmentController(referralService, appointmentService, referenceDataService)

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.INDEX_PAGE, { who: res.locals.user.username, correlationId: req.id })

    return res.render('pages/index', {})
  })

  // NOTE: Generic `:id` route is declared after more-specific `/referral/*` routes

  get('/referral-details/:id', async (req, res) => referralController.showReferralDetailsPage(req, res))

  getOrPost('/referral/new/find-a-person', async (req, res, next) => {
    await referralController.handleFindPersonRequest(req, res, next)
  })

  get('/referral/new/select-a-service', async (req, res, next) => {
    await communityServiceProviderController.showCommunityServiceProviderPage(req, res, next)
  })

  get('/referral/:id/confirmation', async (req, res, next) => referralController.viewConfirmation(req, res, next))

  get('/referral/check-referral-information/:id', async (req, res) =>
    referralController.checkReferralInformation(req, res),
  )

  post('/referral/:referralId/submit-referral-information', async (req, res) =>
    referralController.submitReferralInformation(req, res),
  )

  get('/referral/:id', async (req, res, next) => {
    await referralController.showReferralPage(req, res, next)
  })

  get('/unassigned-cases', async (req, res, next) => {
    await caseListController.showCaseList(req, res)
  })

  get('/cases-in-progress', async (req, res, next) => {
    await caseListController.showCaseList(req, res)
  })

  get('/referral/:identifier/assign', async (req, res, next) => {
    await referralController.showAssignCaseWorkersPage(req, res, next)
  })

  post('/referral/:identifier/assign', async (req, res) => {
    await referralController.submitReferralUserAssignments(req, res)
  })

  get('/referral/referral-assignments/:identifier', async (req, res, next) => {
    await referralController.showAssignCaseWorkersPage(req, res, next)
  })

  get('/referral/:referralId/appointment/confirm-ics', async (req, res) => appointmentController.checkIcs(req, res))

  getOrPost('/referral/:referralId/appointment/schedule-ics', async (req, res) =>
    appointmentController.scheduleIcs(req, res),
  )

  get('/referral-details/:caseRefId/check-change-ics', (req, res) => appointmentController.changeIcs(req, res))

  getOrPost('/ics-feedback/:caseRefId/did-session-take-place', async (req, res) =>
    appointmentController.didSessionTakePlace(req, res),
  )

  get('/referral-details/:caseReference/progress', async (req, res) =>
    referralController.showReferralProgressDetails(req, res),
  )

  get('/referral/:referralId/ics/:icsId/view-session-details', async (req, res) =>
    appointmentController.viewChangeSessionDetails(req, res),
  )

  post('/referral/:referralId/appointment/submit-ics', async (req, res) => appointmentController.submitIcs(req, res))

  get('/progress/:caseReference', async (req, res) => {
    await referralController.showReferralProgressDetails(req, res)
  })

  get('/ics-feedback/:caseRefId/attendance', async (req, res) =>
    appointmentController.icsAppointmentAttendance(req, res),
  )
  post('/ics-feedback/:caseRefId/attendance', async (req, res) =>
    appointmentController.recordIcsAppointmentAttendance(req, res),
  )

  get('/ics-feedback/feedback/:caseRefId', async (req, res) => appointmentController.checkFeedback(req, res))

  get('/ics-feedback/:caseRefId/session-feedback', (req, res) => appointmentController.getSessionFeedback(req, res))

  post('/ics-feedback/:caseRefId/session-feedback', (req, res) => appointmentController.submitSessionFeedback(req, res))

  get('/ics-feedback/:caseRefId/session-details', (req, res) => appointmentController.sessionDetails(req, res))

  post('/ics-feedback/:caseRefId/session-details', (req, res) => appointmentController.recordSessionDetails(req, res))

  return router
}

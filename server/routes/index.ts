import { type RequestHandler, Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'

import ReferralController from '../referral/referralController'
import CaseListController from '../caseList/caseListController'
import CommunityServiceProviderController from '../referral/communityServiceProviders/communityServiceProviderController'
import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes({
  auditService,
  communityServiceProviderService,
  personService,
  referralService,
  caseListService,
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

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.INDEX_PAGE, { who: res.locals.user.username, correlationId: req.id })

    return res.render('pages/index', {})
  })

  // NOTE: Generic `:id` route is declared after more-specific `/referral/*` routes

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

  get('/caselist', async (req, res, next) => {
    await caseListController.showCaseList(req, res)
  })

  return router
}

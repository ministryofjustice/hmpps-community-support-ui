import express from 'express'

import createError from 'http-errors'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import setUpFormValidation from './middleware/setUpFormValidation'
import setUpContent from './middleware/setUpContent'

import routes from './routes'
import type { Services } from './services'
import config from './config'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware(config.allowedRoles))
  app.use(setUpContent())

  if (process.env.NODE_ENV !== 'production') {
    // Test-only route: seeds the session with a createAppointmentRequest for integration tests.
    // Registered before CSRF middleware so it is not blocked by CSRF protection.
    app.post('/test/setup-appointment-session', async (req, res) => {
      req.session.createAppointmentRequest = req.body
      res.status(200).json({ ok: true })
    })
    app.post('/test/setup-change-appointment-details', async (req, res) => {
      req.session.ChangeAppointmentDetails = req.body
      res.status(200).json({ ok: true })
    })
    app.post('/test/setup-ics-feedback-session', (req, res) => {
      if (!req.session.icsFeedbackSubmission) {
        req.session.icsFeedbackSubmission = req.body.icsFeedbackSubmission
      }
      res.status(200).json({ ok: true })
    })
    app.post('/test/setup-referral-information', (req, res) => {
      req.session.referralInformation = req.body
      res.status(200).json({ ok: true })
    })
    app.post('/test/seed-session-ics-feedback', (req, res) => {
      if (req.body?.caseRefId !== '') {
        req.session.icsFeedbackSubmission = req.body.icsFeedbackSubmission
      }
      res.status(200).json({ ok: true })
    })
    app.post('/test/setup-session-feedback-session', (req, res) => {
      if (!req.session.icsFeedbackSubmission) {
        req.session.icsFeedbackSubmission = { record: { didSessionHappen: true }, caseReferenceId: '' }
      }
      if (req.body?.caseRefId !== '') {
        req.session.icsFeedbackSubmission = req.body.icsFeedbackSubmission
      }
      res.status(200).json({ ok: true })
    })
    app.post('/test/setup-referral-progress-session', (req, res) => {
      req.session.referralProgressBanner = req.body.referralProgressBanner
      res.sendStatus(200)
    })
    app.post('/test/setup-create-referral-details', (req, res) => {
      req.session.referralCreationDetails = req.body.referralCreationDetails
      res.sendStatus(200)
    })
    app.post('/test/setup-draft-referral-session', (req, res) => {
      req.session.draftReferralId = req.body.draftReferalId
      if (req.body.personId) {
        req.session.personId = req.body.personId
      }
      res.sendStatus(200)
    })
  }

  app.use(setUpCsrf())
  app.use(setUpCurrentUser())
  app.use(setUpFormValidation())

  app.use(routes(services))

  app.use((_req, _res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}

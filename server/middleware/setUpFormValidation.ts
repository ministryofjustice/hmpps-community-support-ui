import express, { Router, Request, Response, NextFunction } from 'express'
import FormValidation from './formValidationMiddleware'

export default function setUpFormValidation(): Router {
  const router = express.Router()

  router.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') FormValidation.setFieldErrors(req, res)
    if (req.method === 'POST') FormValidation.setFormKeysFromRequestBody(req, res)
    next()
  })

  return router
}

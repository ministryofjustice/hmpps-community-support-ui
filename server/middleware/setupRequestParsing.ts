import express, { Router } from 'express'

export default function setUpWebRequestParsing(maxBodySize: string): Router {
  const router = express.Router()
  router.use(express.json({ limit: maxBodySize }))
  router.use(express.urlencoded({ extended: true, limit: maxBodySize }))
  return router
}

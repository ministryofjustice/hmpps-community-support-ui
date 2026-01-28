import express, { Router, Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'
import logger from '../../logger'

function loadContentData(): Record<string, Record<string, string>> {
  const contentFilePath = path.join(process.cwd(), '/dist/assets/content', 'content.json')
  let contentData: Record<string, Record<string, string>> = {}
  try {
    const raw = fs.readFileSync(contentFilePath, 'utf8')
    contentData = JSON.parse(raw) as Record<string, Record<string, string>>
  } catch {
    logger.error(`Could not read content file at ${contentFilePath}`)
  }
  return contentData
}

function getContentForPath(
  reqPath: string,
  contentData: Record<string, Record<string, string>>,
): Record<string, string> {
  return contentData[reqPath] || {}
}

export default function setUpContentMiddleware(): Router {
  const router = express.Router()

  router.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.content = getContentForPath(req.path, loadContentData())
    next()
  })

  return router
}

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

function getContentForPath(req: Request, contentData: Record<string, Record<string, string>>): Record<string, string> {
  const parsedPath = replaceUUIDWithPlaceholder(req.path)
  return contentData[parsedPath] || {}
}

function replaceUUIDWithPlaceholder(pathToParse: string): string {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  return pathToParse.replace(uuidRegex, ':id')
}

export default function setUpContent(): Router {
  const router = express.Router()

  router.use((req: Request, res: Response, next: NextFunction) => {
    const content = getContentForPath(req, loadContentData())
    if (Object.keys(content).length === 0) {
      logger.warn(`No content found for path ${req.path} (parsed as ${replaceUUIDWithPlaceholder(req.path)})`)
    }
    res.locals.content = content
    next()
  })

  return router
}

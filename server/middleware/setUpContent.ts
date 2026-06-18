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
  const parsedPath = parsePlaceholdersFromPath(req.path)
  const parentPaths = getParentPathsForSubPath(parsedPath)
  logger.info(
    `Getting content for path ${req.path} (parsed as ${parsedPath}) with subpaths ${JSON.stringify(parentPaths)}`,
  )
  const content = {} as Record<string, string>
  for (const parentPath of parentPaths) {
    const contentForParentPath = contentData[parentPath]
    if (contentForParentPath) {
      Object.assign(content, contentForParentPath)
    }
  }
  const contentForFullPath = contentData[parsedPath] || {}
  const mergedContent = contentForFullPath ? { ...content, ...contentForFullPath } : content
  return mergedContent
}

function getParentPathsForSubPath(subPath: string): Array<string> {
  const paths = Array<string>()
  const pathElements = subPath.split('/').filter(element => element !== '')

  pathElements.pop()
  while (pathElements.length > 0) {
    paths.push(`/${pathElements.join('/')}`)
    pathElements.pop()
  }
  return paths
}

function parsePlaceholdersFromPath(contentPath: string): string {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  const caseReferenceRegex = /[a-z]{2}\d{4}[a-z]{2}/i

  return contentPath.replace(uuidRegex, ':id').replace(caseReferenceRegex, ':id')
}

export default function setUpContent(): Router {
  const router = express.Router()

  router.use((req: Request, res: Response, next: NextFunction) => {
    const content = getContentForPath(req, loadContentData())
    if (Object.keys(content).length === 0) {
      logger.warn(`No content found for path ${req.path} (parsed as ${parsePlaceholdersFromPath(req.path)})`)
    }
    res.locals.content = content
    next()
  })

  return router
}

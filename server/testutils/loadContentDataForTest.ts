import { readFileSync } from 'fs'
import { join } from 'path'
import logger from '../../logger'
import { GlobalContent } from '../../assets/content/GlobalContent'

type ContentPath = keyof GlobalContent

const loadContentDataForTest = (url: ContentPath): GlobalContent[ContentPath] => {
  const contentFilePath = join(process.cwd(), 'assets', 'content', 'content.json')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contentData: Record<string, Record<string, any>> = {}
  try {
    const raw = readFileSync(contentFilePath, 'utf8')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contentData = JSON.parse(raw) as Record<string, Record<string, any>>
  } catch {
    logger.error(`Could not read content file at ${contentFilePath}`)
  }
  return contentData[url] as GlobalContent[ContentPath]
}

export default loadContentDataForTest

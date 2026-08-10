import { readFileSync } from 'fs'
import { join } from 'path'
import logger from '../../logger'

const loadContentData = (url: string): Record<string, string> => {
  const contentFilePath = join(process.cwd(), 'assets', 'content', 'content.json')
  let contentData: Record<string, Record<string, string>> = {}
  try {
    const raw = readFileSync(contentFilePath, 'utf8')
    contentData = JSON.parse(raw) as Record<string, Record<string, string>>
  } catch {
    logger.error(`Could not read content file at ${contentFilePath}`)
  }
  return contentData[url]
}
export default loadContentData

import nunjucks from 'nunjucks'
import { Cheerio, load } from 'cheerio'
import path from 'path'
import { initialiseName } from './utils'
import fs from 'fs'
import logger from '../../logger'

const loadHtml = (html: string) => {
  return load(html)
}

const cleanHtml = (element: Cheerio<any>): string => {
  let html = element.html()
  if (!html) return null
  return html
    .replace(/&#x2019;/g, '’')
    .replace(/(<[^/][^>]+>)\s*/g, '$1')
    .replace(/\s*(<\/[^>]+>)/g, '$1')
    .replace(/(\n\s*)+/g, '')
    .trim()
};

const renderer = (context: {}) => {
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve('../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
    ],
    {
      autoescape: true,
    },
  )

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)

  return (options: { template: string; string?: string } | string) => {
    if (typeof options === 'string') options = { template: options }

    let output

    if (options.template) output = njkEnv.render(options.template, context)
    else if (options.string) output = njkEnv.renderString(options.string, context)
    else throw new Error('Unable to render')

    return loadHtml(output)
  }
}

export default renderer
export { cleanHtml }

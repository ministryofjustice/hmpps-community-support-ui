import { Request, Response } from 'express'
import { AdditionalSupportNeedsRequest } from '@community-support-api'
import ReferralService from '../services/referralService'
import AdditionalSuportNeedsPresenter from './additionalSupportNeeds/AdditionalSupportNeedsPresenter'
import { formatDynamicErrorMessages, validateRequestBodyAgainstSchema } from '../validation/validationUtils'
import {
  AdditionalSuportNeedsFormData,
  AdditionalSuportNeedsFormDataSchemaBuilder,
} from '../validation/AdditionalSuportNeedsFormData'
import logger from '../../logger'
import NeedsAnInterpreterPresenter from './needsAnInterpreter/NeedsAnInterpreterPresenter'
import {
  NeedsAnInterpreterFormDataSchemaBuilder,
  NeedsAnInterpreterFormData,
} from '../validation/NeedsAnInterpreterFormDataSchema'
import { ErrorMiddlewareErrors } from '../@types/express'
import additionalSupportNeedsResolver from './additionalSupportNeeds/additionalSupportNeedsResolver'

const findAPersonURL = '/referral/new/find-a-person' as const
const taskListURL = '/referral/task-list' as const
const additionalSupportNeedsURL = '/referral/task-list/additional-support-needs' as const
const needsInterpreterURL = '/referral/task-list/needs-an-interpreter' as const

const additionalSupportNeedsBodyLookup: Record<string, keyof AdditionalSupportNeedsRequest> = {
  Anything: 'anythingElse',
  Caring: 'caringResponsibilities',
  Diversity: 'diversity',
  Employment: 'employmentResponsibilities',
  Location: 'locationTravel',
  Mental: 'mentalEmotionalHealth',
  Neurodiversity: 'neurodiversity',
  Physical: 'physicalHealth',
}

export default class DraftReferralController {
  constructor(private readonly referralService: ReferralService) {}

  async showAdditionalSupportNeeds(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (draftReferalId) {
      try {
        const postBodyDataRaw = req.flash('value').at(0)
        const postBodyData = JSON.parse(postBodyDataRaw || '{}')
        const additionalSupportNeeds = await this.referralService.getAdditionalSupportNeeds(draftReferalId, username)
        const validationErrors: ErrorMiddlewareErrors = formatDynamicErrorMessages(
          res.locals.errors,
          '{{ firstname }}',
          additionalSupportNeeds.refereeName.firstName,
        )
        const resolvedData = additionalSupportNeedsResolver(postBodyData, additionalSupportNeeds)
        const presenter = new AdditionalSuportNeedsPresenter(resolvedData, validationErrors)
        return presenter.renderPage(res)
      } catch (e) {
        logger.error(e)
        req.flash('confirmPersonalDetailsError', 'something has gone wrong')
        return res.redirect(findAPersonURL)
      }
    }
    return res.redirect(findAPersonURL)
  }

  async additionalSupportNeeds(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (draftReferalId) {
      try {
        const additionalSupportNeeds = await this.referralService.getAdditionalSupportNeeds(draftReferalId, username)
        const schema = AdditionalSuportNeedsFormDataSchemaBuilder(additionalSupportNeeds.refereeName.firstName)
        return validateRequestBodyAgainstSchema(schema, req, res, async (data: AdditionalSuportNeedsFormData) => {
          const needsAdditionalSupport = !data.AdditionalNeeds.includes('none')
          const selectedData = Object.fromEntries(
            data.AdditionalNeeds.filter(selection => selection !== 'none').map(selection => [
              additionalSupportNeedsBodyLookup[selection],
              data[`${selection}Value`],
            ]),
          )
          const body = { needsAdditionalSupport, ...selectedData }
          await this.referralService.submitAdditionalSupportNeeds(body, draftReferalId, username)
          return res.redirect(needsInterpreterURL)
        })
      } catch (e) {
        logger.error(e)
        req.flash(`additionalSupportNeedsError`, `something went wrong`)
        return res.redirect(additionalSupportNeedsURL)
      }
    }
    return res.redirect(findAPersonURL)
  }

  async showNeedsAnInterpreter(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (!draftReferalId) {
      return res.redirect(findAPersonURL)
    }
    try {
      const pageData = await this.referralService.getNeedsInterpreterPageData(draftReferalId, username)
      const validationErrors: ErrorMiddlewareErrors = formatDynamicErrorMessages(
        res.locals.errors,
        '{{ firstname }}',
        pageData.refereeName.firstName,
      )
      const presenter = new NeedsAnInterpreterPresenter(pageData, validationErrors)
      return presenter.renderPage(res)
    } catch (e) {
      logger.error(e)
      return res.redirect(findAPersonURL)
    }
  }

  async needsAnInterpreter(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (draftReferalId) {
      try {
        const additionalSupportNeeds = await this.referralService.getAdditionalSupportNeeds(draftReferalId, username)
        const schema = NeedsAnInterpreterFormDataSchemaBuilder(additionalSupportNeeds.refereeName.firstName)
        return validateRequestBodyAgainstSchema(schema, req, res, async (data: NeedsAnInterpreterFormData) => {
          await this.referralService.submitNeedsAnInterpreter(data, draftReferalId, username)
          return res.redirect(taskListURL)
        })
      } catch (e) {
        logger.error(e)
        return res.redirect(findAPersonURL)
      }
    }
    return res.redirect(findAPersonURL)
  }
}

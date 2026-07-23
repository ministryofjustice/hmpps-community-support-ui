import { Request, Response } from 'express'
import { AdditionalSupportNeedsRequest } from '@community-support-api'
import ReferralService from '../services/referralService'
import AdditionalSuportNeedsPresenter from './additionalSupportNeeds/AdditionalSupportNeedsPresenter'
import { validateRequestBodyAgainstSchema } from '../validation/validationUtils'
import {
  AdditionalSuportNeedsFormData,
  AdditionalSuportNeedsFormDataSchemaBuilder,
} from '../validation/AdditionalSuportNeedsFormData'
import logger from '../../logger'
import ConfirmPersonalDetailsPresenter from './confirmPersonalDetails/ConfirmPersonalDetailsPresenter'
import TaskListPresenter from './taskList/TaskListPresenter'
import NeedsAnInterpreterPresenter from './needsAnInterpreter/NeedsAnInterpreterPresenter'
import {
  NeedsAnInterpreterFormDataSchemaBuilder,
  NeedsAnInterpreterFormData,
} from '../validation/NeedsAnInterpreterFormDataSchema'

const findAPersonURL = '/referral/new/find-a-person' as const
const taskListURL = '/referral/task-list' as const
const additionalSupportNeedsURL = '/referral/task-list/additional-support-needs' as const
const needsInterpreterURL = '/referral/task-list/needs-an-interpreter' as const

export default class DraftReferralController {
  constructor(private readonly referralService: ReferralService) {}

  async showTaskList(req: Request, res: Response) {
    const { username } = res.locals.user
    const { draftReferralId: draftReferalId } = req.session
    if (!draftReferalId) {
      return res.redirect(findAPersonURL)
    }

    const taskListStatus = await this.referralService.getTaskListStatus(draftReferalId, username)
    const presenter = new TaskListPresenter(taskListStatus, draftReferalId)
    return presenter.renderPage(res)
  }

  async showConfirmPersonalDetails(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const draftReferralKey = req.session.draftReferralId

    if (draftReferralKey) {
      try {
        const data = await this.referralService.getPersonalDetails(draftReferralKey, username)
        const presenter = new ConfirmPersonalDetailsPresenter(data)
        return presenter.renderPage(res)
      } catch (e) {
        logger.error(e)
        req.flash('confirmPersonalDetailsError', 'something has gone wrong')
        return res.redirect(findAPersonURL)
      }
    }
    return res.redirect(findAPersonURL)
  }

  async confirmPersonalDetails(req: Request, res: Response) {
    const { draftReferralId } = req.session
    return draftReferralId ? res.redirect(taskListURL) : res.redirect(findAPersonURL)
  }

  async showAdditionalSupportNeeds(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (draftReferalId) {
      try {
        const additionalSupportNeeds = await this.referralService.getAdditionalSupportNeeds(draftReferalId, username)
        const presenter = new AdditionalSuportNeedsPresenter(additionalSupportNeeds)
        return presenter.renderPage(res)
      } catch (e) {
        logger.error(e)
        req.flash('confirmPersonalDetailsError', 'something has gone wrong')
        return res.redirect(additionalSupportNeedsURL)
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
          const needsAdditionalSupport = Object.values(data).some(selection => selection.selected)
          const body: AdditionalSupportNeedsRequest = {
            needsAdditionalSupport,
          }
          if (data.Anything.selected) {
            body.anythingElse = data.Anything.value
          }
          if (data.Caring.selected) {
            body.caringResponsibilities = data.Caring.value
          }
          if (data.Diversity.selected) {
            body.diversity = data.Diversity.value
          }
          if (data.Employment.selected) {
            body.employmentResponsibilities = data.Employment.value
          }
          if (data.Location.selected) {
            body.locationTravel = data.Location.value
          }
          if (data.Mental.selected) {
            body.mentalEmotionalHealth = data.Mental.value
          }
          if (data.Neurodiversity.selected) {
            body.neurodiversity = data.Neurodiversity.value
          }
          if (data.Physical.selected) {
            body.physicalHealth = data.Physical.value
          }
          await this.referralService.submitAdditionalSupportNeeds(body, draftReferalId, username)
          return res.redirect(needsInterpreterURL)
        })
      } catch (e) {
        logger.error(e)
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
      const presenter = new NeedsAnInterpreterPresenter(pageData)
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
        res.redirect(findAPersonURL)
      }
    }
    return res.redirect(findAPersonURL)
  }
}

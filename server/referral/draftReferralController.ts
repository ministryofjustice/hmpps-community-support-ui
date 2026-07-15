import { Request, Response } from 'express'
import ReferralService from '../services/referralService'
import logger from '../../logger'
import TaskListPresenter from './taskList/TaskListPresenter'
import ConfirmPersonalDetailsPresenter from './confirmPersonalDetails/ConfirmPersonalDetailsPresenter'
// import AdditionalSuportNeedsPresenter from './additionalSupportNeeds/AdditionalSupportNeedsPresenter'

// const taskListUrl = '/referral/task-list' as const
const referralJourneyStartUrl = '/referral/new/find-a-person' as const

export default class DraftReferralController {
  constructor(private readonly referralService: ReferralService) {}

  async showTaskList(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralId = req.session?.draftReferralId

    if (!draftReferralId) {
      return res.redirect(referralJourneyStartUrl)
    }

    try {
      const taskListStatus = await this.referralService.getTaskListStatus(draftReferralId, username)
      const presenter = new TaskListPresenter(taskListStatus)
      return presenter.renderPage(res)
    } catch (error) {
      logger.error('unexpected error :', error)
      req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
      return res.redirect(referralJourneyStartUrl)
    }
  }

  async showConfirmPersonalDetails(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId

    if (!draftReferralKey) {
      return res.redirect(referralJourneyStartUrl)
    }

    const data = await this.referralService.getPersonalDetails(draftReferralKey, username)
    const presenter = new ConfirmPersonalDetailsPresenter(data)
    return presenter.renderPage(res)
  }

  showAdditionalSupportNeeds(req: Request, res: Response) {
    // const { username } = res.locals.user
    const draftReferralId = req.session?.draftReferralId
    if (!draftReferralId) {
      return res.redirect(referralJourneyStartUrl)
    }

    /* TODO
    const additionalSupportNeeds = this.referralService.getAdditionalSupportNeeds(draftReferralId, username);

    const presenter = new AdditionalSuportNeedsPresenter(additionalSupportNeeds)
    return presenter.renderPage(res) */
    return res.redirect(referralJourneyStartUrl)
  }

  async confirmPersonalDetails(req: Request, res: Response): Promise<void> {
    const draftReferralKey = req.session?.draftReferralId
    if (!draftReferralKey) {
      return res.redirect(referralJourneyStartUrl)
    }

    return res.redirect(`/referral/task-list`)
  }
}

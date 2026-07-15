import { Request, Response } from 'express'
import ReferralService from '../services/referralService'
import logger from '../../logger'

export default class DraftReferralController {
  constructor(private readonly referralService: ReferralService) {}

  async createDraftReferral(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralCreationDetails = req.session ? req.session.referralCreationDetails : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }
    try {
      const createReferralRequest = {
        personDetails: referralCreationDetails.personDetails,
        communityServiceProviderId: referralCreationDetails.communityServiceProviderId,
        crn: referralCreationDetails.personDetails.personIdentifier,
        urgency: false,
      }

      const referralInformation = await this.referralService.createReferral(createReferralRequest, username)
      req.session.draftReferralId = referralInformation.referralId
      return res.redirect('/somewhere') // TODO
    } catch (error) {
      logger.error('Error creating referral:', error)
      return { success: false }
    }
  }

  async showTaskList(req: Request, res: Response) {
    // const { username } = res.locals.user
    const draftReferralId = req.session?.draftReferralId

    if (!draftReferralId) {
      return res.redirect('/referral/new/find-a-person')
    }

    /* try {
                        const taskListStatus = await this.referralService.getTaskListStatus(draftReferralId, username);
                        const presenter = new TaskListPresenter(taskListStatus)
                        return presenter.renderPage(res)
                    }
                    catch (error) {
                        console.error("unexpected error :", error);
                        req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
                        return res.redirect('/referral/new/find-a-person')
                    } */
    return res.redirect('/referral/new/find-a-person')
  }
}

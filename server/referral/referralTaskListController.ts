import { Request, Response } from 'express'
import AdditionalSuportNeedsPresenter from './additionalSupporNeeds/AdditionalSupportNeedsPresenter'
import { getCurrentDraftReferralKey, updateSectionStatus } from './taskList/TaskListHelper'

const findAPersonURL = '/referral/new/find-a-person' as const
const taskListURL = '/referral/task-list' as const

export default class referralTaskListController {
  showAdditionalSupportNeeds(req: Request, res: Response) {
    const referralCreationDetails = req.session ? req.session.referralCreationDetails : null
    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    const { personDetails } = referralCreationDetails
    const presenter = new AdditionalSuportNeedsPresenter(personDetails)
    return presenter.renderPage(res)
  }

  additionalSupportNeeds(req: Request, res: Response) {
    const referralId = getCurrentDraftReferralKey(req)
    if (!referralId) {
      res.redirect(findAPersonURL)
    }
    updateSectionStatus(req, referralId, 'personNeeds', 'completed')
    res.redirect(taskListURL)
  }
}

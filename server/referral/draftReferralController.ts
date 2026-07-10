import { Request, Response } from 'express'
import AdditionalSuportNeedsPresenter from './additionalSupporNeeds/AdditionalSupportNeedsPresenter'
import {
  getCurrentDraftReferralKey,
  getTaskListState,
  saveTaskListState,
  updateSectionStatus,
} from './taskList/TaskListHelper'
import ReferralService from '../services/referralService'
import ConfirmPersonalDetailsPresenter from './confirmPersonalDetails/ConfirmPersonalDetailsPresenter'
import logger from '../../logger'
import TaskListPresenter from './taskList/TaskListPresenter'

const findAPersonURL = '/referral/new/find-a-person' as const
const taskListURL = '/referral/task-list' as const

export default class DraftReferralController {
  constructor(private readonly referralService: ReferralService) {}

  async showConfirmPersionalDetails(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralKey = getCurrentDraftReferralKey(req)

    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    const data = await this.referralService.getPersionalDetails(draftReferralKey, username)
    const presenter = new ConfirmPersonalDetailsPresenter(data)
    return presenter.renderPage(res)
  }

  async confirmPersionalDetails(req: Request, res: Response): Promise<void> {
    const referralId = getCurrentDraftReferralKey(req)
    if (!referralId) {
      return res.redirect(findAPersonURL)
    }
    updateSectionStatus(req, referralId, 'personalDetails', 'completed')
    return res.redirect(taskListURL)
  }

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

  async showTaskList(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralCreationDetails = req.session ? req.session.referralCreationDetails : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    const { personIdentifier } = referralCreationDetails.personDetails

    try {
      const createReferralRequest = {
        personDetails: referralCreationDetails.personDetails,
        communityServiceProviderId: req.params.id as string, // referralCreationDetails.communityServiceProviderId,
        crn: personIdentifier,
        urgency: false,
      }

      const referralInformation = await this.referralService.createReferral(createReferralRequest, username)

      req.session.referralCreationDetails = createReferralRequest
      const taskListState = { ...getTaskListState(req), referralId: referralInformation.referralId }
      saveTaskListState(req, taskListState)

      const presenter = new TaskListPresenter(
        `${referralCreationDetails.personDetails.firstName} ${referralCreationDetails.personDetails.lastName}`,
        taskListState,
      )
      return presenter.renderPage(res)
    } catch (error) {
      logger.error('Error creating referral:', error)
      req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
      return res.redirect('/referral/new/find-a-person')
    }
  }
}

import { Request, Response, NextFunction } from 'express'
import { CreateReferralRequest } from '@community-support-api'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import logger from '../../logger'
import CheckReferralInformationPresenter from './check-referral-information/checkReferralInformationPresenter'

class ReferralController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly personService: PersonService,
  ) {}

  async showReferralPage(req: Request, res: Response, next: NextFunction) {
    const referralId = req.params.id as string
    const { username } = res.locals.user
    const referral = await this.referralService.getReferralById(referralId, username)
    return res.render('referral/referral', { referral })
  }

  async handleFindPersonRequest(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      const { personIdentifier } = req.body
      const { username } = res.locals.user
      try {
        const foundPerson = await this.personService.getPersonByIdentifier(personIdentifier, username)
        const presenter = new FoundPersonPresenter(foundPerson)
        req.session.referralCreationDetails = { personDetails: foundPerson } as CreateReferralRequest
        return presenter.renderPage(res)
      } catch (error) {
        if (error.responseStatus === 404) {
          req.flash('personIdentifierError', `No person with identifier '${personIdentifier}' found`)
        } else {
          logger.error('Error finding person by identifier:', error)
          req.flash('personIdentifierError', 'An unexpected error occurred. Please try again.')
        }
        return res.redirect('/referral/new/find-a-person')
      }
    }
    return res.render('referral/findPerson', {})
  }

  async viewConfirmation(req: Request, res: Response, next: NextFunction): Promise<void> {
    const referralId = req.params.id as string
    const { username } = res.locals.user
    const referral = await this.referralService.getReferralById(referralId, username)

    const presenter = new ConfirmationPresenter(referral)

    return presenter.renderPage(res)
  }

  async checkReferralInformation(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const referralCreationDetails = req.session ? req.session.referralCreationDetails : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    const createReferralRequest = {
      personDetails: referralCreationDetails.personDetails,
      communityServiceProviderId: req.params.id as string,
      crn: referralCreationDetails.personDetails.personIdentifier,
      urgency: false,
    } as CreateReferralRequest
    let referralInformation
    try {
      referralInformation = await this.referralService.createReferral(createReferralRequest, username)
    } catch (error) {
      logger.error('Error creating referral:', error)
      req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
      return res.redirect('/referral/new/find-a-person')
    }
    const presenter = new CheckReferralInformationPresenter(referralInformation)

    return presenter.renderPage(res)
  }

  async submitReferralInformation(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }

    const submitReferralResponse = await this.referralService.submitReferralById(referralId, username)

    return res.redirect(`/referral/${submitReferralResponse.referralId}/confirmation`)
  }
}

export default ReferralController

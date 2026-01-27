import { Request, Response, NextFunction } from 'express'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import logger from '../../logger'
import { GovukFrontendPanel } from '../@types/govukFrontend'
import ViewUtils from '../utils/viewUtils'
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

  async showFindPersonPage(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      const { personIdentifier } = req.body
      const { username } = res.locals.user
      try {
        const foundPerson = await this.personService.getPersonByIdentifier(personIdentifier, username)
        const presenter = new FoundPersonPresenter(foundPerson)
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
    const referralId = req.params.id
    const { username } = res.locals.user
    const referral = await this.referralService.getReferralById(referralId, username)

    const presenter = new ConfirmationPresenter(referral)

    return presenter.renderPage(res)
  }

  async checkReferralInformation(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const createReferralRequest = {
      personId: '46abce04-e137-41e5-b18f-606a35375b33',
      communityServiceProviderId: 'bc852b9d-1997-4ce4-ba7f-cd1759e15d2b',
      crn: 'CRN0001' as string,
      urgency: req.query.urgency !== 'false',
    }
    // This is a temporary call to make a referral until make a referral workflow is finalised and implemented
    let referralInformation
    try {
      referralInformation = await this.referralService.createReferral(createReferralRequest, username)
    } catch {
      req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
    }
    const presenter = new CheckReferralInformationPresenter(referralInformation)

    return res.render('referral/checkReferralInformation', { presenter })
  }

  async submitReferralInformation(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }

    const submitReferralResponse = await this.referralService.submitReferralById(referralId, username)

    return res.redirect(`/referral/${submitReferralResponse.referralId}/confirmation`)
  }
}

export default ReferralController

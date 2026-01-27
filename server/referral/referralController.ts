import { Request, Response, NextFunction } from 'express'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import logger from '../../logger'

class ReferralController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly personService: PersonService,
  ) {}

  async showReferralPage(req: Request, res: Response, next: NextFunction) {
    const referralId = req.params.id
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

    return presenter.renderPage(res, req, next)
  }
}

export default ReferralController

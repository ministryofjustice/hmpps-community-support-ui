import { Request, Response, NextFunction } from 'express'
import ReferralService from '../services/referralService'

class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  async showReferralPage(req: Request, res: Response, next: NextFunction) {
    const referralId = req.params.id
    const { username } = res.locals.user
    const referral = await this.referralService.getReferralById(referralId, username)
    return res.render('referral/referral', { referral })
  }
}

export default ReferralController

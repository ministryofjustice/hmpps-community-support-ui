import { Request, Response } from 'express'
import LandingPresenter from './landingPresenter'

export default class LandingController {
  showLandingPage(req: Request, res: Response) {
    const presenter = new LandingPresenter()
    return presenter.renderPage(res)
  }
}

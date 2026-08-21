import { Request, Response } from 'express'
import NeedsPresenter from './needsPresenter'

class NeedsController {
  async showNeedsPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }

    const presenter = new NeedsPresenter(caseReference)

    return presenter.renderPage(res)
  }
}

export default NeedsController

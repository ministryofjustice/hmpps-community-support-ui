import { Request, Response } from 'express'
import NeedsController from './needsController'
import NeedsPresenter from './needsPresenter'

jest.mock('./needsPresenter')

describe('NeedsController', () => {
  let needsController: NeedsController
  let req: Request
  let res: Response

  beforeEach(() => {
    needsController = new NeedsController()

    req = {
      params: {
        id: 'AB1234CD',
      },
    } as unknown as Request

    res = {
      locals: {
        content: {
          pageHeader: 'Needs',
        },
      },
      render: jest.fn(),
    } as unknown as Response
  })

  it('renders the needs page', async () => {
    await needsController.showNeedsPage(req, res)

    expect(NeedsPresenter).toHaveBeenCalledWith('AB1234CD')
    expect(NeedsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
  })
})

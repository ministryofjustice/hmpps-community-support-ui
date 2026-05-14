import type { Request, Response } from 'express'
import FormValidation from './formValidationMiddleware'

describe('FormValidation Middleware', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {},
      flash: jest.fn().mockReturnValue([]),
      session: {},
    } as unknown as Request

    res = {
      locals: {},
    } as unknown as Response
  })

  describe('setFieldErrors', () => {
    it('should set field errors in res.locals.errors', () => {
      req.session.formKeys = ['field1', 'field2']
      ;(req.flash as jest.Mock).mockImplementation((key: string) => {
        if (key === 'field1Error') return ['Error message for field 1']
        return []
      })

      FormValidation.setFieldErrors(req, res)

      expect(res.locals.errors).toEqual({
        list: [{ href: '#field1', text: 'Error message for field 1' }],
        messages: { field1: { text: 'Error message for field 1' } },
      })
    })
  })
  describe('setFormKeys', () => {
    it('should set form keys in req.session.formKeys', () => {
      req.body = { field1: 'value1', field2: 'value2', _csrf: 'token' }
      FormValidation.setFormKeysFromRequestBody(req, res)
      expect(req.session.formKeys).toEqual(['field1', 'field2'])
    })
  })
})

import z, { ZodType, parseAsync, ZodError } from 'zod'
import { Request, Response } from 'express'

const validateRequestBodyAgainstSchema = <Schema extends ZodType>(
  schema: Schema,
  req: Request,
  res: Response,
  successFunction: (data: z.infer<typeof schema>) => void,
): Promise<void> =>
  parseAsync(schema, req.body)
    .then(successFunction)
    .catch(error => {
      if (!(error instanceof ZodError)) {
        return res.redirect('/error')
      }
      const errors = z.flattenError(error).fieldErrors
      req.session.formKeys = []
      Object.entries(errors).forEach(([field, errorMessage]) => {
        req.session.formKeys.push(field)
        req.flash(`${field}Error`, `${errorMessage}`)
      })
      return res.redirect(req.url)
    })
export default validateRequestBodyAgainstSchema

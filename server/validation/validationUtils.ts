import z, { ZodType, parseAsync, ZodError } from 'zod'
import { Request, Response } from 'express'
import { ErrorMiddlewareErrors } from '../@types/express'

export const formatDynamicErrorMessages = (
  errors: ErrorMiddlewareErrors,
  searchValue: string,
  replaceValue: string,
  fields: string | string[],
) => {
  fields = typeof fields === 'string' ? [fields] : fields
  const dynamicErrors = errors.list.filter(({ href }) => fields.map(field => `#${field}`).includes(href))
  dynamicErrors.forEach(error => {
    error.text = error.text.replace(searchValue, replaceValue || '')
  })
  const dynamicFieldErrors = Object.entries(errors.messages)
    .filter(([key, _]) => fields.includes(key))
    .map(([_, val]) => val)
  dynamicFieldErrors.forEach(error => {
    error.text = error.text.replace(searchValue, replaceValue || '')
  })
}

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

import z, { ZodType, parseAsync, ZodError } from 'zod'
import { Request, Response } from 'express'
import { GovukFrontendErrorMessage, GovukFrontendErrorSummaryErrorListElement } from '@govuk-frontend'
import { ErrorMiddlewareErrors } from '../@types/express'

export const formatDynamicErrorMessages = (
  errors: ErrorMiddlewareErrors,
  searchValue: string,
  replaceValue: string,
): ErrorMiddlewareErrors => {
  const formattedErrors: ErrorMiddlewareErrors = {
    list: new Array<GovukFrontendErrorSummaryErrorListElement>(),
    messages: {},
  }
  if (!errors || !errors.list) return formattedErrors
  errors.list.forEach(error => {
    const formattedError: GovukFrontendErrorSummaryErrorListElement = {}
    formattedError.href = error.href
    formattedError.text = error.text.replace(searchValue, replaceValue || '')
    formattedErrors.list.push(formattedError)
  })
  const fieldErrors: [string, GovukFrontendErrorMessage][] = Object.entries(errors.messages)
  fieldErrors.forEach(([key, error]) => {
    const formattedError: GovukFrontendErrorMessage = {}
    formattedError.text = error.text.replace(searchValue, replaceValue || '')
    formattedErrors.messages[key] = formattedError
  })
  return formattedErrors
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

export const validateRequestBodyAgainstSchema2 = <Schema extends ZodType>(
  schema: Schema,
  req: Request,
  res: Response,
  successFunction: (data: z.infer<typeof schema>) => void,
): Promise<void> => {
  console.log(JSON.stringify(req.body, null, 2))
  return validateRequestBodyAgainstSchema(schema, req, res, successFunction)
}

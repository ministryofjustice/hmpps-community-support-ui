/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express'

import type {
  GovukFrontendErrorMessage,
  GovukFrontendErrorSummaryErrorListElement,
  GovukFrontendSelectItem,
} from '@govuk-frontend'

export default class FormValidation {
  static getSelectItems(
    items: Record<string, string>,
    selectedValue?: string,
    hidePlaceholder?: boolean,
  ): Array<GovukFrontendSelectItem> {
    return [
      ...(!hidePlaceholder ? [{ selected: Boolean(!selectedValue), text: 'Select', value: '' }] : []),
      ...Object.entries(items).map(([value, text]) => ({
        selected: selectedValue ? value.toLowerCase() === selectedValue.toLowerCase() : false,
        text,
        value,
      })),
    ]
  }

  static setFieldErrors(req: Request, res: Response, expectedFields: Array<string> = []): void {
    const list: Array<GovukFrontendErrorSummaryErrorListElement> = []
    const messages: Record<string, GovukFrontendErrorMessage> = {}
    let fields: string[]

    if (expectedFields.length === 0 && req.session.formKeys && Object.keys(req.session.formKeys).length > 0) {
      fields = req.session.formKeys
    } else {
      fields = [...expectedFields]
    }

    fields.forEach(field => {
      const errorMessage = req.flash(`${field}Error`)[0]
      if (errorMessage) {
        list.push({ href: `#${field}`, text: errorMessage })
        messages[field] = { text: errorMessage }
      }
    })

    res.locals.errors = { list, messages }
  }

  static setFormKeys(req: Request, res: Response): void {
    const requestFormBody = req.body || {}

    if (Object.keys(requestFormBody).length !== 0) {
      delete req.session.formKeys
    }

    if (requestFormBody._csrf !== undefined) {
      delete requestFormBody._csrf
    }

    req.session.formKeys = Object.keys(requestFormBody)
  }
}

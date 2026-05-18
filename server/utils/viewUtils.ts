import * as nunjucks from 'nunjucks'
import {
  GovukFrontendSummaryList,
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListRowActionsItem,
  GovukFrontendSummaryListRowValue,
} from '../@types/govukFrontend'

const environment = new nunjucks.Environment()

export const escapeSpecialHtmlCharacters = (str: string): string => environment.getFilter('escape')(str).val

export const newlineToHtmlBreak = (val: unknown): unknown =>
  typeof val !== 'string' ? val : environment.getFilter('nl2br')(val)

export const govFrontendSummaryListRow = (
  key: string,
  value: GovukFrontendSummaryListRowValue | string,
  actions: Array<GovukFrontendSummaryListRowActionsItem> = null,
): GovukFrontendSummaryListRow => {
  if (typeof value === 'string' && (value.includes('<a') || value.includes('<p'))) {
    return {
      key: { text: key },
      value: { html: value },
      actions: actions && actions.length > 0 ? { items: actions } : null,
    }
  }

  return {
    key: { text: key },
    value: typeof value === 'string' ? { text: value } : value,
    actions: actions && actions.length > 0 ? { items: actions } : null,
  }
}

export const govFrontendSummaryList = (
  summaryListItems: GovukFrontendSummaryListRow[],
  options: { showBorders: boolean } = { showBorders: true },
  attributes?: GovukFrontendSummaryList['attributes'],
): GovukFrontendSummaryList => ({
  classes: options.showBorders
    ? 'govuk-summary-list refer-and-monitor__intervention-summary-list'
    : 'govuk-summary-list--no-border refer-and-monitor__intervention-summary-list',
  rows: summaryListItems,
  attributes,
})

export const createMailtoLink = (fullName: string, emailAddress: string): string => {
  if (!fullName) return 'Unknown'
  if (!emailAddress) return fullName

  return `${fullName} (<a href="mailto:${emailAddress}" class="govuk-link">${emailAddress}</a>)`
}

export default class ViewUtils {
  static escape = escapeSpecialHtmlCharacters

  static nl2br = newlineToHtmlBreak

  static summaryListRow = govFrontendSummaryListRow

  static summaryList = govFrontendSummaryList
}

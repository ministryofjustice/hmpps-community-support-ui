import * as nunjucks from 'nunjucks'
import { GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '../@types/govukFrontend'

const environment = new nunjucks.Environment()
export default class ViewUtils {
  static escape(val: string): string {
    const escape = environment.getFilter('escape')
    return escape(val).val
  }

  static nl2br(val: unknown): unknown {
    if (typeof val !== 'string') return val
    const nl2br = environment.getFilter('nl2br')
    return nl2br(val)
  }

  static summaryListArgs(
    summaryListItems: GovukFrontendSummaryListRow[],
    options: { showBorders: boolean } = { showBorders: true },
  ): GovukFrontendSummaryList {
    return {
      classes: options.showBorders ? undefined : 'govuk-summary-list--no-border',
      rows: summaryListItems,
    }
  }
}

import * as nunjucks from 'nunjucks'
import {
  GovukFrontendSummaryList,
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListRowActionsItem,
} from '../@types/govukFrontend'

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

  static summaryListRow(
    key: string,
    value: string,
    actions: Array<GovukFrontendSummaryListRowActionsItem> = null,
  ): GovukFrontendSummaryListRow {
    return {
      key: { text: key },
      value: { text: value },
      actions: actions ? { items: actions } : null,
    }
  }

  static summaryList(
    summaryListItems: GovukFrontendSummaryListRow[],
    options: { showBorders: boolean } = { showBorders: true },
    attributes?: GovukFrontendSummaryList['attributes'],
  ): GovukFrontendSummaryList {
    return {
      classes: options.showBorders
        ? 'govuk-summary-list refer-and-monitor__intervention-summary-list'
        : 'govuk-summary-list--no-border refer-and-monitor__intervention-summary-list',
      rows: summaryListItems,
      attributes,
    }
  }
}

import { Locator } from '@playwright/test'
import SummaryRow from './summaryRow'

export default class SummaryList {
  readonly title: Locator

  static create(summaryLocator: Locator): Promise<SummaryList> {
    const rowLocator = summaryLocator.locator('div.govuk-summary-list__row')
    return rowLocator
      .all()
      .then(rows => rows.map(row => SummaryRow.create(row)))
      .then(rowsPromise => Promise.all(rowsPromise))
      .then(rows => new SummaryList(summaryLocator, rows))
  }

  private constructor(
    readonly summaryLocator: Locator,
    readonly rows: SummaryRow[],
  ) {
    this.title = summaryLocator.locator('h2.govuk-summary-card__title')
  }
}

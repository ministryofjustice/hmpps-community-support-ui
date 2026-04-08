import { Locator } from '@playwright/test'
import TableRow from './tableRow'

export default class Table {
  static create(tableLocator: Locator): Promise<Table> {
    const headerRowsLocator = tableLocator.locator('thead tr')
    const bodyRowsLocator = tableLocator.locator('tbody tr')

    const headerRows = headerRowsLocator
      .count()
      .then(rowCount =>
        Array(rowCount)
          .fill(0)
          .map((_, i) => headerRowsLocator.nth(i))
          .map(row => TableRow.create(row, 'th')),
      )
      .then(rowPromise => Promise.all(rowPromise))

    const bodyRows = bodyRowsLocator
      .count()
      .then(rowCount =>
        Array(rowCount)
          .fill(0)
          .map((_, i) => bodyRowsLocator.nth(i))
          .map(row => TableRow.create(row, 'td')),
      )
      .then(rowPromise => Promise.all(rowPromise))
    // .then(rows => new Table(tableLocator, rows))

    return Promise.all([headerRows, bodyRows]).then(([header, body]) => new Table(tableLocator, header, body))
  }

  private constructor(
    public readonly locator: Locator,
    public readonly header: TableRow[],
    public readonly body: TableRow[],
  ) {}
}

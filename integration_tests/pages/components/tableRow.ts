import { Locator } from '@playwright/test'

export default class TableRow {
  static create(rowLocator: Locator, rowType: 'td' | 'th'): Promise<TableRow> {
    const elementsLocator = rowLocator.locator(rowType)

    return elementsLocator
      .count()
      .then(elementsCount =>
        Array(elementsCount)
          .fill(0)
          .map((_, i) => elementsLocator.nth(i)),
      )
      .then(rowPromise => Promise.all(rowPromise))
      .then(locators => new TableRow(rowLocator, locators))
  }

  private constructor(
    public readonly rowLocator: Locator,
    public readonly elements: Locator[],
  ) {}
}

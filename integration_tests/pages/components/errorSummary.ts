import { Locator } from '@playwright/test'

export default class ErrorSummary {
  static create(locator: Locator): Promise<ErrorSummary> {
    const title = locator.locator('h2.govuk-error-summary__title')
    const list = locator.locator('ul.govuk-error-summary__list')
    const itemLocator = list.locator('li')
    return itemLocator
      .count()
      .then(itemCount =>
        Array(itemCount)
          .fill(0)
          .map((_, i) => itemLocator.nth(i)),
      )
      .then(items => new ErrorSummary(locator, title, list, items))
  }

  private constructor(
    readonly locator: Locator,
    readonly title: Locator,
    readonly list: Locator,
    readonly items: Locator[],
  ) {}
}

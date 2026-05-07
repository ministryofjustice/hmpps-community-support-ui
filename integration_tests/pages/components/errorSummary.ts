import { Locator } from '@playwright/test'

export default class ErrorSummary {
  static async create(locator: Locator): Promise<ErrorSummary> {
    const title = locator.locator('h2.govuk-error-summary__title')
    const list = locator.locator('ul.govuk-error-summary__list')
    const itemLocator = list.getByRole('listitem')
    return new ErrorSummary(locator, title, list, itemLocator)
    // return itemLocator.all().then(items => new ErrorSummary(locator, title, list, items))
  }

  private constructor(
    readonly locator: Locator,
    readonly title: Locator,
    readonly list: Locator,
    readonly items: Locator,
  ) {}
}

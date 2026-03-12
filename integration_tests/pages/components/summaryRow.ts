import { Locator } from '@playwright/test'

const gatherActions = (actionsLocator: Locator): Promise<Locator[]> => {
  const links = actionsLocator.locator('a.govuk-link')
  return links.count().then(count =>
    Array(count)
      .fill(0)
      .map((_, i) => links.nth(i)),
  )
}

export default class SummaryRow {
  readonly key: Locator

  readonly value: Locator

  static create(rowLocator: Locator): Promise<SummaryRow> {
    return gatherActions(rowLocator.locator('dd.govuk-summary-list__actions')).then(
      actions => new SummaryRow(rowLocator, actions),
    )
  }

  constructor(
    readonly rowLocator: Locator,
    readonly actions: Locator[],
  ) {
    this.key = rowLocator.locator('dt.govuk-summary-list__key')
    this.value = rowLocator.locator('dd.govuk-summary-list__value')
  }
}

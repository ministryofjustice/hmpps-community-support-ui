import { Locator } from '@playwright/test'

export default class FieldSet {
  public readonly legend: Locator

  public readonly hint: Locator

  constructor(public readonly locator: Locator) {
    this.legend = locator.locator('legend')
    this.hint = locator.locator('div.govuk-hint')
  }
}

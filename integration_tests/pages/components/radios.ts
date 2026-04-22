import { Locator } from '@playwright/test'
import FieldSet from './fieldset'
import RadioItem from './radioItem'

export default class Radios {
  static create(radiosLocatior: Locator): Promise<Radios> {
    const itemsLocator = radiosLocatior.locator('div.govuk-radios__item')
    return itemsLocator
      .count()
      .then(itemCount =>
        Array(itemCount)
          .fill(0)
          .map((_, i) => new RadioItem(itemsLocator.nth(i))),
      )
      .then(itemPromise => Promise.all(itemPromise))
      .then(items => new Radios(radiosLocatior, items))
  }

  public readonly fieldset: FieldSet

  private constructor(
    readonly locator: Locator,
    readonly items: RadioItem[],
  ) {
    this.fieldset = new FieldSet(locator.page().locator('fieldset', { has: locator }))
  }
}

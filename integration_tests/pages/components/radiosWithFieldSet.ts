import { Locator } from '@playwright/test'
import FieldSet from './fieldset'
import RadioItem from './radioItem'

export default class RadiosWithFieldSet {
  static create(radiosLocatior: Locator, fieldsetLocator: Locator): Promise<RadiosWithFieldSet> {
    const fieldset = new FieldSet(fieldsetLocator)
    const itemsLocator = radiosLocatior.locator('> div.govuk-radios__item')
    return itemsLocator
      .count()
      .then(itemCount =>
        Array(itemCount)
          .fill(0)
          .map((_, i) => new RadioItem(itemsLocator.nth(i))),
      )
      .then(itemPromise => Promise.all(itemPromise))
      .then(items => new RadiosWithFieldSet(radiosLocatior, fieldset, items))
  }

  private constructor(
    readonly locator: Locator,
    readonly fieldset: FieldSet,
    readonly items: RadioItem[],
  ) {}
}

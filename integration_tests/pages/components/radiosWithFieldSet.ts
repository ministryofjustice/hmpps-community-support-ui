import { Locator } from '@playwright/test'
import FieldSet from './fieldset'
import RadioItem from './radioItem'

export default class RadiosWithFieldSet {
  static create(radiosLocatior: Locator, fieldsetLocator: Locator): Promise<RadiosWithFieldSet> {
    const fieldset = new FieldSet(fieldsetLocator)
    const errorText = fieldsetLocator.locator('> p.govuk-error-message')
    const itemsLocator = radiosLocatior.locator('> div.govuk-radios__item')
    return itemsLocator
      .all()
      .then(items => items.map(item => new RadioItem(item)))
      .then(itemPromise => Promise.all(itemPromise))
      .then(items => new RadiosWithFieldSet(radiosLocatior, fieldset, items, errorText))
  }

  private constructor(
    readonly locator: Locator,
    readonly fieldset: FieldSet,
    readonly items: RadioItem[],
    readonly errorText: Locator,
  ) {}
}

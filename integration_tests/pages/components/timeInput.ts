import { Locator } from '@playwright/test'
import FieldSet from './fieldset'
import Input from './input'

export default class TimeInput {
  static create(timeInputLocator: Locator, fieldsetLocator: Locator): Promise<TimeInput> {
    const fieldset = new FieldSet(fieldsetLocator)
    const errorText = fieldsetLocator.locator('> p.govuk-error-message')
    const itemsLocator = timeInputLocator.locator('> .govuk-date-input__item')
    return itemsLocator
      .all()
      .then(items => items.map(item => new Input(item)))
      .then(itemPromise => Promise.all(itemPromise))
      .then(items => new TimeInput(timeInputLocator, fieldset, items, errorText))
  }

  private constructor(
    readonly locator: Locator,
    readonly fieldset: FieldSet,
    readonly items: Input[],
    readonly errorText: Locator,
  ) {}
}

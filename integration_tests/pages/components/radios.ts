import { Locator } from '@playwright/test'
import FieldSet from './fieldset'

export default class Radios {
  static create(radiosLocatior: Locator): Promise<Radios> {
    return Promise.resolve(new Radios(radiosLocatior))
  }

  public readonly fieldset: FieldSet

  private constructor(public readonly locator: Locator) {
    this.fieldset = new FieldSet(locator.page().locator('fieldset', { has: locator }))
  }
}

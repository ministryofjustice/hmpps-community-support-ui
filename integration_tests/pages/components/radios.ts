import { Locator } from '@playwright/test'

export default class Radios {
  static create(radiosLocatior: Locator): Promise<Radios> {
    return Promise.resolve(new Radios(radiosLocatior))
  }

  private constructor(public readonly locator: Locator) {}
}

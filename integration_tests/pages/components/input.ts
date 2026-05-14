import { Locator } from '@playwright/test'

export default class Input {
  readonly input: Locator

  readonly label: Locator

  constructor(readonly locator: Locator) {
    this.input = locator.locator('input')
    this.label = locator.locator('label')
  }
}

import { Locator } from '@playwright/test'

export default class RadioItem {
  readonly input: Locator

  readonly label: Locator

  constructor(readonly locator: Locator) {
    this.input = locator.locator('input')
    this.label = locator.locator('label')
  }
}

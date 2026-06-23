import { Locator } from '@playwright/test'

export default class CheckBoxItem {
  readonly input: Locator

  readonly label: Locator

  constructor(readonly locator: Locator) {
    this.input = locator.locator('input')
    this.label = locator.locator('label')
  }

  async select() {
    await this.input.check()
  }
}

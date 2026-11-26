import { Locator } from '@playwright/test'

export default class RadioItem {
  readonly input: Locator

  readonly label: Locator

  readonly hint: Locator

  constructor(readonly locator: Locator) {
    this.input = locator.locator('input')
    this.label = locator.locator('label')
    this.hint = locator.locator('> .govuk-hint')
  }

  async select() {
    await this.input.check()
  }
}

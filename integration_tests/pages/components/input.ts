import { Locator, Page } from '@playwright/test'

export default class Input {
  readonly input: Locator

  readonly label: Locator

  static createFromTestDataId(page: Page, id: string): Input {
    const locator = page.locator(`[data-testid="${id}"]`).locator('..')
    return new Input(locator)
  }

  constructor(readonly locator: Locator) {
    this.input = locator.locator('input')
    this.label = locator.locator('label')
  }
}

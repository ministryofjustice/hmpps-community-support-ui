import { Locator } from '@playwright/test'

export default class TextArea {
  readonly input: Locator

  readonly label: Locator

  constructor(inputLocator: Locator, labelLocator: Locator) {
    this.input = inputLocator
    this.label = labelLocator
  }
}

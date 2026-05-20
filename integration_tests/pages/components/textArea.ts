import { Locator } from '@playwright/test'

export default class TextArea {
  static create(textAreaLocator: Locator): TextArea {
    const inputLocator: Locator = textAreaLocator.locator('> textarea.govuk-textarea')
    const labelLocator: Locator = textAreaLocator.locator('> h1.govuk-label-wrapper')
    const errorTextLocator: Locator = textAreaLocator.locator('> p.govuk-error-message')
    return new TextArea(inputLocator, labelLocator, errorTextLocator)
  }

  constructor(
    readonly input: Locator,
    readonly label: Locator,
    readonly errorText: Locator,
  ) {}
}

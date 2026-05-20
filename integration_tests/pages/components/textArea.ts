import { Locator } from '@playwright/test'

export default class TextArea {
  public readonly input: Locator

  public readonly label: Locator

  public readonly hint: Locator

  public readonly errorText: Locator

  constructor(textAreaLocator: Locator) {
    this.input = textAreaLocator.locator('> textarea.govuk-textarea')
    this.label = textAreaLocator.locator('> h1.govuk-label-wrapper')
    this.hint = textAreaLocator.locator('> .govuk-hint')
    this.errorText = textAreaLocator.locator('> p.govuk-error-message')
  }
}

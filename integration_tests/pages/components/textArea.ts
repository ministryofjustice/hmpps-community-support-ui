import { Locator } from '@playwright/test'

export default class TextArea {
  static create(textAreaLocator: Locator): Promise<TextArea> {
    const input = textAreaLocator.locator('> textarea.govuk-textarea')
    const label = textAreaLocator.locator('> .govuk-label')
    const hint = textAreaLocator.locator('> .govuk-hint')
    const errorText = textAreaLocator.locator('> p.govuk-error-message')
    return Promise.resolve(new TextArea(input, label, hint, errorText))
  }

  private constructor(
    public readonly input: Locator,
    public readonly label: Locator,
    public readonly hint: Locator,
    public readonly errorText: Locator,
  ) {}
}

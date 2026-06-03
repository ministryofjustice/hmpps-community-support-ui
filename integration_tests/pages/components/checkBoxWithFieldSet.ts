import { Locator } from '@playwright/test'
import FieldSet from './fieldset'
import RadioItem from './radioItem'
import CheckBoxItem from './checkBoxItem'

type CheckBoxRecordEntry = [string, CheckBoxItem]
const createRecordEntry = async (item: CheckBoxItem): Promise<CheckBoxRecordEntry> => {
  const option = await item.label.textContent()
  return option ? [option.trim(), item] : ['', item]
}

const getCheckItemsRecord = async (items: CheckBoxItem[]): Promise<Record<string, CheckBoxItem>> => {
  const entries = await Promise.all(items.map(createRecordEntry))
  return Object.fromEntries(entries)
}

export default class CheckBoxWithFieldSet {
  static async create(radiosLocator: Locator, fieldsetLocator: Locator): Promise<CheckBoxWithFieldSet> {
    const fieldset = new FieldSet(fieldsetLocator)
    const errorText = fieldsetLocator.locator('> p.govuk-error-message')
    const itemsLocator = radiosLocator.locator('> div.govuk-radios__item')
    const itemsLocators = await itemsLocator.all()
    const items = itemsLocators.map(item => new CheckBoxItem(item))
    const itemsRecord = await getCheckItemsRecord(items)
    return new CheckBoxWithFieldSet(radiosLocator, fieldset, items, itemsRecord, errorText)
  }

  private constructor(
    readonly locator: Locator,
    readonly fieldset: FieldSet,
    readonly items: CheckBoxItem[],
    private readonly itemsRecord: Record<string, CheckBoxItem>,
    readonly errorText: Locator,
  ) {}

  async select(label: string) {
    await this.itemsRecord[label]?.select()
  }

  getItem(label: string): RadioItem | undefined {
    return this.itemsRecord[label]
  }
}

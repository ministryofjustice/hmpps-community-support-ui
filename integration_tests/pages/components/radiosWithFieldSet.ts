import { Locator } from '@playwright/test'
import FieldSet from './fieldset'
import RadioItem from './radioItem'

type RadioRecordEntry = [string, RadioItem]
const createRecordEntry = async (radioItem: RadioItem): Promise<RadioRecordEntry> => {
  const option = await radioItem.label.textContent()
  return option ? [option.trim(), radioItem] : ['', radioItem]
}

const getRadioItemsRecord = async (items: RadioItem[]): Promise<Record<string, RadioItem>> => {
  const entries = await Promise.all(items.map(createRecordEntry))
  return Object.fromEntries(entries)
}

export default class RadiosWithFieldSet {
  static async create(radiosLocator: Locator, fieldsetLocator: Locator): Promise<RadiosWithFieldSet> {
    const fieldset = new FieldSet(fieldsetLocator)
    const errorText = fieldsetLocator.locator('> p.govuk-error-message')
    const itemsLocator = radiosLocator.locator('> div.govuk-radios__item')
    const itemsLocators = await itemsLocator.all()
    const items = itemsLocators.map(item => new RadioItem(item))
    const itemsRecord = await getRadioItemsRecord(items)
    return new RadiosWithFieldSet(radiosLocator, fieldset, items, itemsRecord, errorText)
  }

  private constructor(
    readonly locator: Locator,
    readonly fieldset: FieldSet,
    readonly items: RadioItem[],
    private readonly itemsRecord: Record<string, RadioItem>,
    readonly errorText: Locator,
  ) {}

  async select(label: string) {
    await this.itemsRecord[label]?.select()
  }

  getItem(label: string): RadioItem | undefined {
    return this.itemsRecord[label]
  }
}

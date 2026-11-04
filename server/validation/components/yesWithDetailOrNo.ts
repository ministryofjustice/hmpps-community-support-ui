import z, { ZodSafeParseResult } from 'zod'
import { Selection } from '@community-support-api'
import validString from '../ValidString'

export interface Fields<RadioKey extends string, DetailsKey extends string> {
  radioFieldName: RadioKey
  detailsFieldName: DetailsKey
}

export interface Messages {
  tooManyCharacters: string
  nothingSelected: string
  noValueGiven: string
}

const toSelection = (radio: string, value: string): Selection => {
  switch (radio) {
    case 'No':
    case 'no':
    case 'false':
      return { selected: 'No' }
    case 'Yes':
    case 'yes':
    case 'true':
      return { selected: 'Yes', value }
    default:
      return { selected: 'Unanswered' }
  }
}

export interface YesWithDetailOrNoSchemaConfig<RadioKey extends string, DetailsKey extends string> {
  fields: Fields<RadioKey, DetailsKey>
  messages: Messages
}

export const validateYesWithDetailsOrNo = <RadioKey extends string, DetailsKey extends string>(
  config: YesWithDetailOrNoSchemaConfig<RadioKey, DetailsKey>,
) => {
  const { fields, messages } = config
  const { radioFieldName, detailsFieldName } = fields
  const { tooManyCharacters, nothingSelected, noValueGiven } = messages
  type BaseType = { [radioFieldName]: string; [detailsFieldName]: string }
  return <T extends BaseType>(
    obj: T,
  ): ZodSafeParseResult<Omit<T, RadioKey | DetailsKey> & Record<DetailsKey, Selection>> => {
    const rawSchema = z.looseObject({
      [detailsFieldName]: validString(tooManyCharacters),
      [radioFieldName]: z.enum(['Yes', 'No'], { error: nothingSelected }),
    })
    type Raw = Record<DetailsKey, string> & Record<RadioKey, 'Yes' | 'No'> & Record<string, unknown>
    type OutputType = Omit<T, RadioKey | DetailsKey> & Record<DetailsKey, Selection>
    const transform = (data: Raw): OutputType => {
      const selection = toSelection(data[radioFieldName] as 'Yes' | 'No', data[detailsFieldName] as string)
      const remaining = Object.fromEntries(
        Object.entries(data)
          .filter(([key]) => key !== radioFieldName)
          .filter(([key]) => key !== detailsFieldName),
      )
      return { ...remaining, [detailsFieldName]: selection } as OutputType
    }
    const predicate = (data: Raw) => {
      const selection: 'Yes' | 'No' = data[radioFieldName]
      const value: string = data[detailsFieldName]
      return selection === 'No' || (selection === 'Yes' && value !== '')
    }
    const schema = rawSchema.refine(predicate, {
      error: noValueGiven,
      path: [detailsFieldName],
    })
    const result = schema.safeParse(obj) as ZodSafeParseResult<Raw>
    if (!result.success) {
      return result as ZodSafeParseResult<OutputType>
    }
    return { success: true, data: transform(result.data) }
  }
}

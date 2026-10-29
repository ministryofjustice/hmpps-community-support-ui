import { format, isValid, parse } from 'date-fns'

const dateFormat = (date: Date): string => format(date, 'd MMMM uuuu')
export default dateFormat

export const britishDateFormat = (date: Date): string => format(date, 'dd/MM/yyyy')

export const toIsoDate = (dateValue?: string | null): string | undefined => {
  if (!dateValue) return undefined

  const trimmedValue = dateValue.trim()
  if (!trimmedValue) return undefined

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue
  }

  const parsedDate = parse(trimmedValue, 'd/M/yyyy', new Date())
  if (isValid(parsedDate)) {
    return format(parsedDate, 'yyyy-MM-dd')
  }

  return undefined
}

export const isoToFormattedDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export const formatIsoDateOrNull = (dateValue: string | null | undefined): string | null => {
  if (!dateValue) return null

  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

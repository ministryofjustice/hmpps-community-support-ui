import { format } from 'date-fns'

const dateFormat = (date: Date): string => format(date, 'd MMMM uuuu')
export default dateFormat

export const britishDateFormat = (date: Date): string => format(date, 'dd/MM/yyyy')

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

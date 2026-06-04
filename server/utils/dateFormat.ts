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

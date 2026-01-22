import { format } from 'date-fns'

const dateFormat = (date: Date): string => format(date, 'd MMMM uuuu')
export default dateFormat

interface Time {
  hour: number
  minute: number
  amPm: string
}

export const formatTime12Hr = (hour: number, minute: number | string | undefined, amPm: string): string => {
  const minuteValue = minute !== undefined ? String(minute).padStart(2, '0') : '00'
  return `${hour}:${minuteValue}${amPm.toLowerCase()}`
}

const timeFormat = ({ hour, minute, amPm }: Time) => {
  const correctedHour = hour > 12 ? hour - 12 : hour
  const correctedMinute = minute < 10 ? `0${minute}` : `${minute}`
  return `${correctedHour}:${correctedMinute}${amPm}`
}
export default timeFormat

export const isoToFormattedTime = (iso: string): string =>
  timeFormat({
    hour: new Date(iso).getHours() % 12 || 12,
    minute: new Date(iso).getMinutes(),
    amPm: new Date(iso).getHours() >= 12 ? 'pm' : 'am',
  })

export const parseTime12Hr = (input?: string): { hour: number; minute: number; amPm: 'am' | 'pm' } => {
  const fallback = { hour: 0, minute: 0, amPm: 'am' as const }
  if (!input) {
    return fallback
  }

  const match = input
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/)
  if (!match) {
    return fallback
  }

  let hour = Number(match[1])
  const minute = match[2] ? Number(match[2]) : 0
  let amPm = (match[3] || '').toLowerCase() as 'am' | 'pm' | ''

  if (!amPm) {
    amPm = hour >= 12 ? 'pm' : 'am'
    if (hour > 12) {
      hour -= 12
    }
  }

  if (hour === 0) {
    hour = 12
  }
  if (hour > 12) {
    hour -= 12
  }

  return { hour, minute, amPm: amPm || 'am' }
}

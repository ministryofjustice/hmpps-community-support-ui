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

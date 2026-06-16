interface Time {
  hour: number
  minute: number
  amPm: string
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

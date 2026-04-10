interface Time {
  hour: number
  minute?: number
  amPm: string
}

const timeFormat = ({ hour, minute, amPm }: Time) => `${hour}:${minute || '00'}${amPm}`
export default timeFormat

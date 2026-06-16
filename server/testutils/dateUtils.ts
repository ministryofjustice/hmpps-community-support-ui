export const daysAfter = (base: Date, days: number, hour = 10): string => {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const daysBefore = (base: Date, days: number, hour = 10): string => {
  return daysAfter(base, -days, hour)
}

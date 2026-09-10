/**
 * Centralized presenter formatting utilities
 * Consolidates common formatting patterns used across multiple presenters
 */

/**
 * Formats a person's full name from separate components
 * @param firstName - First name (required)
 * @param lastName - Last name (required)
 * @param middleNames - Middle names (optional)
 * @returns Formatted full name with components joined by spaces and trimmed
 */
export const formatFullName = (firstName: string, lastName: string, middleNames?: string | null): string => {
  return [firstName, middleNames, lastName].filter(Boolean).join(' ').trim()
}

/**
 * Returns a trimmed string or a default value if the input is empty/null/undefined
 * @param value - The string value to check and trim
 * @param defaultValue - The default value to return if input is falsy or empty
 * @returns Trimmed string or default value
 */
export const trimOrDefault = (value: string | null | undefined, defaultValue: string): string => {
  return (value ?? '').trim() || defaultValue
}

/**
 * Formats time in the existing presenter-friendly 12-hour style (e.g. 1:00pm).
 * Keeps behaviour consistent by lowercasing AM/PM without trimming.
 */
export const formatTime12Hr = (hour: number, minute: number | string | undefined, amPm: string): string => {
  const minuteValue = minute !== undefined ? String(minute).padStart(2, '0') : '00'
  return `${hour}:${minuteValue}${amPm.toLowerCase()}`
}

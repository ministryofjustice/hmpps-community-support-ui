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
const formatFullName = (firstName: string, lastName: string, middleNames?: string | null): string => {
  return [firstName, middleNames, lastName].filter(Boolean).join(' ').trim()
}

export default formatFullName

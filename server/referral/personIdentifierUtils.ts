import { Person } from '@community-support-api'

export type IdentifierRow = {
  label: 'CRN' | 'Prison number'
  value: string
}

const CRN_REGEX = /^[A-Za-z]\d{6}$/

const PRISON_NUMBER_REGEX = /^[A-Z]\d{4}[A-Z]{2}$/

const formatPrisonNumbers = (person: Person): string => {
  const prisonNumbers = (person.prisonNumbers || [])
    .map(prisonNumber => prisonNumber?.trim().toUpperCase())
    .filter(Boolean)

  return Array.from(new Set(prisonNumbers)).join(', ')
}

export const resolveIdentifierRow = (person: Person): IdentifierRow | null => {
  const personIdentifier = person.personIdentifier?.trim().toUpperCase()
  const prisonNumbers = formatPrisonNumbers(person)

  if (!personIdentifier) {
    return prisonNumbers ? { label: 'Prison number', value: prisonNumbers } : null
  }

  if (CRN_REGEX.test(personIdentifier)) {
    return { label: 'CRN', value: personIdentifier }
  }

  if (PRISON_NUMBER_REGEX.test(personIdentifier)) {
    return { label: 'Prison number', value: prisonNumbers || personIdentifier }
  }

  return null
}

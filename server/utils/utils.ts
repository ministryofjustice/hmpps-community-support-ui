import {
  GovukFrontendErrorMessage,
  GovukFrontendHint,
  GovukFrontendInput,
  GovukFrontendLabel,
  GovukFrontendSelect,
  GovukFrontendTextarea,
} from '@govuk-frontend'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export const escapeHtml = (str?: string): string | null => {
  if (!str) return null
  return str
    .replace(/&/g, '&amp;') // Escape ampersand
    .replace(/</g, '&lt;') // Escape less than
    .replace(/>/g, '&gt;') // Escape greater than
    .replace(/"/g, '&quot;') // Escape double quote
    .replace(/'/g, '&apos;') // Escape single quote
}

export const buildLabel = (name: string, { html, text }: GovukFrontendLabel) => {
  if (html) {
    return html
  }
  if (text) {
    return `<label class="govuk-label" for="${name}">
      ${text}
    </label>`
  }
  return ''
}

export const buildHint = ({ html, text }: GovukFrontendHint) => {
  if (html) {
    return html
  }
  if (text) {
    return `<div class="govuk-hint">
    ${text}
  </div>`
  }
  return ''
}

export const buildInputErrors = (name: string, { text, html }: GovukFrontendErrorMessage): string => {
  if (html) {
    return html
  }
  if (text) {
    return `<p id="${name}-error" class="govuk-error-message">
    <span class="govuk-visually-hidden">Error:</span> ${text}
  </p>`
  }
  return ''
}

export const buildInput = ({ name, label, value, hint, errorMessage }: GovukFrontendInput) => {
  return `<div class="govuk-form-group">
    <h1 class="govuk-label-wrapper">
    ${buildLabel(name, label)}
  </h1>
  ${hint ? buildHint(hint) : ''}
  ${errorMessage ? buildInputErrors(name, errorMessage) : ''}
  <input class="govuk-input" id="${name}" name="${name}" type="text" value="${value || ''}">
    </div>`
}

export const buildTextarea = ({ name, label, value, hint, errorMessage }: GovukFrontendTextarea) => {
  return `<div class="govuk-form-group">
    <h1 class="govuk-label-wrapper">
      ${buildLabel(name, label)}
    </h1>
    ${hint ? buildHint(hint) : ''}
    ${errorMessage ? buildInputErrors(name, errorMessage) : ''}
    <textarea class="govuk-textarea" id="${name}" name="${name}" type="text" rows="5" spellcheck="false" >${escapeHtml(value) || ''}</textarea>
  </div>`
}

export const buildSelect = ({ name, label, hint, errorMessage, items }: GovukFrontendSelect): string => {
  return `<div class="govuk-form-group ${errorMessage ? 'govuk-form-group--error' : ''}">
    ${label ? buildLabel(name, label) : ''}
  ${hint ? buildHint(hint) : ''}
  ${errorMessage ? buildInputErrors(name, errorMessage) : ''}
  <select class="govuk-select ${errorMessage ? 'govuk-select--error' : ''}" id="${name}" name="${name}" aria-describedby="${name}-hint ${errorMessage ? `${name}--error` : ''}">
${items.map(({ value, text, selected }) => `<option value="${value}" ${selected ? 'selected' : ''}>${text}</option>`).join('\n')}
  </select>
</div>`
}

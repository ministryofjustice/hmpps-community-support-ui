import { Request } from 'express'
import { ReferralInformation } from '@community-support-api'
import { format } from 'date-fns'
import { validateDate, DateValidationOptions, validateTime, TimeValidationOptions } from '../utils/validateDateTime'

export interface ScheduleFormData {
  sessionDate?: string
  'sessionTime-hour'?: string
  'sessionTime-minute'?: string
  'sessionTime-meridiem'?: string
  sessionTakePlace?: string
  ByPhone?: string
  ByVideo?: string
  InSomewhereElse?: string
  probationOffice?: string
  prison?: string
  addressLine1?: string
  addressLine2?: string
  addressTown?: string
  addressCounty?: string
  addressPostcode?: string
  informedMethod?: string[]
  otherMethodOfContact?: string
}

const DEFAULT_VALIDATE_DATE_OPTIONS: DateValidationOptions = {
  dateFormat: 'd/M/yyyy',
  minDate: new Date(),
  maxMonthsFuture: 6,
  messages: {
    blank: 'Enter the date of the session',
    invalidFormat: 'Enter a date in the correct format, like 10/7/2025',
    tooEarly: 'The session date must be after the referral date, ',
    tooFarFuture: 'The session date must be before ',
  },
}

const DEFAULT_VALIDATE_TIME_OPTIONS: TimeValidationOptions = {
  messages: {
    blank: 'Enter the start time of the session',
    hourBlank: 'Session start time must include an hour and minute',
    minuteBlank: 'Session start time must include an hour and minute',
    meridiemBlank: 'Select whether the session start time is AM or PM',
    invalidFormat: 'Enter a session start time in the correct format',
  },
}

class AppointmentValidator {
  isIdentifierACrn(id: string): boolean {
    if (!id) return false
    const cleaned = id.trim().toUpperCase()
    return cleaned.length === 7 && /^[A-Z]\d{6}$/.test(cleaned)
  }

  isIdentifierAPrisonNumber(id: string): boolean {
    if (!id) return false
    const cleaned = id.trim().toUpperCase()
    return cleaned.length === 7 && /^[A-Z]\d{4}[A-Z]{2}$/.test(cleaned)
  }

  isPersonInCommunity(personIdentifier: string): boolean {
    return this.isIdentifierACrn(personIdentifier)
  }

  isPersonInPrison(personIdentifier: string): boolean {
    return this.isIdentifierAPrisonNumber(personIdentifier)
  }

  getReasonKey(sessionTakePlace: string): string | null {
    switch (sessionTakePlace) {
      case 'ByPhone':
        return 'ByPhone'
      case 'ByVideo':
        return 'ByVideo'
      case 'InSomewhereElse':
        return 'InSomewhereElse'
      default:
        return null
    }
  }

  validateAddressFields(
    addressLine1: string,
    addressLine2: string,
    addressTown: string,
    addressCounty: string,
    addressPostcode: string,
  ): Record<string, { text: string }> {
    const isValidAddressChar = (str: string): boolean => {
      return /^[a-zA-Z0-9\s\-']*$/.test(str)
    }
    const MAX_ADDRESS_LENGTH = 100

    const errors: Record<string, { text: string }> = {}
    if (!addressLine1) {
      errors.addressLine1 = { text: 'Enter an address line 1' }
    } else if (addressLine1.length > MAX_ADDRESS_LENGTH) {
      errors.addressLine1 = { text: `Address line 1 must be ${MAX_ADDRESS_LENGTH} characters or less` }
    } else if (!isValidAddressChar(addressLine1)) {
      errors.addressLine1 = {
        text: 'Address line 1 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      }
    }
    if (addressLine2 && addressLine2.length > MAX_ADDRESS_LENGTH) {
      errors.addressLine2 = { text: `Address line 2 must be ${MAX_ADDRESS_LENGTH} characters or less` }
    } else if (!isValidAddressChar(addressLine2)) {
      errors.addressLine2 = {
        text: 'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      }
    }
    if (!addressTown) {
      errors.addressTown = { text: 'Enter a town or city' }
    } else if (addressTown.length > MAX_ADDRESS_LENGTH) {
      errors.addressTown = { text: `Town or city must be ${MAX_ADDRESS_LENGTH} characters or less` }
    } else if (!isValidAddressChar(addressTown)) {
      errors.addressTown = {
        text: 'Town or city must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      }
    }
    if (addressCounty && addressCounty.length > MAX_ADDRESS_LENGTH) {
      errors.addressCounty = { text: `County must be ${MAX_ADDRESS_LENGTH} characters or less` }
    } else if (!isValidAddressChar(addressCounty)) {
      errors.addressCounty = {
        text: 'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      }
    }
    if (!addressPostcode) {
      errors.addressPostcode = { text: 'Enter a postcode' }
    } else if (addressPostcode.length > MAX_ADDRESS_LENGTH) {
      errors.addressPostcode = { text: `Postcode must be ${MAX_ADDRESS_LENGTH} characters or less` }
    } else if (!/^[a-zA-Z0-9\s]*$/.test(addressPostcode)) {
      errors.addressPostcode = {
        text: 'Postcode must only include letters a to z, numbers 0 to 9 or spaces',
      }
    }
    return errors
  }

  validateAppointment(
    req: Request,
    referralDetails: ReferralInformation,
  ): {
    formData: ScheduleFormData
    errors: Record<string, { text: string }>
  } {
    const MAX_OTHER_METHOD_OF_CONTACT_LENGTH = 50

    let errors: Record<string, { text: string }> = {}
    const formData: ScheduleFormData = {}

    const getValue = (field: string) => req.body[field]?.trim() ?? ''
    const getValues = (field: string): string[] => {
      const val = req.body[field]
      if (Array.isArray(val)) {
        return val.map(v => String(v).trim()).filter(Boolean)
      }
      const single = String(val ?? '').trim()
      return single ? [single] : []
    }
    const isPersonInCommunity = this.isPersonInCommunity(referralDetails.crn)

    if (req && req.body) {
      formData.sessionDate = getValue('sessionDate')
      const dateValidationResult = validateDate(formData.sessionDate, DEFAULT_VALIDATE_DATE_OPTIONS)
      if (!dateValidationResult.isValid) {
        errors.sessionDate = { text: dateValidationResult.error }
      } else {
        formData.sessionDate = format(dateValidationResult.parsedDate, 'd/M/yyyy') || undefined
      }

      formData['sessionTime-hour'] = getValue('sessionTime-hour')
      formData['sessionTime-minute'] = getValue('sessionTime-minute')
      formData['sessionTime-meridiem'] = getValue('sessionTime-meridiem')?.toLowerCase()
      const timeValidationResult = validateTime(
        formData['sessionTime-hour'],
        formData['sessionTime-minute'],
        formData['sessionTime-meridiem'],
        DEFAULT_VALIDATE_TIME_OPTIONS,
      )
      if (!timeValidationResult.isValid) {
        errors.sessionTime = { text: timeValidationResult.error }
      }

      formData.sessionTakePlace = getValue('sessionTakePlace')
      if (!formData.sessionTakePlace || formData.sessionTakePlace.trim() === '') {
        errors.sessionTakePlace = { text: 'Select how the session will take place' }
      }
      if (['ByPhone', 'ByVideo'].includes(formData.sessionTakePlace)) {
        const MAX_REASON_LENGTH = 100
        const reasonKey = this.getReasonKey(formData.sessionTakePlace)
        const reason = getValue(reasonKey)
        switch (reasonKey) {
          case 'ByPhone':
            formData.ByPhone = reason
            break
          case 'ByVideo':
            formData.ByVideo = reason
            break
          case 'InSomewhereElse':
            formData.InSomewhereElse = reason
            break
          default:
            break
        }
        if (!reason || reason.trim() === '') {
          errors[reasonKey] = { text: 'Enter why the session is not in person' }
        } else if (reason.length > MAX_REASON_LENGTH) {
          errors[reasonKey] = {
            text: `Why is this session not in person must be ${MAX_REASON_LENGTH} characters or less`,
          }
        }
      }
      if (isPersonInCommunity) {
        if (formData.sessionTakePlace === 'InProbationOffice') {
          formData.probationOffice = getValue('probationOfficeList')
          if (!formData.probationOffice || formData.probationOffice.trim() === '') {
            errors.probationOfficeList = { text: 'Select probation office' }
          }
        }
        if (formData.sessionTakePlace === 'InSomewhereElse') {
          formData.addressLine1 = getValue('addressLine1')
          formData.addressLine2 = getValue('addressLine2')
          formData.addressTown = getValue('addressTown')
          formData.addressCounty = getValue('addressCounty')
          formData.addressPostcode = getValue('addressPostcode')
          const addressErrors = this.validateAddressFields(
            formData.addressLine1,
            formData.addressLine2,
            formData.addressTown,
            formData.addressCounty,
            formData.addressPostcode,
          )
          const mergedErrors = { ...addressErrors, ...errors } as Record<string, { text: string }>
          errors = mergedErrors
        }
        formData.informedMethod = getValues('informedMethod')
        if (!formData.informedMethod || formData.informedMethod.length === 0) {
          errors.informedMethod = {
            text: `Select how ${referralDetails.firstName} was informed about the session`,
          }
        } else if (formData.informedMethod.includes('informedByOtherMethod')) {
          formData.otherMethodOfContact = getValue('otherMethodOfContact')
          if (!formData.otherMethodOfContact || formData.otherMethodOfContact.trim() === '') {
            errors.otherMethodOfContact = { text: 'Enter the other method of contact' }
          } else if (formData.otherMethodOfContact.length > MAX_OTHER_METHOD_OF_CONTACT_LENGTH) {
            errors.otherMethodOfContact = {
              text: `Other method of contact must be ${MAX_OTHER_METHOD_OF_CONTACT_LENGTH} characters or less`,
            }
          } else if (!/^[a-zA-Z0-9\s,\-']*$/.test(formData.otherMethodOfContact)) {
            errors.otherMethodOfContact = {
              text: 'Other method of contact must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
            }
          }
        }
      } else if (formData.sessionTakePlace === 'InPrison') {
        formData.prison = getValue('prisonList')
        if (!formData.prison || formData.prison.trim() === '') {
          errors.prisonList = { text: 'Select prison' }
        }
      }
    }
    return {
      formData,
      errors,
    }
  }
}

export default AppointmentValidator

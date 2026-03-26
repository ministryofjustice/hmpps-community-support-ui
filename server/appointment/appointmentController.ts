import { Request, Response } from 'express'
import { ReferralInformation, CreateAppointmentRequest } from '@community-support-api'
import ConfirmIcsPresenter from './confirm-ics/confirmIcsPresenter'
import InitialContactSessionDetailsPresenter from '../referral/InitialContactSessionDetailsPresenter'
import AppointmentService from '../services/AppointmentService'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import ReferenceDataService from '../services/referenceDataService'
import { validateDate, DateValidationOptions, validateTime, TimeValidationOptions } from '../utils/validateDateTime'

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

class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  async checkIcs(req: Request, res: Response): Promise<void> {
    const { referralId } = req.params as { referralId: string }
    const createAppointmentRequest = req.session?.createAppointmentRequest
    if (!createAppointmentRequest) {
      return res.redirect(`/referral/${referralId}/appointment/schedule-ics`)
    }

    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, referralId)
    return presenter.renderPage(res)
  }

  async scheduleIcs(req: Request, res: Response): Promise<void> {
    const { referralId } = req.params as { referralId: string }
    const referralInformation = req.session?.referralInformation
    const createAppointmentRequest = req.session?.createAppointmentRequest
    const probationOffices = await this.referenceDataService.getProbationOffices()
    const prisons = await this.referenceDataService.getPrisons()
    if (req.method === 'POST') {
      const validationErrors = this.validateAppointment(req, referralInformation)
      if (Object.keys(validationErrors).length > 0) {
        const presenter = new ScheduleIcsPresenter(
          referralId,
          probationOffices,
          prisons,
          referralInformation,
          createAppointmentRequest,
          validationErrors,
        )
        return presenter.renderPage(res)
      }
      if (Object.keys(validationErrors).length > 0) {
        this.saveFormToSession(req, createAppointmentRequest)
        const presenter = new ScheduleIcsPresenter(
          referralId,
          probationOffices,
          prisons,
          referralInformation,
          createAppointmentRequest,
        )
        return presenter.renderPage(res)
      }
      return res.redirect(`/referral/${referralId}/appointment/check-ics`)
    }
    const presenter = new ScheduleIcsPresenter(
      referralId,
      probationOffices,
      prisons,
      referralInformation,
      createAppointmentRequest,
    )
    this.loadFormToSession(req, createAppointmentRequest)
    return presenter.renderPage(res)
  }

  saveFormToSession(req: Request, createAppointmentRequest: CreateAppointmentRequest) {
    if (req && createAppointmentRequest) {
      // tbd: save form to session
    }
  }

  loadFormToSession(req: Request, createAppointmentRequest: CreateAppointmentRequest) {
    if (req && createAppointmentRequest) {
      // tbd: load form to session
    }
  }

  isIdentifierACrn(id: string): boolean {
    const cleaned = id.trim().toUpperCase()

    if (cleaned.length === 7 && /^[A-Z]\d{6}$/.test(cleaned)) {
      return true
    }
    return false
  }

  isIdentifierAPrisonNumber(id: string): boolean {
    const cleaned = id.trim().toUpperCase()

    if (cleaned.length === 7 && /^[A-Z]\d{4}[A-Z]{2}$/.test(cleaned)) {
      return true
    }
    return false
  }

  isPersonInCommunity(personIdentifier: string): boolean {
    return this.isIdentifierACrn(personIdentifier)
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

  validateAppointment(req: Request, referralInformation: ReferralInformation): Record<string, { text: string }> {
    const MAX_OTHER_METHOD_OF_CONTACT_LENGTH = 50

    let errors: Record<string, { text: string }> = {}

    const getValue = (field: string) => req.body[field]?.trim() ?? ''
    const getValues = (field: string): string[] => {
      const val = req.body[field]
      if (Array.isArray(val)) {
        return val.map(v => String(v).trim()).filter(Boolean)
      }
      const single = String(val ?? '').trim()
      return single ? [single] : []
    }
    const isPersonInCommunity = this.isPersonInCommunity(referralInformation.crn)

    if (req && req.body) {
      const sessionDate = getValue('sessionDate')
      const dateValidationResult = validateDate(sessionDate, DEFAULT_VALIDATE_DATE_OPTIONS)
      if (!dateValidationResult.isValid) {
        errors.sessionDate = { text: dateValidationResult.error }
      }
      const sessionTimeHour = getValue('sessionTime-hour')
      const sessionTimeMinute = getValue('sessionTime-minute')
      const sessionTimeMeridiem = getValue('sessionTime-meridiem')
      const timeValidationResult = validateTime(
        sessionTimeHour,
        sessionTimeMinute,
        sessionTimeMeridiem,
        DEFAULT_VALIDATE_TIME_OPTIONS,
      )
      if (!timeValidationResult.isValid) {
        errors.sessionTime = { text: timeValidationResult.error }
      }
      const sessionTakePlace = getValue('sessionTakePlace')
      if (!sessionTakePlace || sessionTakePlace.trim() === '') {
        errors.sessionTakePlace = { text: 'Select how the session will take place' }
      }
      if (['ByPhone', 'ByVideo'].includes(sessionTakePlace)) {
        const byReason = getValue(sessionTakePlace)
        if (!byReason || byReason.trim() === '') {
          errors[sessionTakePlace] = { text: 'Enter why the session is not in-person' }
        }
      }
      if (isPersonInCommunity) {
        if (sessionTakePlace === 'InProbationOffice') {
          const probationOffice = getValue('probationOfficeList')
          if (!probationOffice || probationOffice.trim() === '') {
            errors.probationOfficeList = { text: 'Select a probation office' }
          }
        }
        if (sessionTakePlace === 'InSomewhereElse') {
          const addressErrors = this.validateAddressFields(
            getValue('addressLine1'),
            getValue('addressLine2'),
            getValue('addressTown'),
            getValue('addressCounty'),
            getValue('addressPostcode'),
          )
          const mergedErrors = { ...addressErrors, ...errors } as Record<string, { text: string }>
          errors = mergedErrors
        }
        const informedMethods = getValues('informedMethod')
        if (!informedMethods || informedMethods.length === 0) {
          errors.informedMethod = { text: `Select how ${referralInformation.firstName} was informed about the session` }
        } else if (informedMethods.includes('informedByOtherMethod')) {
          const otherMethodOfContact = getValue('otherMethodOfContact')
          if (!otherMethodOfContact || otherMethodOfContact.trim() === '') {
            errors.otherMethodOfContact = { text: 'Enter the other method of contact' }
          } else if (otherMethodOfContact.length > MAX_OTHER_METHOD_OF_CONTACT_LENGTH) {
            errors.otherMethodOfContact = {
              text: `Other method of contact must be ${MAX_OTHER_METHOD_OF_CONTACT_LENGTH} characters or less`,
            }
          } else if (!/^[a-zA-Z0-9\s,\-']*$/.test(otherMethodOfContact)) {
            errors.otherMethodOfContact = {
              text: 'Other method of contact must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
            }
          }
        }
      } else if (sessionTakePlace === 'InPrison') {
        const prison = getValue('prisonList')
        if (!prison || prison.trim() === '') {
          errors.prisonList = { text: 'Select a prison establishment' }
        }
      }
    }
    return errors
  }

  changeIcs(req: Request, res: Response): Promise<void> {
    const { referralId, icsId } = req.params
    const { username } = res.locals.user
    return this.appointmentService
      .getICS(referralId.toString(), icsId.toString(), username)
      .then(data => new InitialContactSessionDetailsPresenter(data))
      .then(presenter => presenter.renderPage(res))
  }
}

export default AppointmentController

import { Request, Response } from 'express'
import { CreateAppointmentRequest, SessionMethodRequest, ReferralInformation } from '@community-support-api'
import { format, parse } from 'date-fns'
import z, { ZodError } from 'zod'
import ConfirmIcsPresenter, { type AdditionalInformation } from './confirm-ics/confirmIcsPresenter'
import InitialContactSessionDetailsPresenter from '../referral/InitialContactSessionDetailsPresenter'
import ReferralService from '../services/referralService'
import AppointmentService from '../services/AppointmentService'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import ReferenceDataService from '../services/referenceDataService'
import { validateDate, DateValidationOptions, validateTime, TimeValidationOptions } from '../utils/validateDateTime'
import RecordSessionAttendancePresenter from './record-ics/RecordSessionAttendancePresenter'
import IcsFeedbackCheckYourAnswersPresenter from './check-ics-feedback/icsFeedbackCheckYourAnswersPresenter'
import { RecordSessionAttendanceFormDataSchema } from '../validation/RecordSessionAttendanceFormData'

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

interface ScheduleFormData {
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

class AppointmentController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  async checkIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }
    const createAppointmentRequest = req.session?.createAppointmentRequest
    if (!createAppointmentRequest) {
      return res.redirect(`/referral/${referralId}/appointment/schedule-ics`)
    }
    const referralInformation = await this.referralService.getReferralInformation(referralId, username)
    const additionalDetails: AdditionalInformation = { firstName: referralInformation.firstName }
    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, referralId, additionalDetails)
    return presenter.renderPage(res)
  }

  async scheduleIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }
    let createAppointmentRequest = req.session?.createAppointmentRequest
    const probationOffices = await this.referenceDataService.getProbationOffices()
    const prisons = await this.referenceDataService.getPrisons()

    const referralInformation = await this.referralService.getReferralInformation(referralId, username)

    if (req.method === 'POST') {
      const validationResults = this.validateAppointment(req, referralInformation)

      createAppointmentRequest = this.saveFormToSession(validationResults.formData)
      if (Object.keys(validationResults.errors).length > 0) {
        const presenter = new ScheduleIcsPresenter(
          referralId,
          probationOffices,
          prisons,
          referralInformation,
          validationResults.formData,
          validationResults.errors,
        )
        return presenter.renderPage(res)
      }

      req.session.createAppointmentRequest = createAppointmentRequest

      return res.redirect(`/referral/${referralId}/appointment/confirm-ics`)
    }
    const formData = this.loadFormFromSession(createAppointmentRequest)
    const presenter = new ScheduleIcsPresenter(referralId, probationOffices, prisons, referralInformation, formData)

    return presenter.renderPage(res)
  }

  private saveFormToSession(formData: ScheduleFormData): CreateAppointmentRequest {
    let createAppointmentRequest = {} as CreateAppointmentRequest

    if (!formData) return createAppointmentRequest

    if (!createAppointmentRequest) {
      createAppointmentRequest = {
        date: '',
        time: { hour: 0, amPm: 'AM' },
        sessionMethodRequest: { type: 'PHONE' },
        sessionCommunication: [],
      }
    }

    if (formData.sessionDate) {
      try {
        createAppointmentRequest.date = format(parse(formData.sessionDate, 'd/M/yyyy', new Date()), 'yyyy-MM-dd')
      } catch {
        createAppointmentRequest.date = ''
      }
    }
    const hour = formData['sessionTime-hour']
    const minute = formData['sessionTime-minute']
    const amPm = formData['sessionTime-meridiem']

    if (hour !== undefined && amPm) {
      createAppointmentRequest.time = {
        hour: Number(hour),
        minute: minute !== undefined && minute !== '' ? Number(minute) : undefined,
        amPm: String(amPm).toUpperCase() as 'AM' | 'PM',
      }
    }
    createAppointmentRequest.sessionMethodRequest = this.getSessionMethodFromFormData(formData)
    createAppointmentRequest.sessionCommunication = this.getInformedMethodsFromFormData(formData)

    return createAppointmentRequest
  }

  private loadFormFromSession(createAppointmentRequest: CreateAppointmentRequest): ScheduleFormData {
    let formData: ScheduleFormData = {}

    if (!createAppointmentRequest) {
      return formData
    }
    if (createAppointmentRequest.date) {
      try {
        formData.sessionDate = format(parse(createAppointmentRequest.date, 'yyyy-MM-dd', new Date()), 'd/M/yyyy')
      } catch {
        formData.sessionDate = ''
      }
    }

    if (createAppointmentRequest.time) {
      formData['sessionTime-hour'] =
        createAppointmentRequest.time.hour != null ? String(createAppointmentRequest.time.hour) : ''
      formData['sessionTime-minute'] =
        createAppointmentRequest.time.minute != null ? String(createAppointmentRequest.time.minute) : ''
      formData['sessionTime-meridiem'] = createAppointmentRequest.time.amPm
        ? createAppointmentRequest.time.amPm.toLowerCase()
        : 'am'
    }

    formData = this.loadSessionMethodFromSession(createAppointmentRequest.sessionMethodRequest, formData)
    formData = this.loadInformedMethodsFromSession(createAppointmentRequest.sessionCommunication, formData)

    return formData
  }

  private isIdentifierACrn(id: string): boolean {
    if (!id) return false
    const cleaned = id.trim().toUpperCase()
    return cleaned.length === 7 && /^[A-Z]\d{6}$/.test(cleaned)
  }

  private isIdentifierAPrisonNumber(id: string): boolean {
    if (!id) return false
    const cleaned = id.trim().toUpperCase()
    return cleaned.length === 7 && /^[A-Z]\d{4}[A-Z]{2}$/.test(cleaned)
  }

  private isPersonInCommunity(personIdentifier: string): boolean {
    return this.isIdentifierACrn(personIdentifier)
  }

  private isPersonInPrison(personIdentifier: string): boolean {
    return this.isIdentifierAPrisonNumber(personIdentifier)
  }

  private validateAddressFields(
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

  private validateAppointment(
    req: Request,
    referralInformation: ReferralInformation,
  ): {
    formData: ScheduleFormData
    errors: Record<string, { text: string }>
  } {
    const MAX_OTHER_METHOD_OF_CONTACT_LENGTH = 50
    const MAX_REASON_LENGTH = 100

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
    const isPersonInCommunity = this.isPersonInCommunity(referralInformation.crn)

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
      if (!formData.sessionTakePlace?.trim()) {
        errors.sessionTakePlace = { text: 'Select how the session will take place' }
      }
      if (['ByPhone', 'ByVideo'].includes(formData.sessionTakePlace)) {
        const reasonKey = this.getReasonKey(formData.sessionTakePlace)
        const reason = getValue(reasonKey)
        switch (reasonKey) {
          case 'ByPhone':
            formData.ByPhone = reason
            break
          case 'ByVideo':
            formData.ByVideo = reason
            break
          default:
            break
        }
        if (!reason?.trim()) {
          errors[reasonKey] = { text: 'Enter why the session is not in-person' }
        } else if (reason?.length > MAX_REASON_LENGTH) {
          errors[reasonKey] = {
            text: `Why is this session not in-person must be ${MAX_REASON_LENGTH} characters or less`,
          }
        }
      }
      if (isPersonInCommunity) {
        if (formData.sessionTakePlace === 'InProbationOffice') {
          formData.probationOffice = getValue('probationOfficeList')
          if (!formData.probationOffice?.trim()) {
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
            text: `Select how ${referralInformation.firstName} was informed about the session`,
          }
        } else if (formData.informedMethod.includes('informedByOtherMethod')) {
          formData.otherMethodOfContact = getValue('otherMethodOfContact')
          if (!formData.otherMethodOfContact?.trim()) {
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
        if (!formData.prison?.trim()) {
          errors.prisonList = { text: 'Select prison establishment' }
        }
      }
    }
    return {
      formData,
      errors,
    }
  }

  private mapSessionTakePlaceToType(takePlace: string): SessionMethodRequest['type'] {
    switch (takePlace) {
      case 'ByPhone':
        return 'PHONE'
      case 'ByVideo':
        return 'VIDEO'
      case 'InProbationOffice':
        return 'PROBATION_OFFICE'
      case 'InSomewhereElse':
        return 'OTHER_LOCATION'
      default:
        return 'OTHER_LOCATION'
    }
  }

  private mapTypeToSessionTakePlace(type: SessionMethodRequest['type']): string {
    switch (type) {
      case 'PHONE':
        return 'ByPhone'
      case 'VIDEO':
        return 'ByVideo'
      case 'PROBATION_OFFICE':
        return 'InProbationOffice'
      case 'OTHER_LOCATION':
        return 'InSomewhereElse'
      default:
        return 'InSomewhereElse'
    }
  }

  private getReasonKey(sessionTakePlace: string): string | null {
    switch (sessionTakePlace) {
      case 'ByPhone':
        return 'ByPhone'
      case 'ByVideo':
        return 'ByVideo'
      default:
        return null
    }
  }

  private getReasonFromFormData(formData: ScheduleFormData, sessionTakePlace: string): string | undefined {
    switch (sessionTakePlace) {
      case 'ByPhone':
        return formData.ByPhone
      case 'ByVideo':
        return formData.ByVideo
      default:
        return null
    }
  }

  private getSessionMethodFromFormData(formData: ScheduleFormData): SessionMethodRequest {
    const sessionTakePlace = formData.sessionTakePlace || ''

    if (sessionTakePlace) {
      const sessionMethod: SessionMethodRequest = { type: this.mapSessionTakePlaceToType(sessionTakePlace) }

      if (['ByPhone', 'ByVideo'].includes(sessionTakePlace)) {
        const reason = this.getReasonFromFormData(formData, sessionTakePlace)
        if (reason) sessionMethod.additionalDetails = reason
      }

      if (sessionTakePlace === 'InProbationOffice' && formData.probationOffice) {
        sessionMethod.additionalDetails = formData.probationOffice
      }

      if (sessionTakePlace === 'InPrison' && formData.prison) {
        sessionMethod.additionalDetails = formData.prison
      }

      if (sessionTakePlace === 'InSomewhereElse') {
        sessionMethod.addressLine1 = formData.addressLine1
        sessionMethod.addressLine2 = formData.addressLine2
        sessionMethod.townOrCity = formData.addressTown
        sessionMethod.county = formData.addressCounty
        sessionMethod.postcode = formData.addressPostcode
      }

      return sessionMethod
    }
    return {} as SessionMethodRequest
  }

  private loadSessionMethodFromSession(
    sessionMethodRequest: SessionMethodRequest,
    formData: ScheduleFormData,
  ): ScheduleFormData {
    if (!sessionMethodRequest) {
      return formData
    }

    const updatedFormData = { ...formData }
    const method = sessionMethodRequest

    updatedFormData.sessionTakePlace = this.mapTypeToSessionTakePlace(method.type)

    if (method.additionalDetails) {
      const reasonKey = this.getReasonKey(updatedFormData.sessionTakePlace)
      if (reasonKey) {
        switch (reasonKey) {
          case 'ByPhone':
            updatedFormData.ByPhone = method.additionalDetails
            break
          case 'ByVideo':
            updatedFormData.ByVideo = method.additionalDetails
            break
          default:
            break
        }
      }
    }
    if (method.type === 'PROBATION_OFFICE') {
      updatedFormData.probationOffice = method.additionalDetails
    }
    if (method.type === 'OTHER_LOCATION') {
      updatedFormData.addressLine1 = method.addressLine1 || ''
      updatedFormData.addressLine2 = method.addressLine2 || ''
      updatedFormData.addressTown = method.townOrCity || ''
      updatedFormData.addressCounty = method.county || ''
      updatedFormData.addressPostcode = method.postcode || ''
    }

    return updatedFormData
  }

  private getInformedMethodsFromFormData(formData: ScheduleFormData): string[] {
    let informedMethods = Array.isArray(formData.informedMethod) ? [...formData.informedMethod] : []
    if (informedMethods.includes('informedByOtherMethod') && formData.otherMethodOfContact) {
      informedMethods = informedMethods
        .filter(method => method !== 'informedByOtherMethod')
        .concat(formData.otherMethodOfContact)
    }
    return informedMethods
  }

  private loadInformedMethodsFromSession(
    sessionCommunications: string[],
    formData: ScheduleFormData,
  ): ScheduleFormData {
    let informedMethods = [...sessionCommunications]

    const standardMethods = ['informedByPhone', 'informedByTextMessage', 'informedByEmail']

    const otherMethod = informedMethods.find(method => !standardMethods.includes(method))

    if (otherMethod) {
      informedMethods = informedMethods.filter(method => method !== otherMethod)
      informedMethods.push('informedByOtherMethod')
    }

    return {
      ...formData,
      otherMethodOfContact: otherMethod || '',
      informedMethod: informedMethods,
    }
  }

  changeIcs(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params
    const { username } = res.locals.user
    return this.appointmentService
      .getICS(caseRefId.toString(), username)
      .then(data => new InitialContactSessionDetailsPresenter(data))
      .then(presenter => presenter.renderPage(res))
  }

  attendance(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params
    const { username } = res.locals.user
    const querySchema = z.object({
      error: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .default([]),
    })
    const { error } = querySchema.parse(req.query)
    return this.appointmentService
      .getICS(caseRefId.toString(), username)
      .then(data => new RecordSessionAttendancePresenter(caseRefId.toString(), data, error))
      .then(presenter => presenter.renderPage(res))
  }

  async submitIcs(req: Request, res: Response): Promise<void> {
    const { referralId } = req.params as { referralId: string }
    const { username } = res.locals.user
    const createAppointmentRequest = req.session?.createAppointmentRequest
    if (createAppointmentRequest) {
      const response = await this.appointmentService.submitICS(referralId, createAppointmentRequest, username)
      if (response) {
        delete req.session.createAppointmentRequest
      }
      req.session.validation = { success: true }
      return res.redirect(`/progress/${referralId}`)
    }
    return res.redirect(`/referral/${referralId}/appointment/schedule-ics`)
  }

  async checkFeedback(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params
    const { IcsFeedbackSubmission } = req.session || null
    if (IcsFeedbackSubmission) {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(IcsFeedbackSubmission)
      presenter.renderPage(res)
    } else {
      res.redirect(`/progress/${caseRefId}`)
    }
  }

  recordAttendance(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params
    return RecordSessionAttendanceFormDataSchema.parseAsync(req.body)
      .then(data => {
        const sessionHappened = data.happened === 'Yes'
        req.session.IcsFeedbackSubmission = { record: { didSessionHappen: sessionHappened } }
        if (data.happened === 'Yes') {
          res.redirect(`/ics-feedback/${caseRefId}/did-session-take-place`)
          return
        }
        if (data.attended === 'Yes') {
          res.redirect(`/ics-feedback/${caseRefId}/why-did-the-session-not-happen`)
          return
        }
        res.redirect(`/ics-feedback/${caseRefId}/how-they-tried-to-contact-the-person`)
      })
      .catch(error => {
        if (error instanceof ZodError) {
          const ids = Object.keys(z.flattenError(error).fieldErrors)
          res.redirect(`/ics-feedback/attendance/${caseRefId}?error=${ids}`)
          return
        }
        res.redirect('/error')
      })
  }
}

export default AppointmentController

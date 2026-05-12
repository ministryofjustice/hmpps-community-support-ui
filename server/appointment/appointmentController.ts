import { Request, Response } from 'express'
import {
  AppointmentIcsResponse,
  CreateAppointmentRequest,
  IcsFeedbackSubmission,
  SessionMethodRequest,
} from '@community-support-api'
import { format, parse } from 'date-fns'
import z, { ZodError } from 'zod'
import timeFormat from '../utils/timeFormat'
import { HowSessionTookPlace, IcsFeedbackHowSessionTookPlaceSession } from '../@types/express'
import ConfirmIcsPresenter, { type AdditionalInformation } from './confirm-ics/confirmIcsPresenter'
import InitialContactSessionDetailsPresenter from '../referral/InitialContactSessionDetailsPresenter'
import ReferralService from '../services/referralService'
import AppointmentService from '../services/AppointmentService'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import IcsFeedbackHowSessionTookPlacePresenter from './ics-feedback/icsFeedbackHowSessionTookPlacePresenter'
import ReferenceDataService from '../services/referenceDataService'
import { DateValidationOptions, TimeValidationOptions } from '../utils/validateDateTime'
import RecordSessionAttendancePresenter from './record-ics/RecordSessionAttendancePresenter'
import IcsFeedbackCheckYourAnswersPresenter from './check-ics-feedback/icsFeedbackCheckYourAnswersPresenter'
import SessionFeedbackPresenter from './session-feedback/sessionFeedbackPresenter'
import { RecordSessionAttendanceFormDataSchema } from '../validation/RecordSessionAttendanceFormData'
import { ReferralProgressBannerContent } from '../referral/progress/ReferralProgressBannerContent'
import AppointmentValidator from './AppointmentValidator'
import { IcsFeedbackHowSessionTookPlaceFormData } from './ics-feedback/icsFeedbackHowSessionTookPlaceViewModel'
import { SessionFeedbackFormDataSchema } from '../validation/SessionFeedbackFormData'
import RecordSessionDetailsPresenter from './record-ics/RecordSessionDetailsPresenter'
import { RecordSessionDetailsFormViewModel } from './record-ics/RecordSessionDetailsViewModel'
import {
  RecordSessionDetailsError,
  RecordSessionDetailsFormDataSchema,
} from '../validation/RecordSessionDetailsFormData'

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
  private readonly validator = new AppointmentValidator()

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
      const validationResults = this.validator.validateAppointment(req, referralInformation)

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
    if (createAppointmentRequest.sessionMethodRequest) {
      const method = createAppointmentRequest.sessionMethodRequest

      formData.sessionTakePlace = this.mapTypeToSessionTakePlace(method.type)

      if (method.additionalDetails) {
        const reasonKey = this.validator.getReasonKey(formData.sessionTakePlace)
        if (reasonKey) {
          switch (reasonKey) {
            case 'ByPhone':
              formData.ByPhone = method.additionalDetails
              break
            case 'ByVideo':
              formData.ByVideo = method.additionalDetails
              break
            case 'InSomewhereElse':
              formData.InSomewhereElse = method.additionalDetails
              break
            default:
              break
          }
        }
      }

      if (method.type === 'OTHER_LOCATION') {
        formData.addressLine1 = method.addressLine1 || ''
        formData.addressLine2 = method.addressLine2 || ''
        formData.addressTown = method.townOrCity || ''
        formData.addressCounty = method.county || ''
        formData.addressPostcode = method.postcode || ''
      }
    }

    if (Array.isArray(createAppointmentRequest.sessionCommunication)) {
      formData.informedMethod = [...createAppointmentRequest.sessionCommunication]
    } else {
      formData.informedMethod = []
    }

    return formData
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

  async changeIcs(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params
    const { username } = res.locals.user
    return this.appointmentService
      .getICS(caseRefId.toString(), username)
      .then(data => new InitialContactSessionDetailsPresenter(data))
      .then(presenter => presenter.renderPage(res))
  }

  async didSessionTakePlace(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const [probationOffices, icsAppointment] = await Promise.all([
      this.referenceDataService.getProbationOffices(),
      this.appointmentService.getICS(caseRefId, username),
    ])
    const { sessionMethod } = icsAppointment

    if (req.method === 'POST') {
      const { formData, errors } = this.validator.validateIcsFeedbackForm(req, sessionMethod.type)

      if (Object.keys(errors).length > 0) {
        if (!req.session.icsFeedbackPendingFormData) {
          req.session.icsFeedbackPendingFormData = {}
        }
        req.session.icsFeedbackPendingFormData[caseRefId] = formData as Record<string, string>
        Object.entries(errors).forEach(([field, error]) => {
          req.flash(`${field}Error`, error.text)
        })
        req.session.formKeys = [...new Set([...(req.session.formKeys ?? []), ...Object.keys(errors)])]
        return res.redirect(`/ics-feedback/${caseRefId}/did-session-take-place`)
      }

      const currentSubmission = this.ensureFeedbackSubmission(req, caseRefId)
      if (!currentSubmission.record) {
        currentSubmission.record = { didSessionHappen: true }
      }
      currentSubmission.record = {
        ...currentSubmission.record,
        howSessionTookPlace: this.buildHowSessionTookPlace(formData) as SessionMethodRequest,
      }

      return res.redirect(`/ics-feedback/${caseRefId}/session-details`)
    }

    let formData: IcsFeedbackHowSessionTookPlaceFormData
    if (req.session.icsFeedbackPendingFormData?.[caseRefId]) {
      formData = req.session.icsFeedbackPendingFormData[caseRefId] as IcsFeedbackHowSessionTookPlaceFormData
      delete req.session.icsFeedbackPendingFormData[caseRefId]
    } else {
      const currentFeedback = this.getFeedbackSubmission(req, caseRefId)
      const storedHowSessionTookPlace = currentFeedback?.record?.howSessionTookPlace as HowSessionTookPlace | undefined
      formData = this.loadIcsFeedbackFromSession(
        storedHowSessionTookPlace ? { howSessionTookPlace: storedHowSessionTookPlace } : undefined,
      )
    }
    const validationErrors = res.locals.errors?.messages as Record<string, { text: string }> | undefined
    const presenter = new IcsFeedbackHowSessionTookPlacePresenter(
      caseRefId,
      sessionMethod,
      probationOffices,
      formData,
      validationErrors,
    )
    return presenter.renderPage(res)
  }

  buildHowSessionTookPlace(formData: IcsFeedbackHowSessionTookPlaceFormData): HowSessionTookPlace {
    if (formData.phoneCall === 'yes') {
      return { type: 'PHONE' }
    }
    const formType = formData.howSessionTookPlace
    if (formType === 'PHONE') {
      return { type: 'PHONE', additionalDetails: formData.phoneCallReason }
    }
    if (formType === 'VIDEO') {
      return { type: 'VIDEO', additionalDetails: formData.videoCallReason }
    }
    if (formType === 'IN_PERSON_PROBATION_OFFICE') {
      return { type: 'IN_PERSON_PROBATION_OFFICE', pdu: formData.probationDeliveryUnit }
    }
    return {
      type: 'IN_PERSON_OTHER_LOCATION',
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      townOrCity: formData.townOrCity,
      county: formData.county,
      postcode: formData.postcode,
    }
  }

  loadIcsFeedbackFromSession(
    icsFeedback: IcsFeedbackHowSessionTookPlaceSession | undefined,
  ): IcsFeedbackHowSessionTookPlaceFormData {
    if (!icsFeedback?.howSessionTookPlace) return {}
    const { type, additionalDetails, pdu, addressLine1, addressLine2, townOrCity, county, postcode } =
      icsFeedback.howSessionTookPlace
    if (type === 'PHONE') {
      if (additionalDetails) {
        return { phoneCall: 'no', howSessionTookPlace: 'PHONE', phoneCallReason: additionalDetails }
      }
      return { phoneCall: 'yes' }
    }
    const base: IcsFeedbackHowSessionTookPlaceFormData = { phoneCall: 'no', howSessionTookPlace: type }
    if (type === 'VIDEO') return { ...base, videoCallReason: additionalDetails }
    if (type === 'IN_PERSON_PROBATION_OFFICE') return { ...base, probationDeliveryUnit: pdu }
    return { ...base, addressLine1, addressLine2, townOrCity, county, postcode }
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
        this.setIcsSuccessfullyScheduledBanner(req, response, referralId)
      }

      return res.redirect(`/progress/${referralId}`)
    }
    return res.redirect(`/referral/${referralId}/appointment/schedule-ics`)
  }

  async checkFeedback(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const icsFeedbackSubmission = this.getFeedbackSubmission(req, caseRefId)

    if (icsFeedbackSubmission) {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(icsFeedbackSubmission)
      presenter.renderPage(res)
    } else {
      res.redirect(`/progress/${caseRefId}`)
    }
  }

  async recordAttendance(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    return RecordSessionAttendanceFormDataSchema.parseAsync(req.body)
      .then(data => {
        const sessionHappened = data.happened === 'Yes'
        const existing = this.getFeedbackSubmission(req, caseRefId)
        this.updatedFeedbackSubmission(req, caseRefId, {
          ...existing,
          record: { ...existing?.record, didSessionHappen: sessionHappened },
        })
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

  async getSessionFeedback(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    const icsAppointment = await this.appointmentService.getICS(caseRefId, username)

    if (!icsAppointment) {
      req.flash('error', 'Appointment not found.')
      res.redirect(`/ics-feedback/${caseRefId}/session-feedback`)
      return Promise.resolve()
    }

    const currentFeedback = this.ensureFeedbackSubmission(req, caseRefId)

    const presenter = new SessionFeedbackPresenter(caseRefId.toString(), currentFeedback)
    presenter.renderPage(res)

    return Promise.resolve()
  }

  async submitSessionFeedback(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    try {
      const icsAppointment = await this.appointmentService.getICS(caseRefId, username)

      if (!icsAppointment) {
        req.flash('error', 'Appointment not found.')
        res.redirect(`/ics-feedback/${caseRefId}/session-feedback`)
        return Promise.resolve()
      }

      const currentSubmission = this.getFeedbackSubmission(req, caseRefId)

      if (!currentSubmission || !currentSubmission.record) {
        req.flash('error', 'Feedback record is missing. Please start the feedback process again.')
        res.redirect(`/ics-feedback/${caseRefId}/session-feedback`)
        return Promise.resolve()
      }

      currentSubmission.sessionFeedback ??= {}

      const validated = await SessionFeedbackFormDataSchema.parseAsync(req.body)
      currentSubmission.sessionFeedback.whatHappened = validated.whatDidYouDo

      res.redirect(`/ics-feedback/${caseRefId}/feedback`)
    } catch (error) {
      const currentSubmission = this.getFeedbackSubmission(req, caseRefId)
      if (currentSubmission && currentSubmission?.sessionFeedback) {
        currentSubmission.sessionFeedback.whatHappened = req.body.whatDidYouDo ?? ''
      }
      if (error instanceof z.ZodError) {
        error.issues.forEach(issue => {
          const field = String(issue.path[0] ?? '')
          req.flash(`${field}Error`, issue.message)
        })
      }
      res.redirect(`/ics-feedback/${caseRefId}/session-feedback`)
    }
    return Promise.resolve()
  }

  private getFeedbackSubmission(req: Request, caseRefId: string): IcsFeedbackSubmission | null {
    return req.session.icsFeedbackSubmissionsMap?.[caseRefId]
  }

  private ensureFeedbackSubmission(req: Request, caseRefId: string): IcsFeedbackSubmission {
    if (!req.session.icsFeedbackSubmissionsMap) {
      req.session.icsFeedbackSubmissionsMap = {} as Record<string, IcsFeedbackSubmission>
    }
    if (!req.session.icsFeedbackSubmissionsMap[caseRefId]) {
      req.session.icsFeedbackSubmissionsMap[caseRefId] = {} as IcsFeedbackSubmission
    }
    return req.session.icsFeedbackSubmissionsMap[caseRefId]
  }

  private updatedFeedbackSubmission(
    req: Request,
    caseRefId: string,
    icsFeedbackSubmission: IcsFeedbackSubmission,
  ): IcsFeedbackSubmission {
    if (!req.session.icsFeedbackSubmissionsMap) {
      req.session.icsFeedbackSubmissionsMap = {} as Record<string, IcsFeedbackSubmission>
    }
    req.session.icsFeedbackSubmissionsMap = {
      ...req.session.icsFeedbackSubmissionsMap,
      [caseRefId]: icsFeedbackSubmission,
    }
    return req.session.icsFeedbackSubmissionsMap[caseRefId]
  }

  private clearFeedbackSubmission(req: Request, caseRefId: string): void {
    if (!req.session.icsFeedbackSubmissionsMap) {
      return
    }

    delete req.session.icsFeedbackSubmissionsMap[caseRefId]
  }

  private setIcsSuccessfullyScheduledBanner(req: Request, response: AppointmentIcsResponse, id: string): void {
    const date = format(response.appointmentDate, 'dd MMM yyyy')
    const time = timeFormat(response.appointmentTime)

    req.session.referralProgressBanner = {
      caseReference: id,
      heading: 'ICS Scheduled',
      body: `The ICS has been scheduled for ${date} at ${time}`,
    } as ReferralProgressBannerContent
  }

  async sessionDetails(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const validationErrors: RecordSessionDetailsError = res.locals.errors
    const icsFeedbackSubmission = this.ensureFeedbackSubmission(req, caseRefId)
    const sessionDetails = icsFeedbackSubmission ? icsFeedbackSubmission.sessionDetails : null
    const appointmentData = await this.appointmentService.getICS(caseRefId.toString(), username)
    const presenter = new RecordSessionDetailsPresenter(caseRefId, appointmentData, sessionDetails, validationErrors)
    return presenter.renderPage(res)
  }

  async recordSessionDetails(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const bodyData: RecordSessionDetailsFormViewModel = req.body
    const icsFeedbackSubmission = this.ensureFeedbackSubmission(req, caseRefId)
    if (!icsFeedbackSubmission) {
      res.redirect(`/progress/${caseRefId}`)
      return
    }
    RecordSessionDetailsFormDataSchema.parseAsync(req.body)
      .then(data => {
        icsFeedbackSubmission.sessionDetails = {
          wasPersonLate: data.wasPersonLate === 'Yes',
          lateReason: data.lateReason,
          duration: {
            hours: data['sessionDuration-hours'],
            minutes: data['sessionDuration-minutes'],
          },
        }
        req.session.icsFeedbackSubmissionsMap[caseRefId] = icsFeedbackSubmission
        return res.redirect(`/ics-feedback/${caseRefId}/session-feedback`)
      })
      .catch(error => {
        if (error instanceof ZodError) {
          // Persist the entered values
          icsFeedbackSubmission.sessionDetails = {
            wasPersonLate: bodyData.wasPersonLate ? bodyData.wasPersonLate === 'Yes' : null,
            lateReason: bodyData.lateReason!,
            duration: {
              hours: bodyData['sessionDuration-hours'] ? Number(bodyData['sessionDuration-hours']) : null,
              minutes: bodyData['sessionDuration-minutes'] ? Number(bodyData['sessionDuration-minutes']) : null,
            },
          }
          req.session.icsFeedbackSubmissionsMap[caseRefId] = icsFeedbackSubmission

          const errors: { [key: string]: string[] } = z.flattenError(error).fieldErrors
          const ids = Object.keys(errors)
          if (!req.session.formKeys.includes('wasPersonLate')) {
            req.session.formKeys.unshift('wasPersonLate')
          }
          ids.forEach(id => req.flash(`${id}Error`, errors[id][0]))
          res.redirect(`/ics-feedback/${caseRefId}/session-details`)
          return
        }
        res.redirect('/error')
      })
  }
}

export default AppointmentController

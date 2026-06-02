import { Request, Response } from 'express'
import {
  AppointmentIcsResponse,
  CreateAppointmentRequest,
  SessionMethod,
  SessionMethodRequest,
} from '@community-support-api'
import { format, parse } from 'date-fns'
import timeFormat from '../utils/timeFormat'
import { ErrorMiddlewareErrors, HowSessionTookPlace, IcsFeedbackHowSessionTookPlaceSession } from '../@types/express'
import ConfirmIcsPresenter, { type AdditionalInformation } from './confirm-ics/confirmIcsPresenter'
import InitialContactSessionDetailsPresenter from '../referral/InitialContactSessionDetailsPresenter'
import ReferralService from '../services/referralService'
import AppointmentService from '../services/AppointmentService'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import IcsFeedbackHowSessionTookPlacePresenter from './ics-feedback/icsFeedbackHowSessionTookPlacePresenter'
import ReferenceDataService from '../services/referenceDataService'
import RecordSessionAttendancePresenter from './record-ics/RecordSessionAttendancePresenter'
import IcsFeedbackCheckYourAnswersPresenter from './check-ics-feedback/icsFeedbackCheckYourAnswersPresenter'
import SessionFeedbackPresenter from './session-feedback/sessionFeedbackPresenter'
import RecordSessionAttendanceFormData, {
  RecordSessionAttendanceFormDataSchema,
} from '../validation/RecordSessionAttendanceFormData'
import { ReferralProgressBannerContent } from '../referral/progress/ReferralProgressBannerContent'
import AppointmentValidator from './AppointmentValidator'
import { IcsFeedbackHowSessionTookPlaceFormData } from './ics-feedback/icsFeedbackHowSessionTookPlaceViewModel'
import { SessionFeedbackFormDataSchema } from '../validation/SessionFeedbackFormData'
import ViewChangeSessionDetailsPresenter from './view-change-session-details/ViewChangeSessionDetailsPresenter'
import RecordSessionDetailsPresenter from './record-ics/RecordSessionDetailsPresenter'
import { RecordSessionDetailsFormDataSchema } from '../validation/RecordSessionDetailsFormData'
import HowTheyTriedToContactThePersonPresenter from './howTheyTriedToContactThePerson/howTheyTriedToContactThePersonPresenter'
import icsFeedbackHowTheyTriedToContactThePersonFormDataSchema from '../validation/icsFeedbackHowTheyTriedToContactThePersonFormDataSchema'
import validateRequestBodyAgainstSchema, { formatDynamicErrorMessages } from '../validation/validationUtils'
import WhyDidSessionNotHappenPresenter from './why-did-session-not-happen/WhyDidSessionNotHappenPresenter'
import { WhyDidSessionNotHappenFormDataSchema } from '../validation/WhyDidSessionNotHappenFormData'
import { IcsFeedbackFormSchema } from '../validation/IcsFeedbackHowSessionTookPlaceFormData'
import { ScheduleIcsAppointmentSchema } from '../validation/ScheduleIcsAppointmentFormData'
import ChangeIcsDetailsReasonPresenter from './change-ics-details-reason/ChangeIcsDetailsReasonPresenter'
import { ChangeIcsDetailsReasonSchema } from '../validation/ChangeIcsDetailsReasonFormData'

interface ScheduledIcsFormData {
  sessionDate?: string
  'sessionTime-hour'?: string
  'sessionTime-minute'?: string
  'sessionTime-meridiem'?: string
  sessionTakePlace?: string
  byPhone?: string
  byVideo?: string
  inSomewhereElse?: string
  probationOffice?: string
  prison?: string
  addressLine1?: string
  addressLine2?: string
  addressTown?: string
  addressCounty?: string
  addressPostcode?: string
  informedMethods?: string[]
  otherMethodOfContact?: string
}

const recordAttendanceRedirectUrl = (data: RecordSessionAttendanceFormData, caseRefId: string): string => {
  if (data.happened === 'Yes') {
    return `/ics-feedback/${caseRefId}/did-session-take-place`
  }
  if (data.attended === 'Yes') {
    return `/ics-feedback/${caseRefId}/why-did-the-session-not-happen`
  }
  return `/ics-feedback/${caseRefId}/how-they-tried-to-contact-the-person`
}

const restartFeedback = (req: Request, res: Response): boolean => {
  const caseRefId = req.params.caseRefId as string | undefined
  if (!caseRefId) {
    return false
  }
  const icsFeedback = req.session.icsFeedbackSubmission
  if (!icsFeedback || icsFeedback.caseReferenceId !== caseRefId) {
    delete req.session.icsFeedbackSubmission
    res.redirect(`/ics-feedback/${caseRefId}/attendance`)
    return true
  }
  return false
}

const buildHowSessionTookPlace = (
  formData: IcsFeedbackHowSessionTookPlaceFormData,
  plannedSessionMethod: SessionMethod,
): Partial<HowSessionTookPlace> => {
  if (formData.didSessionTakePlaceAsPlanned === 'yes') {
    if (plannedSessionMethod.type === 'IN_PERSON_PROBATION_OFFICE') {
      return { type: plannedSessionMethod.type, pdu: plannedSessionMethod.probationOfficeName }
    }

    if (plannedSessionMethod.type === 'IN_PERSON_OTHER_LOCATION') {
      return {
        type: plannedSessionMethod,
        addressLine1: plannedSessionMethod.addressLine1 || '',
        addressLine2: plannedSessionMethod.addressLine2 || '',
        townOrCity: plannedSessionMethod.townOrCity || '',
        county: plannedSessionMethod.county || '',
        postcode: plannedSessionMethod.postcode || '',
      }
    }
    return { type: plannedSessionMethod.type }
  }

  switch (formData.howSessionTookPlace) {
    case 'PHONE':
      return {
        type: 'PHONE',
        additionalDetails: formData.phoneCallReason,
      }
    case 'VIDEO':
      return {
        type: 'VIDEO',
        additionalDetails: formData.videoCallReason,
      }
    case 'IN_PERSON_PROBATION_OFFICE':
      return {
        type: 'IN_PERSON_PROBATION_OFFICE',
        pdu: formData.probationDeliveryUnit,
      }
    case 'IN_PERSON_OTHER_LOCATION':
      return {
        type: 'IN_PERSON_OTHER_LOCATION',
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        townOrCity: formData.townOrCity,
        county: formData.county,
        postcode: formData.postcode,
      }
    default:
      return {}
  }
}

const loadIcsFeedbackFromSession = (
  icsFeedback: IcsFeedbackHowSessionTookPlaceSession | undefined,
): IcsFeedbackHowSessionTookPlaceFormData => {
  if (!icsFeedback?.howSessionTookPlace) return {}
  const { type, additionalDetails, pdu, addressLine1, addressLine2, townOrCity, county, postcode } =
    icsFeedback.howSessionTookPlace
  switch (type) {
    case 'PHONE':
      return additionalDetails
        ? {
            phoneCall: 'no',
            howSessionTookPlace: 'PHONE',
            phoneCallReason: additionalDetails,
          }
        : { phoneCall: 'yes' }
    case 'VIDEO':
      return {
        phoneCall: 'no',
        howSessionTookPlace: type,
        videoCallReason: additionalDetails,
      }
    case 'IN_PERSON_PROBATION_OFFICE':
      return {
        phoneCall: 'no',
        howSessionTookPlace: type,
        probationDeliveryUnit: pdu,
      }
    case 'IN_PERSON_OTHER_LOCATION':
      return {
        phoneCall: 'no',
        howSessionTookPlace: type,
        addressLine1,
        addressLine2,
        townOrCity,
        county,
        postcode,
      }
    default:
      return {}
  }
}

const getReasonFromFormData = (formData: ScheduledIcsFormData, sessionTakePlace: string): string | undefined => {
  switch (sessionTakePlace) {
    case 'ByPhone':
      return formData.byPhone
    case 'ByVideo':
      return formData.byVideo
    default:
      return undefined
  }
}

const mapSessionTakePlaceToType = (takePlace: string): SessionMethodRequest['type'] => {
  switch (takePlace) {
    case 'ByPhone':
      return 'PHONE'
    case 'ByVideo':
      return 'VIDEO'
    case 'InProbationOffice':
      return 'IN_PERSON_PROBATION_OFFICE'
    case 'InSomewhereElse':
      return 'IN_PERSON_OTHER_LOCATION'
    default:
      return 'IN_PERSON_OTHER_LOCATION'
  }
}

const mapTypeToSessionTakePlace = (type: SessionMethodRequest['type']): string => {
  switch (type) {
    case 'PHONE':
      return 'ByPhone'
    case 'VIDEO':
      return 'ByVideo'
    case 'IN_PERSON_PROBATION_OFFICE':
      return 'InProbationOffice'
    case 'IN_PERSON_OTHER_LOCATION':
      return 'InSomewhereElse'
    default:
      return 'InSomewhereElse'
  }
}

const getReasonKey = (sessionTakePlace: string): string | null => {
  switch (sessionTakePlace) {
    case 'ByPhone':
      return 'ByPhone'
    case 'ByVideo':
      return 'ByVideo'
    default:
      return null
  }
}

const loadSessionMethodFromSession = (
  sessionMethodRequest: SessionMethodRequest,
  formData: ScheduledIcsFormData,
): ScheduledIcsFormData => {
  if (!sessionMethodRequest) {
    return formData
  }

  const updatedFormData = { ...formData }
  const method = sessionMethodRequest

  updatedFormData.sessionTakePlace = mapTypeToSessionTakePlace(method.type)

  if (method.additionalDetails) {
    switch (getReasonKey(updatedFormData.sessionTakePlace)) {
      case 'ByPhone':
        updatedFormData.byPhone = method.additionalDetails
        break
      case 'ByVideo':
        updatedFormData.byVideo = method.additionalDetails
        break
      default:
        break
    }
  }
  if (method.type === 'IN_PERSON_PROBATION_OFFICE') {
    updatedFormData.probationOffice = method.additionalDetails
  }
  if (method.type === 'IN_PERSON_OTHER_LOCATION') {
    updatedFormData.addressLine1 = method.addressLine1 || ''
    updatedFormData.addressLine2 = method.addressLine2 || ''
    updatedFormData.addressTown = method.townOrCity || ''
    updatedFormData.addressCounty = method.county || ''
    updatedFormData.addressPostcode = method.postcode || ''
  }

  return updatedFormData
}

const loadInformedMethodsFromSession = (
  sessionCommunications: string[],
  formData: ScheduledIcsFormData,
): ScheduledIcsFormData => {
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
    informedMethods,
  }
}

const getSessionMethodFromFormData = (formData: ScheduledIcsFormData): SessionMethodRequest => {
  const sessionTakePlace = formData.sessionTakePlace || ''

  if (sessionTakePlace) {
    const sessionMethod: SessionMethodRequest = { type: mapSessionTakePlaceToType(sessionTakePlace) }

    if (['ByPhone', 'ByVideo'].includes(sessionTakePlace)) {
      const reason = getReasonFromFormData(formData, sessionTakePlace)
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

const getInformedMethodsFromFormData = (formData: ScheduledIcsFormData): string[] => {
  let informedMethods = Array.isArray(formData.informedMethods) ? [...formData.informedMethods] : []
  if (informedMethods.includes('informedByOtherMethod') && formData.otherMethodOfContact) {
    informedMethods = informedMethods
      .filter(method => method !== 'informedByOtherMethod')
      .concat(formData.otherMethodOfContact)
  }
  return informedMethods
}

const loadFormFromSession = (
  createAppointmentRequest: CreateAppointmentRequest,
  validator: AppointmentValidator,
): ScheduledIcsFormData => {
  let formData: ScheduledIcsFormData = {}

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

  formData = loadSessionMethodFromSession(createAppointmentRequest.sessionMethodRequest, formData)
  formData = loadInformedMethodsFromSession(createAppointmentRequest.sessionCommunication, formData)
  if (createAppointmentRequest.sessionMethodRequest) {
    const method = createAppointmentRequest.sessionMethodRequest

    formData.sessionTakePlace = mapTypeToSessionTakePlace(method.type)

    if (method.additionalDetails) {
      switch (validator.getReasonKey(formData.sessionTakePlace)) {
        case 'ByPhone':
          formData.byPhone = method.additionalDetails
          break
        case 'ByVideo':
          formData.byVideo = method.additionalDetails
          break
        case 'InSomewhereElse':
          formData.inSomewhereElse = method.additionalDetails
          break
        default:
          break
      }
    }

    if (method.type === 'IN_PERSON_OTHER_LOCATION') {
      formData.addressLine1 = method.addressLine1 || ''
      formData.addressLine2 = method.addressLine2 || ''
      formData.addressTown = method.townOrCity || ''
      formData.addressCounty = method.county || ''
      formData.addressPostcode = method.postcode || ''
    }
  }

  if (Array.isArray(createAppointmentRequest.sessionCommunication)) {
    formData.informedMethods = [...createAppointmentRequest.sessionCommunication]
  } else {
    formData.informedMethods = []
  }

  return formData
}

const getPendingFormData = (req: Request) => {
  if (req.session.pending) {
    const formData = req.session.pending
    delete req.session.pending
    return formData
  }
  const { icsFeedbackSubmission } = req.session
  const storedHowSessionTookPlace = icsFeedbackSubmission?.record?.howSessionTookPlace as
    | HowSessionTookPlace
    | undefined

  return loadIcsFeedbackFromSession(
    storedHowSessionTookPlace ? { howSessionTookPlace: storedHowSessionTookPlace } : undefined,
  )
}

const storePending = (req: Request) => {
  if (!req.session.pending) {
    req.session.pending = {}
  }
  req.session.pending = req.body as Record<string, string>
}

const createMethodSessionData = (method: SessionMethod): SessionMethodRequest => ({
  ...method,
  additionalDetails: method.whyNotInPersonReason,
})

const createIcsSessionData = ({
  appointmentDate,
  appointmentTime,
  sessionMethod,
  sessionCommunications,
}: AppointmentIcsResponse): CreateAppointmentRequest => {
  return {
    date: appointmentDate,
    time: appointmentTime,
    sessionMethodRequest: createMethodSessionData(sessionMethod),
    sessionCommunication: sessionCommunications,
  }
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
    const additionalDetails: AdditionalInformation = {
      firstName: referralInformation.firstName,
      submitHref: `/referral/${referralId}/appointment/submit-ics`,
      scheduleIcsHref: `/referral/${referralId}/appointment/schedule-ics`,
    }
    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, additionalDetails)
    return presenter.renderPage(res)
  }

  async showScheduleIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const caseRefId = req.params.caseRefId as string
    const [probationOffices, prisons, referralInformation] = await Promise.all([
      this.referenceDataService.getProbationOffices(),
      this.referenceDataService.getPrisons(),
      this.referralService.getReferralInformation(caseRefId, username),
    ])

    const validationErrors: ErrorMiddlewareErrors = formatDynamicErrorMessages(
      res.locals.errors,
      '{{ firstname }}',
      referralInformation.firstName,
    )
    res.locals.errors = validationErrors
    const formData = loadFormFromSession(req.session.createAppointmentRequest, this.validator)
    const presenter = new ScheduleIcsPresenter(
      caseRefId,
      probationOffices,
      prisons,
      referralInformation,
      formData,
      validationErrors,
    )
    return presenter.renderPage(res)
  }

  private async getExistingScheduledIcsFormData(caseRefId: string, username: string): Promise<ScheduledIcsFormData> {
    const existingIcs = await this.appointmentService.getICS(caseRefId, username)
    const sessionData = createIcsSessionData(existingIcs)
    return loadFormFromSession(sessionData, this.validator)
  }

  async showRescheduleIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const caseRefId = req.params.caseRefId as string
    const [probationOffices, prisons, referralInformation, formData] = await Promise.all([
      this.referenceDataService.getProbationOffices(),
      this.referenceDataService.getPrisons(),
      this.referralService.getReferralInformation(caseRefId, username),
      this.getExistingScheduledIcsFormData(caseRefId, username),
    ])

    const validationErrors: ErrorMiddlewareErrors = formatDynamicErrorMessages(
      res.locals.errors,
      '{{ firstname }}',
      referralInformation.firstName,
    )
    res.locals.errors = validationErrors

    const presenter = new ScheduleIcsPresenter(
      caseRefId,
      probationOffices,
      prisons,
      referralInformation,
      formData,
      validationErrors,
    )
    return presenter.renderPage(res)
  }

  async scheduleIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }
    let createAppointmentRequest = req.session?.createAppointmentRequest

    const referralInformation = await this.referralService.getReferralInformation(referralId, username)

    const informedMethodArr: string[] =
      typeof req.body.informedMethod === 'string' ? [req.body.informedMethod] : req.body.informedMethod
    createAppointmentRequest = this.saveFormToSession({
      sessionDate: req.body.sessionDate,
      'sessionTime-hour': req.body['sessionTime-hour'],
      'sessionTime-minute': req.body['sessionTime-minute'],
      'sessionTime-meridiem': req.body['sessionTime-meridiem']?.toLowerCase(),
      sessionTakePlace: req.body.sessionTakePlace,
      byPhone: req.body.ByPhone,
      byVideo: req.body.ByVideo,
      probationOffice: req.body.probationOfficeList,
      prison: req.body.prisonList,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      addressTown: req.body.addressTown,
      addressCounty: req.body.addressCounty,
      addressPostcode: req.body.addressPostcode,
      informedMethods: informedMethodArr,
      otherMethodOfContact: req.body.otherMethodOfContact,
    })
    req.session.createAppointmentRequest = createAppointmentRequest
    req.body.referralCrn = referralInformation.crn
    return validateRequestBodyAgainstSchema(ScheduleIcsAppointmentSchema, req, res, () => {
      return res.redirect(`/referral/${referralId}/appointment/confirm-ics`)
    })
  }

  async rescheduleIcs(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    let createAppointmentRequest = req.session?.createAppointmentRequest

    const informedMethodArr: string[] =
      typeof req.body.informedMethod === 'string' ? [req.body.informedMethod] : req.body.informedMethod
    createAppointmentRequest = this.saveFormToSession({
      sessionDate: req.body.sessionDate,
      'sessionTime-hour': req.body['sessionTime-hour'],
      'sessionTime-minute': req.body['sessionTime-minute'],
      'sessionTime-meridiem': req.body['sessionTime-meridiem']?.toLowerCase(),
      sessionTakePlace: req.body.sessionTakePlace,
      byPhone: req.body.ByPhone,
      byVideo: req.body.ByVideo,
      probationOffice: req.body.probationOfficeList,
      prison: req.body.prisonList,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      addressTown: req.body.addressTown,
      addressCounty: req.body.addressCounty,
      addressPostcode: req.body.addressPostcode,
      informedMethods: informedMethodArr,
      otherMethodOfContact: req.body.otherMethodOfContact,
    })
    req.session.createAppointmentRequest = createAppointmentRequest
    return validateRequestBodyAgainstSchema(ScheduleIcsAppointmentSchema, req, res, () => {
      return res.redirect(`/referral/${caseRefId}/ics-change-details/reason`)
    })
  }

  private saveFormToSession(formData: ScheduledIcsFormData): CreateAppointmentRequest {
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
    createAppointmentRequest.sessionMethodRequest = getSessionMethodFromFormData(formData)
    createAppointmentRequest.sessionCommunication = getInformedMethodsFromFormData(formData)

    return createAppointmentRequest
  }

  changeIcs(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    return this.appointmentService
      .getICS(caseRefId.toString(), username)
      .then(data => new InitialContactSessionDetailsPresenter(data, caseRefId))
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
    const formData = getPendingFormData(req)
    const validationErrors = res.locals.errors
    const presenter = new IcsFeedbackHowSessionTookPlacePresenter(
      caseRefId,
      sessionMethod,
      probationOffices,
      formData,
      validationErrors,
    )
    return presenter.renderPage(res)
  }

  async recordDidSessionTakePlace(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const icsAppointment = await this.appointmentService.getICS(caseRefId, username)
    const { sessionMethod } = icsAppointment

    storePending(req)

    req.body.sessionMethodType = sessionMethod.type
    return validateRequestBodyAgainstSchema(IcsFeedbackFormSchema, req, res, () => {
      let { icsFeedbackSubmission } = req.session
      if (!icsFeedbackSubmission?.record) {
        icsFeedbackSubmission = {
          ...icsFeedbackSubmission,
          record: { didSessionHappen: true },
        }
      }
      icsFeedbackSubmission.record = {
        ...icsFeedbackSubmission.record,
        howSessionTookPlace: buildHowSessionTookPlace(
          req.body as IcsFeedbackHowSessionTookPlaceFormData,
          sessionMethod,
        ) as SessionMethodRequest,
      }
      req.session.icsFeedbackSubmission = icsFeedbackSubmission // Debug log to check the updated session data
      return res.redirect(`/ics-feedback/${caseRefId}/session-details`)
    })
  }

  async viewChangeSessionDetails(req: Request, res: Response): Promise<void> {
    const { referralId, icsId } = req.params as { referralId: string; icsId: string }
    const { username } = res.locals.user
    const appointmentIcsResponse = await this.appointmentService.getIcsById(referralId, icsId, username)
    const presenter = new ViewChangeSessionDetailsPresenter(appointmentIcsResponse, referralId, icsId)
    return presenter.renderPage(res)
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

  async submitFeedback(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    const { icsFeedbackSubmission } = req.session

    const { appointmentIcsId } = await this.appointmentService.getICS(caseRefId, username)

    if (icsFeedbackSubmission && appointmentIcsId) {
      await this.appointmentService.submitIcsFeedback(caseRefId, appointmentIcsId, icsFeedbackSubmission, username)
      delete req.session.icsFeedbackSubmission
      req.session.referralProgressBanner = {
        caseReference: caseRefId,
        heading: 'Session feedback submitted',
        body: 'The ICS is now complete.',
      } as ReferralProgressBannerContent
      res.redirect(`/progress/${caseRefId}`)
    }
  }

  async icsAppointmentAttendance(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params
    const { username } = res.locals.user

    const icsSessionData = await this.appointmentService.getICS(caseRefId.toString(), username)

    const { list } = res.locals.errors
    const attendedItem = list.find(({ href }) => href === '#attended')
    if (attendedItem) {
      attendedItem.text = attendedItem.text.replace('{{ firstname }}', icsSessionData.referralFirstName)
    }
    const record = req.session.icsFeedbackSubmission?.record || {}
    const presenter = new RecordSessionAttendancePresenter(caseRefId.toString(), icsSessionData, record)
    presenter.renderPage(res)
  }

  recordIcsAppointmentAttendance(req: Request, res: Response): Promise<void> {
    return validateRequestBodyAgainstSchema(RecordSessionAttendanceFormDataSchema, req, res, data => {
      if (data) {
        const { caseRefId } = req.params
        req.session.icsFeedbackSubmission = {
          caseReferenceId: caseRefId.toString(),
          record: {
            didSessionHappen: data.happened === 'Yes',
            didPersonAttend: data.happened === 'No' ? data.attended === 'Yes' : true,
          },
        }
        res.redirect(recordAttendanceRedirectUrl(data, caseRefId.toString()))
      }
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

    const { icsFeedbackSubmission } = req.session

    const presenter = new SessionFeedbackPresenter(caseRefId.toString(), icsFeedbackSubmission)
    presenter.renderPage(res)

    return Promise.resolve()
  }

  async submitSessionFeedback(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    const icsAppointment = await this.appointmentService.getICS(caseRefId, username)

    if (!icsAppointment) {
      req.flash('error', 'Appointment not found.')
      res.redirect(`/ics-feedback/${caseRefId}/session-feedback`)
      return
    }

    const { icsFeedbackSubmission } = req.session

    if (!icsFeedbackSubmission || !icsFeedbackSubmission.record) {
      res.redirect(`/progress/${caseRefId}`)
      return
    }

    const savedIcsFeedbackSubmission = {
      ...icsFeedbackSubmission,
      sessionFeedback: {
        whatHappened: req.body.whatDidYouDo || '',
      },
      caseReferenceId: caseRefId,
    }

    req.session.icsFeedbackSubmission = savedIcsFeedbackSubmission

    validateRequestBodyAgainstSchema(SessionFeedbackFormDataSchema, req, res, () => {
      res.redirect(`/ics-feedback/${caseRefId}/check-answers`)
    })
  }

  async checkIcsFeedback(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals
    const { icsFeedbackSubmission } = req.session
    const appointmentData = await this.appointmentService.getICS(caseRefId, username)

    if (icsFeedbackSubmission && caseRefId === icsFeedbackSubmission.caseReferenceId) {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(
        icsFeedbackSubmission,
        caseRefId,
        appointmentData.referralFirstName,
      )
      presenter.renderPage(res)
    } else {
      res.redirect(`/progress/${caseRefId}`)
    }
  }

  private setIcsSuccessfullyScheduledBanner(req: Request, response: AppointmentIcsResponse, id: string): void {
    const date = format(response.appointmentDate, 'dd MMM yyyy')
    const time = timeFormat(response.appointmentTime)

    req.session.referralProgressBanner = {
      caseReference: id,
      heading: 'ICS scheduled',
      body: `The ICS has been scheduled for ${date} at ${time}`,
    } as ReferralProgressBannerContent
  }

  async sessionDetails(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const { icsFeedbackSubmission } = req.session
    const sessionDetails = icsFeedbackSubmission ? icsFeedbackSubmission.sessionDetails : null
    const appointmentData = await this.appointmentService.getICS(caseRefId.toString(), username)

    const validationErrors = formatDynamicErrorMessages(
      res.locals.errors,
      '{{ firstname }}',
      appointmentData.referralFirstName,
    )
    res.locals.errors = validationErrors

    const presenter = new RecordSessionDetailsPresenter(caseRefId, appointmentData, sessionDetails, validationErrors)
    return presenter.renderPage(res)
  }

  recordSessionDetails(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { icsFeedbackSubmission } = req.session
    if (!icsFeedbackSubmission) {
      res.redirect(`/progress/${caseRefId}`)
      return
    }
    icsFeedbackSubmission.sessionDetails = {
      wasPersonLate: req.body.wasPersonLate ? req.body.wasPersonLate === 'Yes' : null,
      lateReason: req.body.lateReason,
      duration: {
        hours: req.body['sessionDuration-hours'],
        minutes: req.body['sessionDuration-minutes'],
      },
    }
    req.session.icsFeedbackSubmission = icsFeedbackSubmission
    validateRequestBodyAgainstSchema(RecordSessionDetailsFormDataSchema, req, res, () => {
      res.redirect(`/ics-feedback/${caseRefId}/session-feedback`)
    })
  }

  async howTheyTriedToContactThePerson(req: Request, res: Response): Promise<void> {
    if (restartFeedback(req, res)) {
      return
    }
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    const { referralFirstName } = await this.appointmentService.getICS(caseRefId.toString(), username)
    const presenter = new HowTheyTriedToContactThePersonPresenter(
      caseRefId,
      referralFirstName,
      req.session.icsFeedbackSubmission,
    )
    presenter.renderPage(res)
  }

  async recordHowTheyTriedToContactThePerson(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    const { referralFirstName } = await this.appointmentService.getICS(caseRefId.toString(), username)

    await validateRequestBodyAgainstSchema(
      icsFeedbackHowTheyTriedToContactThePersonFormDataSchema(referralFirstName),
      req,
      res,
      ({ howTheyTriedToContactThePerson }) => {
        const { icsFeedbackSubmission } = req.session
        const { record } = icsFeedbackSubmission || {}
        const newRecord = { ...record, noAttendanceInformation: howTheyTriedToContactThePerson }
        const newFeedback = { ...icsFeedbackSubmission, record: newRecord }

        req.session.icsFeedbackSubmission = newFeedback

        res.redirect(`/ics-feedback/${caseRefId}/check-answers`)
      },
    )
  }

  async whyDidSessionNotHappen(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const validationErrors: ErrorMiddlewareErrors = res.locals.errors
    const icsFeedbackSubmission = req.session?.icsFeedbackSubmission
    const sessionDetails = icsFeedbackSubmission ? icsFeedbackSubmission.record?.sessionNotHappenReason : null
    const appointmentData = await this.appointmentService.getICS(caseRefId.toString(), username)
    const presenter = new WhyDidSessionNotHappenPresenter(
      caseRefId,
      appointmentData.referralFirstName,
      sessionDetails,
      validationErrors,
    )
    return presenter.renderPage(res)
  }

  recordWhySessionDidNotHappen(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const icsFeedbackSubmission = req.session?.icsFeedbackSubmission
    if (!icsFeedbackSubmission) {
      res.redirect(`/progress/${caseRefId}`)
      return
    }
    const details: string =
      (req.body.whyDidSessionNotHappen === 'SERVICE_PROVIDER_ISSUE' && req.body.serviceProviderIssueDetails) ||
      (req.body.whyDidSessionNotHappen === 'REFERRAL_COULD_NOT_TAKE_PART' &&
        req.body.referralCouldNotTakePartDetails) ||
      (req.body.whyDidSessionNotHappen === 'REFERRAL_DID_NOT_COMPLY' && req.body.referralDidNotComplyDetails) ||
      undefined
    icsFeedbackSubmission.record.sessionNotHappenReason = {
      reason: req.body.whyDidSessionNotHappen,
      details,
    }
    validateRequestBodyAgainstSchema(WhyDidSessionNotHappenFormDataSchema, req, res, () => {
      res.redirect(`/ics-feedback/${caseRefId}/check-answers`)
    })
  }

  async changeIcsDetailsReason(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const { ChangeAppointmentDetails } = req.session
    const validationErrors: ErrorMiddlewareErrors = res.locals.errors
    const appointmentData = await this.appointmentService.getICS(caseRefId.toString(), username)
    const presenter = new ChangeIcsDetailsReasonPresenter(
      caseRefId,
      `${appointmentData.referralFirstName} ${appointmentData.referralLastName}`,
      ChangeAppointmentDetails,
      validationErrors,
    )
    presenter.renderPage(res)
  }

  recordChangeIcsDetailsReason(req: Request, res: Response): void {
    const { caseRefId } = req.params as { caseRefId: string }
    req.session.ChangeAppointmentDetails = {
      requestedBy: req.body.requestedBy,
      reasonForChange: req.body.reasonForChange,
    }
    validateRequestBodyAgainstSchema(ChangeIcsDetailsReasonSchema, req, res, () => {
      return res.redirect(`/referral/${caseRefId}/ics-change-details/check-answers`)
    })
  }

  async changeIcsDetailsCYA(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { caseRefId } = req.params as { caseRefId: string }
    const createAppointmentRequest = req.session?.createAppointmentRequest
    const ChangeAppointmentDetails = req.session?.ChangeAppointmentDetails
    if (!createAppointmentRequest) {
      return res.redirect(`/referral/${caseRefId}/ics-change-details`)
    }
    if (!ChangeAppointmentDetails) {
      return res.redirect(`/referral/${caseRefId}/ics-change-details/reason`)
    }
    const referralInformation = await this.referralService.getReferralInformation(caseRefId, username)
    const additionalDetails: AdditionalInformation = {
      firstName: referralInformation.firstName,
      submitHref: `/referral/${caseRefId}/ics-change-details/submit-ics`,
      scheduleIcsHref: `/referral/${caseRefId}/ics-change-details`,
      changeReasonHref: `/referral/${caseRefId}/ics-change-details/reason`,
    }
    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, additionalDetails, ChangeAppointmentDetails)
    return presenter.renderPage(res)
  }
}

export default AppointmentController

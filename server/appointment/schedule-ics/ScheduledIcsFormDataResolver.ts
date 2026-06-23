import {
  AppointmentIcsResponse,
  CreateAppointmentRequest,
  SessionMethod,
  SessionMethodRequest,
} from '@community-support-api'
import { Request, Response } from 'express'
import { format, parse } from 'date-fns'
import AppointmentValidator from '../AppointmentValidator'
import AppointmentService from '../../services/AppointmentService'

export interface ScheduledIcsFormData {
  sessionDate?: string
  'sessionTime-hour'?: string
  'sessionTime-minute'?: string
  'sessionTime-meridiem'?: string
  sessionTakePlace?: string
  ByPhone?: string
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
        updatedFormData.ByPhone = method.additionalDetails
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
          formData.ByPhone = method.additionalDetails
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

const createMethodSessionData = (method: SessionMethod): SessionMethodRequest => ({
  ...method,
  additionalDetails: method.whyNotInPersonReason || method.probationOfficeName,
})

const createIcsSessionData = ({
  appointmentDate,
  appointmentTime,
  sessionMethod,
  sessionCommunications,
}: AppointmentIcsResponse): CreateAppointmentRequest => ({
  date: appointmentDate,
  time: appointmentTime,
  sessionMethodRequest: createMethodSessionData(sessionMethod),
  sessionCommunication: sessionCommunications,
})

const loadFormFromICS = (ics: AppointmentIcsResponse, validator: AppointmentValidator): ScheduledIcsFormData =>
  loadFormFromSession(createIcsSessionData(ics), validator)

const getReasonFromFormData = (formData: ScheduledIcsFormData, sessionTakePlace: string): string | undefined => {
  switch (sessionTakePlace) {
    case 'ByPhone':
      return formData.ByPhone
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

const getInformedMethodsFromFormData = ({ informedMethods, otherMethodOfContact }: ScheduledIcsFormData): string[] => {
  if (informedMethods.includes('informedByOtherMethod') && otherMethodOfContact) {
    return informedMethods.filter(method => method !== 'informedByOtherMethod').concat(otherMethodOfContact)
  }
  return informedMethods
}

export const saveFormToSession = (formData: ScheduledIcsFormData): CreateAppointmentRequest | undefined => {
  if (!formData) {
    return undefined
  }
  const createAppointmentRequest = {
    date: '',
    time: { hour: 0, amPm: 'AM' },
    sessionMethodRequest: { type: 'PHONE' },
    sessionCommunication: [],
  } as CreateAppointmentRequest

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

export class ScheduledIcsFormDataResolver {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly validator: AppointmentValidator,
  ) {}

  resolve(req: Request, res: Response): Promise<ScheduledIcsFormData | undefined> {
    const existing = req.session?.createAppointmentRequest
    if (existing) {
      return Promise.resolve(loadFormFromSession(existing, this.validator))
    }
    const { username } = res.locals.user
    const caseRefId = req.params.caseRefId as string
    return this.appointmentService
      .getICS(caseRefId, username)
      .then(ics => (ics ? loadFormFromICS(ics, this.validator) : undefined))
      .catch(() => Promise.resolve(undefined))
  }
}

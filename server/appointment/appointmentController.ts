import { Request, Response } from 'express'
import {
  AppointmentIcsResponse,
  ReferralInformation,
  SessionMethod,
  SessionMethodRequest,
  AppointmentTimeResponse,
} from '@community-support-api'
import { format, isBefore, parse } from 'date-fns'
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
import { getChangeRequesterType } from './change-ics-details-reason/ChangeAppointmentDetails'
import { SessionFeedbackFormDataSchema } from '../validation/SessionFeedbackFormData'
import ViewChangeSessionDetailsPresenter from './view-change-session-details/ViewChangeSessionDetailsPresenter'
import RecordSessionDetailsPresenter from './record-ics/RecordSessionDetailsPresenter'
import { RecordSessionDetailsFormDataSchema } from '../validation/RecordSessionDetailsFormData'
import HowTheyTriedToContactThePersonPresenter from './howTheyTriedToContactThePerson/howTheyTriedToContactThePersonPresenter'
import icsFeedbackHowTheyTriedToContactThePersonFormDataSchema from '../validation/icsFeedbackHowTheyTriedToContactThePersonFormDataSchema'
import { validateRequestBodyAgainstSchema, formatDynamicErrorMessages } from '../validation/validationUtils'
import WhyDidSessionNotHappenPresenter from './why-did-session-not-happen/WhyDidSessionNotHappenPresenter'
import { WhyDidSessionNotHappenFormDataSchema } from '../validation/WhyDidSessionNotHappenFormData'
import { IcsFeedbackFormSchema } from '../validation/IcsFeedbackHowSessionTookPlaceFormData'
import buildScheduleIcsAppointmentFormData from '../validation/ScheduleIcsAppointmentFormData'
import ChangeIcsDetailsReasonPresenter from './change-ics-details-reason/ChangeIcsDetailsReasonPresenter'
import { ChangeIcsDetailsReasonSchema } from '../validation/ChangeIcsDetailsReasonFormData'
import { saveFormToSession, ScheduledIcsFormDataResolver } from './schedule-ics/ScheduledIcsFormDataResolver'

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

class AppointmentController {
  private readonly resolver: ScheduledIcsFormDataResolver

  constructor(
    private readonly referralService: ReferralService,
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
  ) {
    this.resolver = new ScheduledIcsFormDataResolver(this.appointmentService, new AppointmentValidator())
  }

  async checkIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { caseRefId } = req.params as { caseRefId: string }
    const createAppointmentRequest = req.session?.createAppointmentRequest
    if (!createAppointmentRequest) {
      return res.redirect(`/referral/${caseRefId}/appointment/schedule-ics`)
    }
    const referralInformation = await this.referralService.getReferralInformation(caseRefId, username)
    const additionalDetails: AdditionalInformation = {
      firstName: referralInformation.firstName,
      lastName: referralInformation.lastName,
      submitHref: `/referral/${caseRefId}/appointment/submit-ics`,
      scheduleIcsHref: `/referral/${caseRefId}/appointment/schedule-ics`,
    }
    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, additionalDetails)
    return presenter.renderPage(res)
  }

  async showScheduleIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const caseRefId = req.params.caseRefId as string
    const [probationOffices, prisons, referralInformation, formData] = await Promise.all([
      this.referenceDataService.getProbationOffices(),
      this.referenceDataService.getPrisons(),
      this.referralService.getReferralInformation(caseRefId, username),
      this.resolver.resolve(req, res),
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

  async showRescheduleIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const caseRefId = req.params.caseRefId as string
    const [probationOffices, prisons, referralInformation, formData] = await Promise.all([
      this.referenceDataService.getProbationOffices(),
      this.referenceDataService.getPrisons(),
      this.referralService.getReferralInformation(caseRefId, username),
      this.resolver.resolve(req, res),
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
    const { caseRefId } = req.params as { caseRefId: string }
    const { schema, referralInformation } = await this.prepareAppointmentRequest(req, username, caseRefId)

    req.body.referralCrn = referralInformation.personIdentifier

    return validateRequestBodyAgainstSchema(schema, req, res, () =>
      res.redirect(`/referral/${caseRefId}/appointment/confirm-ics`),
    )
  }

  async rescheduleIcs(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { caseRefId } = req.params as { caseRefId: string }
    const { schema } = await this.prepareAppointmentRequest(req, username, caseRefId)

    return validateRequestBodyAgainstSchema(schema, req, res, () =>
      res.redirect(`/referral/${caseRefId}/ics-change-details/reason`),
    )
  }

  private async prepareAppointmentRequest(
    req: Request,
    username: string,
    caseRefId: string,
  ): Promise<{
    schema: ReturnType<typeof buildScheduleIcsAppointmentFormData>
    referralInformation: ReferralInformation
  }> {
    const referralInformation = await this.referralService.getReferralInformation(caseRefId, username)
    const schema = buildScheduleIcsAppointmentFormData(new Date(referralInformation.referralDate))
    const informedMethodArr: string[] =
      typeof req.body.informedMethods === 'string' ? [req.body.informedMethods] : req.body.informedMethods

    req.session.createAppointmentRequest = saveFormToSession({
      sessionDate: req.body.sessionDate,
      'sessionTime-hour': req.body['sessionTime-hour'],
      'sessionTime-minute': req.body['sessionTime-minute'],
      'sessionTime-meridiem': req.body['sessionTime-meridiem']?.toLowerCase(),
      sessionTakePlace: req.body.sessionTakePlace,
      ByPhone: req.body.ByPhone,
      ByVideo: req.body.ByVideo,
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

    return {
      schema,
      referralInformation,
    }
  }

  viewOrChangeIcs(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    return this.appointmentService
      .getICS(caseRefId.toString(), username)
      .then(data => new InitialContactSessionDetailsPresenter(data, caseRefId, false))
      .then(presenter => presenter.renderPage(res))
  }

  viewIcsDetails(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const icsId = req.params.icsId as string
    const { username } = res.locals.user
    return this.appointmentService
      .getIcsById(caseRefId.toString(), icsId, username)
      .then(data => new InitialContactSessionDetailsPresenter(data, caseRefId, true))
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
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const createAppointmentRequest = req.session?.createAppointmentRequest

    if (!createAppointmentRequest) {
      return res.redirect(`/referral/${caseRefId}/appointment/schedule-ics`)
    }

    const response = await this.appointmentService.submitICS(caseRefId, createAppointmentRequest, username)

    delete req.session.createAppointmentRequest

    if (this.isRetrospectiveAppointment(response.appointmentDate, response.appointmentTime)) {
      return res.redirect(`/ics-feedback/${caseRefId}/attendance`)
    }

    this.setIcsSuccessfullyScheduledBanner(req, response, caseRefId)

    return res.redirect(`/progress/${caseRefId}`)
  }

  private isRetrospectiveAppointment(appointmentDate: string, appointmentTime: AppointmentTimeResponse): boolean {
    const minutes = appointmentTime.minute.toString().padStart(2, '0')

    const appointmentDateTime = parse(
      `${appointmentDate} ${appointmentTime.hour}:${minutes} ${appointmentTime.amPm.toUpperCase()}`,
      'yyyy-MM-dd h:mm a',
      new Date(),
    )

    return isBefore(appointmentDateTime, new Date())
  }

  async submitFeedback(req: Request, res: Response): Promise<void> {
    const caseRefId = req.params.caseRefId as string
    const { username } = res.locals.user
    const { icsFeedbackSubmission } = req.session

    const { appointmentIcsId } = await this.appointmentService.getICS(caseRefId, username)

    if (icsFeedbackSubmission && appointmentIcsId) {
      await this.appointmentService.submitIcsFeedback(caseRefId, appointmentIcsId, icsFeedbackSubmission, username)
      delete req.session.icsFeedbackSubmission
      this.setReferralProgressBanner(req, caseRefId, 'Session feedback submitted', 'The ICS is now complete.')
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
    res.locals.errors = formatDynamicErrorMessages(res.locals.errors, '{{ firstname }}', icsAppointment.referralFirstName)

    const presenter = new SessionFeedbackPresenter(caseRefId.toString(), icsFeedbackSubmission, icsAppointment.referralFirstName)
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
        behaviour: req.body.behaviour || '',
        strengthsIdentified: req.body.strengthsIdentified || '',
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

  private setReferralProgressBanner(req: Request, id: string, heading: string, body?: string): void {
    req.session.referralProgressBanner = {
      caseReference: id,
      heading,
      ...(body && { body }),
    } as ReferralProgressBannerContent
  }

  private setIcsSuccessfullyScheduledBanner(req: Request, response: AppointmentIcsResponse, id: string): void {
    const date = format(response.appointmentDate, 'd MMMM yyyy')
    const time = timeFormat(response.appointmentTime)

    this.setReferralProgressBanner(req, id, 'ICS scheduled', `The ICS has been scheduled for ${date} at ${time}`)
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
      changeRequestedBy: getChangeRequesterType(req.body.requestedBy),
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
      lastName: referralInformation.lastName,
      submitHref: `/referral/${caseRefId}/ics-change-details/submit-ics`,
      scheduleIcsHref: `/referral/${caseRefId}/ics-change-details`,
      changeReasonHref: `/referral/${caseRefId}/ics-change-details/reason`,
    }
    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, additionalDetails, ChangeAppointmentDetails)
    return presenter.renderPage(res)
  }

  async submitChangeIcsDetails(req: Request, res: Response): Promise<void> {
    const { caseRefId } = req.params as { caseRefId: string }
    const { username } = res.locals.user
    const { createAppointmentRequest, ChangeAppointmentDetails } = req.session

    if (!createAppointmentRequest || !ChangeAppointmentDetails) {
      return res.redirect(`/referral/${caseRefId}/ics-change-details`)
    }

    const response = await this.appointmentService.submitRescheduleICS(
      caseRefId,
      createAppointmentRequest,
      ChangeAppointmentDetails,
      username,
    )

    delete req.session.createAppointmentRequest
    delete req.session.ChangeAppointmentDetails

    if (this.isRetrospectiveAppointment(response.appointmentDate, response.appointmentTime)) {
      return res.redirect(`/ics-feedback/${caseRefId}/attendance`)
    }

    this.setReferralProgressBanner(req, caseRefId, 'The ICS details have been changed')

    return res.redirect(`/progress/${caseRefId}`)
  }
}

export default AppointmentController

import {
  CreateReferralRequest,
  ReferralUserAssignmentResponse,
  CreateAppointmentRequest,
  ReferralInformationDto,
  IcsFeedbackSubmission,
} from '@community-support-api'
import { GovukFrontendErrorSummaryErrorListElement } from '@govuk-frontend'
import { HmppsUser } from '../../interfaces/hmppsUser'
import { ChangeAppointmentDetails } from '../../appointment/change-ics-details-reason/ChangeAppointmentDetails'
import { ReferralProgressBannerContent } from '../../referral/progress/ReferralProgressBannerContent'
import { TaskListState } from '../../referral/taskList/TaskListState'

export interface HowSessionTookPlace {
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON_PROBATION_OFFICE' | 'IN_PERSON_OTHER_LOCATION'
  additionalDetails?: string
  pdu?: string
  addressLine1?: string
  addressLine2?: string
  townOrCity?: string
  county?: string
  postcode?: string
}

export interface IcsFeedbackHowSessionTookPlaceSession {
  howSessionTookPlace?: HowSessionTookPlace
}

export interface SessionFeedbackDetails {
  appointmentId: string
  appointmentDateTime: string
  icsFeedbackId?: string
  rowIndex: number
}

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    formKeys: string[]
    referralCreationDetails: CreateReferralRequest
    assignmentResults: ReferralUserAssignmentResponse
    createAppointmentRequest: CreateAppointmentRequest
    ChangeAppointmentDetails: ChangeAppointmentDetails
    referralInformation: ReferralInformationDto
    pending: Record<string, string>
    referralProgressBanner?: ReferralProgressBannerContent
    icsFeedbackSubmission: IcsFeedbackSubmission & { caseReferenceId: string }
    icsFeedbackInfo: SessionFeedbackDetails[]
    taskList?: TaskListState
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: HmppsUser
      errors: ErrorMiddlewareErrors
    }
  }
}
interface ErrorMiddlewareErrors {
  list: Array<GovukFrontendErrorSummaryErrorListElement>
  messages: Record<string, GovukFrontendErrorMessage>
}

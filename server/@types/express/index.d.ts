import {
  CreateReferralRequest,
  ReferralUserAssignmentResponse,
  CreateAppointmentRequest,
  ReferralInformationDto,
  IcsFeedbackSubmission,
} from '@community-support-api'
import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    formKeys: string[]
    referralCreationDetails: CreateReferralRequest
    assignmentResults: ReferralUserAssignmentResponse
    createAppointmentRequest: CreateAppointmentRequest
    referralInformation: ReferralInformationDto
    icsFeedbackSubmissionsMap: Record<string, IcsFeedbackSubmission>
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
    }
  }
}

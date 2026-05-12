import { CreateAppointmentRequest } from '@community-support-api'
import { GovukFrontendNotificationBanner, GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { ConfirmIcsContent, ConfirmIcsViewModel } from './confirmIcsViewModel'
import { buildIcsSummaryRows, formatAddress } from '../icsDetailsSummaryBuilder'

export type AdditionalInformation = {
  firstName: string
}

export default class ConfirmIcsPresenter extends PresenterBase<ConfirmIcsViewModel, ConfirmIcsContent> {
  constructor(
    private readonly createAppointmentRequest: CreateAppointmentRequest,
    private readonly referralId: string,
    private readonly additionalInformation: AdditionalInformation,
  ) {
    super()
  }

  buildPageContent(res: Response): ConfirmIcsViewModel {
    const viewModel = {} as ConfirmIcsViewModel
    const content = this.buildStaticContent(res)
    viewModel.pageHeader = content.pageHeader
    viewModel.submitButtonText = content.submitButtonText
    viewModel.submitHref = `/referral/${this.referralId}/appointment/submit-ics`
    viewModel.backlinkHref = `/referral/${this.referralId}/appointment/schedule-ics`
    viewModel.icsDetailsSummary = this.buildIcsDetailsSummary()
    if (this.isAppointmentInPast()) {
      viewModel.notificationBanner = this.buildPastAppointmentBanner()
    }
    return viewModel
  }

  getTemplatePath(): string {
    return 'appointment/confirmIcs'
  }

  private formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  private formatTime(time: { hour: number; minute?: number; amPm: string }): string {
    const minute = time.minute !== undefined ? String(time.minute).padStart(2, '0') : '00'
    return `${time.hour}:${minute}${time.amPm.toLowerCase()}`
  }

  private formatSessionMethod(type: string): string {
    const methods: Record<string, string> = {
      PHONE: 'Phone call',
      VIDEO: 'Video call',
      PROBATION_OFFICE: 'In person',
      OTHER_LOCATION: 'Other location',
    }
    return methods[type] ?? type
  }

  private formatSessionCommunication(input: string): string {
    const communications: Record<string, string> = {
      informedByPhone: 'Phone call',
      informedByEmail: 'Email',
      informedByTextMessage: 'Text message',
    }
    return communications[input] ?? input
  }

  private buildIcsDetailsSummary(): GovukFrontendSummaryList {
    const { date, time, sessionMethodRequest, sessionCommunication } = this.createAppointmentRequest
    const isNotInPerson = sessionMethodRequest.type === 'PHONE' || sessionMethodRequest.type === 'VIDEO'
    const isInPerson =
      sessionMethodRequest.type === 'PROBATION_OFFICE' || sessionMethodRequest.type === 'OTHER_LOCATION'

    let locationValue: { text: string } | { html: string } | undefined
    if (isInPerson) {
      locationValue =
        sessionMethodRequest.type === 'PROBATION_OFFICE'
          ? { text: 'Probation office' }
          : { html: formatAddress(sessionMethodRequest) }
    }

    const rows = buildIcsSummaryRows({
      formattedDate: this.formatDate(date),
      formattedTime: this.formatTime(time),
      methodDisplay: this.formatSessionMethod(sessionMethodRequest.type),
      reason: isNotInPerson ? sessionMethodRequest.additionalDetails : null,
      locationValue,
      personFirstName: this.additionalInformation.firstName,
      communicationsDisplay: sessionCommunication.map(c => this.formatSessionCommunication(c)).join(', '),
    })

    return {
      card: {
        title: { text: 'ICS details' },
        actions: {
          items: [
            {
              href: `/referral/${this.referralId}/appointment/schedule-ics`,
              text: 'Change',
              visuallyHiddenText: 'ICS details',
            },
          ],
        },
      },
      rows,
    }
  }

  private isAppointmentInPast(): boolean {
    const { date, time } = this.createAppointmentRequest
    const [year, month, day] = date.split('-').map(Number)
    let { hour } = time
    if (time.amPm.toLowerCase() === 'pm' && hour !== 12) hour += 12
    if (time.amPm.toLowerCase() === 'am' && hour === 12) hour = 0
    const appointmentDate = new Date(year, month - 1, day, hour, time.minute ?? 0)
    return appointmentDate < new Date()
  }

  private buildPastAppointmentBanner(): GovukFrontendNotificationBanner {
    return {
      html: `<p class="govuk-notification-banner__heading">You've chosen a date and time in the past</p><p class="govuk-body">If you're logging a session that's already happened, you must add the attendance feedback next.</p><p class="govuk-body">If you meant to enter a date and time in the future, select change and enter the correct information.</p>`,
    }
  }
}

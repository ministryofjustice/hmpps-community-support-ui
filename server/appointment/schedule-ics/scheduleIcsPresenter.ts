import { Response } from 'express'
import { ProbationOffice, CreateAppointmentRequest, ReferralInformation } from '@community-support-api'
import { Prison } from '@prison-api'
import PresenterBase from '../../presenter/presenterBase'
import { ScheduleIcsContent, ScheduleIcsViewModel, SelectItem } from './scheduleIcsViewModel'

export interface ValidationError {
  key: string
  message: string
}

export default class ScheduleIcsPresenter extends PresenterBase<ScheduleIcsViewModel, ScheduleIcsContent> {
  constructor(
    private readonly referralId: string,
    private readonly probationOffices: ProbationOffice[],
    private readonly prisons: Prison[],
    private readonly referralInformation: ReferralInformation,
    private readonly createAppointmentRequest?: CreateAppointmentRequest,
    private readonly validationErrors?: Record<string, { text: string }>,
  ) {
    super()
  }

  private buildProbationOfficesSelectItems(): SelectItem[] {
    return (this.probationOffices ?? []).map(office => ({
      value: office.probationOfficeId,
      text: office.name,
    }))
  }

  private buildPrisonsSelectItems(): SelectItem[] {
    return (this.prisons ?? []).map(prison => ({
      value: prison.agencyId,
      text: prison.description,
    }))
  }

  private isIdentifierACrn(id: string): boolean {
    const cleaned = id.trim().toUpperCase()

    if (cleaned.length === 7 && /^[A-Z]\d{6}$/.test(cleaned)) {
      return true
    }
    return false
  }

  private isIdentifierAPrisonNumber(id: string): boolean {
    const cleaned = id.trim().toUpperCase()

    if (cleaned.length === 7 && /^[A-Z]\d{4}[A-Z]{2}$/.test(cleaned)) {
      return true
    }
    return false
  }

  private isPersonInCommunity(): boolean {
    return this.isIdentifierACrn(this.referralInformation.crn)
    return true
  }

  buildPageContent(res: Response): ScheduleIcsViewModel {
    const viewModel = {} as ScheduleIcsViewModel
    const content = this.buildStaticContent(res)
    viewModel.pageHeader = content.pageHeader
    viewModel.submitButtonText = content.submitButtonText
    viewModel.submitHref = `/referral/${this.referralId}/appointment/schedule-ics`
    viewModel.backlinkHref = `/referral/${this.referralId}/appointment/schedule-ics`
    viewModel.probationOfficesSelectItems = this.buildProbationOfficesSelectItems()
    viewModel.prisonsSelectItems = this.buildPrisonsSelectItems()
    viewModel.isPersonInCommunity = this.isPersonInCommunity()
    viewModel.firstName = this.referralInformation.firstName
    viewModel.errors = this.validationErrors
    viewModel.errorList = Object.entries(viewModel.errors ?? {}).map(([key, error]) => ({
      href: `#${key}`,
      text: error.text,
    }))
    return viewModel
  }

  getTemplatePath(): string {
    return 'appointment/scheduleIcs'
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
}

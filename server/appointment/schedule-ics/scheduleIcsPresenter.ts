import { Response } from 'express'
import { ProbationOffice, ReferralInformation } from '@community-support-api'
import { Prison } from '@prison-api'
import PresenterBase from '../../presenter/presenterBase'
import { ScheduleIcsContent, ScheduleIcsViewModel, SelectItem, ScheduleFormData } from './scheduleIcsViewModel'
import isIdentifierACrn from '../../utils/isIdentifierACrn'

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
    private readonly formData?: ScheduleFormData,
    private readonly validationErrors?: Record<string, { text: string }>,
  ) {
    super()
  }

  private buildProbationOfficesSelectItems(): SelectItem[] {
    const defaultItem = [
      {
        value: '',
        text: 'Select probation office',
      },
    ]
    return [
      ...defaultItem,
      ...(this.probationOffices ?? []).map(office => ({
        value: `${office.probationOfficeId}`,
        text: office.name,
        selected: this.formData?.probationOffice === `${office.probationOfficeId}`,
      })),
    ]
  }

  private buildPrisonsSelectItems(): SelectItem[] {
    const defaultItem = [
      {
        value: '',
        text: 'Select prison',
      },
    ]
    return [
      ...defaultItem,
      ...(this.prisons ?? []).map(prison => ({
        value: `${prison.agencyId}`,
        text: prison.description,
        selected: this.formData?.prison === `${prison.agencyId}`,
      })),
    ]
  }

  private isPersonInCommunity(): boolean {
    return isIdentifierACrn(this.referralInformation.crn)
  }

  buildPageContent(res: Response): ScheduleIcsViewModel {
    const viewModel = {} as ScheduleIcsViewModel
    const content = this.buildStaticContent(res)
    viewModel.pageHeader = content.pageHeader
    viewModel.submitButtonText = content.submitButtonText
    viewModel.submitHref = `/referral/${this.referralId}/appointment/schedule-ics`
    viewModel.backlinkHref = `/referral-details/${this.referralId}/progress`
    viewModel.probationOfficesSelectItems = this.buildProbationOfficesSelectItems()
    viewModel.prisonsSelectItems = this.buildPrisonsSelectItems()
    viewModel.serviceName = this.referralInformation.communityServiceProviderName
    viewModel.isPersonInCommunity = this.isPersonInCommunity()
    viewModel.firstName = this.referralInformation.firstName
    viewModel.formData = this.formData
    viewModel.errors = this.validationErrors
    viewModel.errorList = Object.entries(viewModel.errors ?? {}).map(([key, error]) => ({
      href: `#${key}`,
      text: error.text,
    }))
    return viewModel
  }

  getTemplatePath(): string {
    return 'appointment/scheduleIcsAppointment'
  }
}

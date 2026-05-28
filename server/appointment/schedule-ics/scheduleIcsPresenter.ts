import { Response } from 'express'
import { ProbationOffice, ReferralInformation } from '@community-support-api'
import { Prison } from '@prison-api'
import PresenterBase from '../../presenter/presenterBase'
import { ScheduleIcsContent, ScheduleIcsViewModel, SelectItem, ScheduleFormData } from './scheduleIcsViewModel'
import isIdentifierACrn from '../../utils/isIdentifierACrn'
import { ErrorMiddlewareErrors } from '../../@types/express'

export interface ValidationError {
  key: string
  message: string
}

export default class ScheduleIcsPresenter extends PresenterBase<ScheduleIcsViewModel, ScheduleIcsContent> {
  constructor(
    private readonly caseReference: string,
    private readonly probationOffices: ProbationOffice[],
    private readonly prisons: Prison[],
    private readonly referralInformation: ReferralInformation,
    private readonly formData?: ScheduleFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
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
        value: office.name,
        text: office.name,
        selected: this.formData?.probationOffice === office.name,
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
    viewModel.submitHref = `/referral/${this.caseReference}/appointment/schedule-ics`
    viewModel.backLink = { href: `/progress/${this.caseReference}` }
    viewModel.probationOfficesSelectItems = this.buildProbationOfficesSelectItems()
    viewModel.prisonsSelectItems = this.buildPrisonsSelectItems()
    viewModel.serviceName = this.referralInformation.communityServiceProviderName
    viewModel.isPersonInCommunity = this.isPersonInCommunity()
    viewModel.firstName = this.referralInformation.firstName
    viewModel.formData = this.formData
    viewModel.errors = this.validationErrors
    return viewModel
  }

  getTemplatePath(): string {
    return 'appointment/scheduleIcsAppointment'
  }
}

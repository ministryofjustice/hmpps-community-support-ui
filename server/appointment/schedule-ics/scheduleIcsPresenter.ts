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

  buildPageContent(res: Response): ScheduleIcsViewModel {
    const content = this.buildStaticContent(res)
    const submitHref = content.submitHref.replace('{{ caseRef }}', this.caseReference)
    const backLinkHref = content.backLink.replace('{{ caseRef }}', this.caseReference)
    return {
      pageHeader: content.pageHeader,
      submitButtonText: content.submitButtonText,
      submitHref,
      backLink: { href: backLinkHref },
      probationOfficesSelectItems: this.buildProbationOfficesSelectItems(),
      prisonsSelectItems: this.buildPrisonsSelectItems(),
      serviceName: this.referralInformation.communityServiceProviderName,
      isPersonInCommunity: isIdentifierACrn(this.referralInformation.crn),
      firstName: this.referralInformation.firstName,
      formData: this.formData,
      errors: this.validationErrors,
      errorList: Object.entries(this.validationErrors ?? {}).map(([key, error]) => ({
        href: `#${key}`,
        text: error.text,
      })),
    }
  }

  getTemplatePath(): string {
    return 'appointment/scheduleIcsAppointment'
  }
}

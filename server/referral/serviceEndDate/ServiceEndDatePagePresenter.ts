import { Response } from 'express'
import { ServiceEndDatePageDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ServiceEndDatePageViewModel, ServiceEndDatePageContent } from './ServiceEndDatePageModel'

export default class ServiceEndDatePagePresenter extends PresenterBase<
  ServiceEndDatePageViewModel,
  ServiceEndDatePageContent
> {
  constructor(private readonly data: ServiceEndDatePageDto) {
    super()
  }

  buildViewModel(res: Response): ServiceEndDatePageViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      hint: content.hint,
      dateLabel: content.dateLabel,
      reasonLabel: content.reasonLabel,
      reasonHint: content.reasonHint,
      backLink: {
        href: content.backLink,
      },
      targetServiceCompletionDate: this.data.target_service_completion_date,
      targetServiceCompletionReason: this.data.target_service_completion_reason,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/service-end-date'
  }
}

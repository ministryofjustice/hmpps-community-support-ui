import { Response } from 'express'
import { ServiceDaysPageDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ServiceDaysPageViewModel, ServiceDaysPageContent } from './ServiceDaysPageModel'

export default class ServiceDaysPagePresenter extends PresenterBase<ServiceDaysPageViewModel, ServiceDaysPageContent> {
  constructor(
    private readonly data: ServiceDaysPageDto,
    private readonly formData?: { serviceDays?: string },
  ) {
    super()
  }

  getTemplatePath(): string {
    return 'referral/service-days'
  }

  protected buildStaticContent(res: Response): ServiceDaysPageContent {
    const { content } = res.locals
    return content as ServiceDaysPageContent
  }

  protected buildViewModel(res: Response): ServiceDaysPageViewModel {
    const content = this.buildStaticContent(res)
    const serviceDays = this.formData?.serviceDays ?? this.data.service_days

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      hint: content.hint,
      backLink: {
        href: content.backLink,
      },
      button: {
        text: content.continueButton,
      },
      input: {
        id: 'service_days',
        name: 'service_days',
        type: 'text',
        classes: 'govuk-input--width-2',
        value: serviceDays ? serviceDays.toString() : '',
        label: {
          text: content.label,
        },
        errorMessage: res.locals.errors?.messages?.service_days,
      },
    }
  }
}

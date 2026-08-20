import { Response } from 'express'
import { ServiceDaysPageDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ServiceDaysPageViewModel, ServiceDaysPageContent } from './ServiceDaysPageModel'
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class ServiceDaysPagePresenter extends PresenterBase<ServiceDaysPageViewModel, ServiceDaysPageContent> {
  constructor(
    private readonly data: ServiceDaysPageDto,
    private readonly validationErrors: ErrorMiddlewareErrors,
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

  buildViewModel(res: Response): ServiceDaysPageViewModel {
    const content = this.buildStaticContent(res)
    const serviceDays = this.formData?.serviceDays ?? this.data.service_days

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      bodyText1: content.bodyText1,
      backLink: {
        href: content.backLink,
      },
      button: {
        text: content.continueButton,
      },
      input: {
        id: 'serviceDays',
        name: 'serviceDays',
        type: 'text',
        classes: 'govuk-input--width-2',
        value: serviceDays ? serviceDays.toString() : '',
        label: {
          text: content.bodyText2,
        },
        errorMessage: this.validationErrors.messages['serviceDays'] ?? null,
        attributes: {
          'data-testid': 'service-days-input',
        },
      },
    }
  }
}

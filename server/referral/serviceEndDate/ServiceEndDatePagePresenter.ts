import { ServiceEndDatePageDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ServiceEndDatePageViewModel, ServiceEndDateFormValues } from './ServiceEndDatePageModel'

const toFormValues = (
  targetServiceCompletionDate?: string,
  targetServiceCompletionReason?: string,
): ServiceEndDateFormValues => {
  const parsedDate = new Date(targetServiceCompletionDate)
  const formValues =
    !targetServiceCompletionDate || Number.isNaN(parsedDate.valueOf())
      ? {
          day: undefined,
          month: undefined,
          year: undefined,
          reason: targetServiceCompletionReason,
        }
      : {
          day: String(parsedDate.getDate()),
          month: String(parsedDate.getMonth() + 1),
          year: String(parsedDate.getFullYear()),
          reason: targetServiceCompletionReason,
        }
  return formValues
}

export default class ServiceEndDatePagePresenter extends PresenterBase<ServiceEndDatePageViewModel> {
  constructor(
    private readonly data: ServiceEndDatePageDto,
    private readonly formValues?: ServiceEndDateFormValues,
  ) {
    super()
  }

  buildViewModel(): ServiceEndDatePageViewModel {
    const content = this.globalContent().referral.taskList.serviceEndDate

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      dateHint: content.dateHint,
      reasonLabel: content.reasonLabel,
      continueButton: content.continueButton,
      backLink: {
        href: content.backLink,
      },
      formValues:
        this.formValues ??
        toFormValues(this.data.target_service_completion_date, this.data.target_service_completion_reason),
    }
  }

  protected getTemplatePath(): string {
    return 'referral/service-end-date'
  }
}

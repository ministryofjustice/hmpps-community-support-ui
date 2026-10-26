import { Response } from 'express'
import { GovukFrontendButton } from '@govuk-frontend'
import ActionPlanLayoutPresenter, { ActionPlanNavigationValues } from '../actionPlanLayoutPresenter'
import { ServiceDeliveryContent, ServiceDeliveryViewModel } from './serviceDeliveryViewModel'
import { ReferralNavigationValues } from '../../referralLayout/referralLayoutPresenter'

export default class ServiceDeliveryPresenter extends ActionPlanLayoutPresenter<
  ServiceDeliveryViewModel,
  ServiceDeliveryContent
> {
  constructor(private readonly caseReference: string) {
    super(ReferralNavigationValues.actionPlanTab, ActionPlanNavigationValues.serviceDeliveryTab, caseReference)
  }

  protected buildViewModel(res: Response): ServiceDeliveryViewModel {
    const content = this.buildStaticContent(res)

    const updatedAtText = ''

    const subNavigationArgs = this.getMojSubNavigationArgs(content)

    const horizontalSubNavArgs = this.getHorizontalSubNavArgs(content)

    const addAnotherOutcomeButton: GovukFrontendButton = {
      href: `/referral/${this.caseReference}/action-plan/select-a-need`,
      text: content.addAnotherOutcomeText,
      classes: 'govuk-button--secondary govuk-!-margin-right-2',
    }

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/progress/${this.caseReference}` },
      updatedAtText,
      addAnotherOutcomeButton,
      subNavigationArgs,
      horizontalSubNavArgs,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/serviceDelivery'
  }
}

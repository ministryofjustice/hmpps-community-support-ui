import { Response } from 'express'
import { GovukFrontendRadios } from '@govuk-frontend'
import { ActionPlanSelectOutcomeContent, ActionPlanSelectOutcomeViewModel } from './actionPlanSelectOutcomeViewModel'
import PresenterBase from '../../../presenter/presenterBase'

export default class ActionPlanSelectOutcomePresenter extends PresenterBase<
  ActionPlanSelectOutcomeViewModel,
  ActionPlanSelectOutcomeContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly fullName: string,
  ) {
    super()
  }

  private buildSelectOutcomeRadio(content: ActionPlanSelectOutcomeContent): GovukFrontendRadios {
    return {
      name: 'selectOutcomeRadio',
      fieldset: {
        legend: {
          text: content.pageHeader.replace('{{ fullName }}', this.fullName),
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      hint: { text: content.selectOutcomeHint },
      items: [
        { text: 'item1', value: 'item1' },
        { text: 'item2', value: 'item2' },
      ],
    }
  }

  protected buildViewModel(res: Response): ActionPlanSelectOutcomeViewModel {
    const content = this.buildStaticContent(res)

    return {
      backLink: { href: `/referral/${this.caseReference}/action-plan/needs` },
      selectOutcomeRadio: this.buildSelectOutcomeRadio(content),
      continueButton: { text: content.continueButtonText },
      continueButtonLink: `/referral/${this.caseReference}/action-plan/select-an-outcome`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanSelectOutcome'
  }
}

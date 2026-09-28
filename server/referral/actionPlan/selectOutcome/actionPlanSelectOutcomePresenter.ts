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
    private readonly outcomes: Array<{ id: string; text: string }>,
    private readonly selectedOutcomeId?: string,
  ) {
    super()
  }

  private buildSelectOutcomeRadio(
    content: ActionPlanSelectOutcomeContent,
    errorMessage?: { text: string },
  ): GovukFrontendRadios {
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
      errorMessage,
      items: this.outcomes.map(outcome => ({
        text: outcome.text,
        value: outcome.id,
        checked: outcome.id === this.selectedOutcomeId,
      })),
    }
  }

  protected buildViewModel(res: Response): ActionPlanSelectOutcomeViewModel {
    const content = this.buildStaticContent(res)

    return {
      backLink: { href: `/referral/${this.caseReference}/action-plan/select-a-need` },
      selectOutcomeRadio: this.buildSelectOutcomeRadio(content, res.locals.errors?.messages.selectOutcomeRadio),
      continueButton: { text: content.continueButtonText },
      continueButtonLink: `/referral/${this.caseReference}/action-plan/select-an-outcome`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanSelectOutcome'
  }
}

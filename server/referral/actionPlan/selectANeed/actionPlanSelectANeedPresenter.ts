import { Response } from 'express'
import { GovukFrontendRadios } from '@govuk-frontend'
import { ActionPlanSelectANeedNeed } from '@community-support-api'
import PresenterBase from '../../../presenter/presenterBase'
import { ActionPlanSelectANeedContent, ActionPlanSelectANeedViewModel } from './actionPlanSelectANeedViewModel'

export default class ActionPlanSelectANeedPresenter extends PresenterBase<
  ActionPlanSelectANeedViewModel,
  ActionPlanSelectANeedContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly needs: ActionPlanSelectANeedNeed[],
    private readonly selectedNeedId?: string,
  ) {
    super()
  }

  private buildWhichNeedsRadio(content: ActionPlanSelectANeedContent): GovukFrontendRadios {
    return {
      name: 'needId',
      fieldset: {
        legend: {
          text: content.whichNeedTitle,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: { text: content.whichNeedHint },
      items: this.needs
        .filter(need => (need.outcomes?.length ?? 0) > 0)
        .map(need => ({
          text: need.label,
          value: need.id,
          checked: need.id === this.selectedNeedId,
        })),
    }
  }

  protected buildViewModel(res: Response): ActionPlanSelectANeedViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan` },
      whichNeedsRadio: this.buildWhichNeedsRadio(content),
      continueButton: { text: content.continueButtonText },
      continueButtonLink: `/referral/${this.caseReference}/action-plan/select-a-need`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanSelectANeed'
  }
}

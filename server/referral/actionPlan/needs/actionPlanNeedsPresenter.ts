import { Response } from 'express'
import { GovukFrontendRadios } from '@govuk-frontend'
import PresenterBase from '../../../presenter/presenterBase'
import { ActionPlanNeedsContent, ActionPlanNeedsViewModel } from './actionPlanNeedsViewModel'

export default class ActionPlanNeedsPresenter extends PresenterBase<ActionPlanNeedsViewModel, ActionPlanNeedsContent> {
  constructor(private readonly caseReference: string) {
    super()
  }

  private buildWhichNeedsRadio(content: ActionPlanNeedsContent): GovukFrontendRadios {
    return {
      name: 'whichNeedsRadio',
      fieldset: {
        legend: {
          text: content.whichNeedTitle,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: { text: content.whichNeedHint },
      items: [
        { text: 'item1', value: 'item1' },
        { text: 'item2', value: 'item1' },
      ],
    }
  }

  protected buildViewModel(res: Response): ActionPlanNeedsViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan` },
      whichNeedsRadio: this.buildWhichNeedsRadio(content),
      continueButton: { text: content.continueButtonText },
      continueButtonLink: `/referral/${this.caseReference}/action-plan/needs`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanNeeds'
  }
}

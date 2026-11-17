import { Response } from 'express'
import PresenterBase from '../../../presenter/presenterBase'
import { ActionPlanRemoveActivityViewModel } from './actionPlanRemoveActivityViewModel'

export default class ActionPlanRemoveActivityPresenter extends PresenterBase<ActionPlanRemoveActivityViewModel> {
  constructor(
    private readonly caseReference: string,
    private readonly activityIndex: number,
    private readonly isOnlyActivity: boolean,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanRemoveActivityViewModel {
    const content = this.buildStaticContent()['/referral/:id/action-plan/activities/remove']

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan/activities` },
      removeActivityRadio: {
        name: 'removeActivity',
        fieldset: {
          legend: { text: content.pageHeader, isPageHeading: true, classes: 'govuk-fieldset__legend--l' },
        },
        hint: this.isOnlyActivity ? { text: content.onlyActivityHint } : null,
        errorMessage: res.locals.errors?.messages.removeActivity,
        items: [
          { text: content.yesOptionText, value: 'yes' },
          { text: content.noOptionText, value: 'no' },
        ],
      },
      saveAndContinueButton: { text: content.saveAndContinueButtonText, type: 'submit' },
      formAction: `/referral/${this.caseReference}/action-plan/activities/remove?activityIndex=${this.activityIndex}`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanRemoveActivity'
  }
}

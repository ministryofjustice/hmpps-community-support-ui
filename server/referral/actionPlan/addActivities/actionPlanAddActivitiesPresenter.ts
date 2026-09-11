import { Response } from 'express'
import PresenterBase from '../../../presenter/presenterBase'
import { ActionPlanAddActivitiesContent, ActionPlanAddActivitiesViewModel } from './actionPlanAddActivitiesViewModel'

export default class ActionPlanAddActivitiesPresenter extends PresenterBase<
  ActionPlanAddActivitiesViewModel,
  ActionPlanAddActivitiesContent
> {
  constructor(private readonly caseReference: string) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanAddActivitiesViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan/select-an-outcome` },
      addAnotherActivityButton: {
        text: content.addAnotherActivityButtonText,
        classes: 'govuk-button--secondary govuk-!-margin-bottom-4',
      },
      addAnotherActivityLink: `/referral/${this.caseReference}/action-plan/add-activity`,
      saveAndContinueButton: { text: content.saveAndContinueButtonText },
      saveAndContinueLink: `/referral/${this.caseReference}/action-plan/save-activities`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanAddActivities'
  }
}

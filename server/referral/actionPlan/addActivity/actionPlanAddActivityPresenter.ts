import { Response } from 'express'
import PresenterBase from '../../../presenter/presenterBase'
import { escapeHtml } from '../../../utils/utils'
import { ActionPlanAddActivityContent, ActionPlanAddActivityViewModel } from './actionPlanAddActivityViewModel'

export default class ActionPlanAddActivityPresenter extends PresenterBase<
  ActionPlanAddActivityViewModel,
  ActionPlanAddActivityContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly selectedNeedLabel: string,
    private readonly selectedOutcomeText: string,
    private readonly activity?: { activityProvider: string; activityDescription: string },
    private readonly activityIndex?: number,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanAddActivityViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan/activities` },
      selectedNeedAndOutcomeInset: {
        html: `${content.areaOfNeedLabel}: <strong>${escapeHtml(this.selectedNeedLabel)}</strong><br>${content.outcomeLabel}: <strong>${escapeHtml(this.selectedOutcomeText)}</strong>`,
      },
      activityProviderInput: {
        id: 'activityProvider',
        name: 'activityProvider',
        label: { text: content.activityProviderLabel, classes: 'govuk-label--m' },
        hint: { text: content.activityProviderHint },
        value: this.activity?.activityProvider ?? '',
      },
      activityDescriptionTextarea: {
        id: 'activityDescription',
        name: 'activityDescription',
        label: { text: content.activityDescriptionLabel, classes: 'govuk-label--m' },
        value: this.activity?.activityDescription ?? '',
      },
      activityIndex: this.activityIndex,
      saveAndContinueButton: { text: content.saveAndContinueButtonText, type: 'submit' },
      saveAndContinueLink: `/referral/${this.caseReference}/action-plan/activities/add`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanAddActivity'
  }
}

import { Response } from 'express'
import { GovukFrontendTable, GovukFrontendTableRow } from '@govuk-frontend'
import PresenterBase from '../../../presenter/presenterBase'
import { escapeHtml } from '../../../utils/utils'
import { ActionPlanViewActivitiesContent, ActionPlanViewActivitiesViewModel } from './actionPlanViewActivitiesViewModel'

type ActionPlanActivity = { activityProvider: string; activityDescription: string }

export default class ActionPlanViewActivitiesPresenter extends PresenterBase<
  ActionPlanViewActivitiesViewModel,
  ActionPlanViewActivitiesContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly selectedNeedLabel: string,
    private readonly selectedOutcomeText: string,
    private readonly activities: ActionPlanActivity[],
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanViewActivitiesViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan/select-an-outcome` },
      selectedNeedAndOutcomeInset: {
        html: `${content.areaOfNeedLabel}: <strong>${escapeHtml(this.selectedNeedLabel)}</strong><br>${content.outcomeLabel}: <strong>${escapeHtml(this.selectedOutcomeText)}</strong>`,
      },
      activitiesTable: this.buildActivitiesTable(content),
      addAnotherActivityRadio: {
        name: 'addAnotherActivity',
        fieldset: {
          legend: {
            text: content.addAnotherActivityQuestion,
            classes: 'govuk-fieldset__legend--m',
          },
        },
        errorMessage: res.locals.errors?.messages.addAnotherActivity,
        items: [
          { text: content.yesOptionText, value: 'yes' },
          { text: content.noOptionText, value: 'no' },
        ],
      },
      saveAndContinueButton: { text: content.saveAndContinueButtonText },
      saveAndContinueLink: `/referral/${this.caseReference}/action-plan/save-activities`,
    }
  }

  private buildActivitiesTable(content: ActionPlanViewActivitiesContent): GovukFrontendTable {
    const rows: GovukFrontendTableRow[] = this.activities.map((activity, index) => {
      const editHref = `/referral/${this.caseReference}/action-plan/activities/add?activityIndex=${index}`
      const removeHref = `/referral/${this.caseReference}/action-plan/activities/${index}/remove`
      const actionLinks = `<a class="govuk-link" href="${escapeHtml(editHref)}">${escapeHtml(content.changeActionText)}</a><a class="govuk-link govuk-!-margin-left-2" href="${escapeHtml(removeHref)}">${escapeHtml(content.removeActionText)}</a>`

      return [{ text: activity.activityProvider }, { text: activity.activityDescription }, { html: actionLinks }]
    })

    return {
      head: [
        { text: content.activityProviderHeading },
        { text: content.activityDetailsHeading },
        { text: content.actionsHeading },
      ],
      rows,
      attributes: { 'data-testid': 'action-plan-activities-table' },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanViewActivities'
  }
}

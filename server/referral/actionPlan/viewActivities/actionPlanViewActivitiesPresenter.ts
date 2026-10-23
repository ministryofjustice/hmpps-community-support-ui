import { Response } from 'express'
import { GovukFrontendTable, GovukFrontendTableRow } from '@govuk-frontend'
import { MojAlert } from '@moj-frontend'
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
    private readonly alertType?: 'ADD' | 'REMOVE',
    private readonly firstName?: string,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanViewActivitiesViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      alert: this.buildAlert(content, this.firstName, this.alertType),
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

  private buildAlert(
    content: ActionPlanViewActivitiesContent,
    firstName?: string,
    alertType?: 'ADD' | 'REMOVE',
  ): MojAlert | undefined {
    if (!firstName) return undefined

    let message: string | undefined
    switch (alertType) {
      case 'ADD':
        message = content.addActivityNotificationText
        break
      case 'REMOVE':
        message = content.removeActivityNotificationText
        break
      default:
        return undefined
    }
    if (!message) return undefined

    return {
      variant: 'success',
      html: `<p class="govuk-body">${message.replace('{{ firstName }}', escapeHtml(firstName))}</p>`,
      dismissible: true,
    }
  }

  private buildActivitiesTable(content: ActionPlanViewActivitiesContent): GovukFrontendTable {
    const rows: GovukFrontendTableRow[] = this.activities.map((activity, index) => {
      const editHref = `/referral/${this.caseReference}/action-plan/activities/add?activityIndex=${index}`
      const removeHref = `/referral/${this.caseReference}/action-plan/activities/remove?activityIndex=${index}`
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

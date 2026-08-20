import { ActionPlanSummaryDto } from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ActionPlanContent, ActionPlanViewModel } from './actionPlanViewModel'

export default class ActionPlanPresenter extends PresenterBase<ActionPlanViewModel, ActionPlanContent> {
  constructor(
    private readonly actionPlanSummary: ActionPlanSummaryDto,
    private readonly caseReference: string,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader.replace('{{ fullName }}', this.actionPlanSummary.personDetails.fullName),
      backLink: { href: `/progress/${this.caseReference}` },
      needsSummary: this.buildNeedsSummary(content),
    }
  }

  private buildNeedsSummary(content: ActionPlanContent): GovukFrontendSummaryList {
    return {
      rows: [
        {
          key: { text: content.needsRowTitle },
          // Hard-coded to "In progress" for now, but we'll take this from the API later
          value: { html: `<strong class="govuk-tag govuk-tag--blue">In progress</strong>` },
          actions: {
            items: [
              {
                href: `/referral/${this.caseReference}/action-plan/needs`,
                text: content.needsRowLinkText,
                visuallyHiddenText: content.needsRowTitle,
              },
            ],
          },
        },
      ],
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlan'
  }
}

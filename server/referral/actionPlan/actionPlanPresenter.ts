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
    const { fullName } = this.actionPlanSummary.personDetails

    // const needsSummary = this.buildNeedsSummary(content)
    const needsSummary: GovukFrontendSummaryList = undefined

    const createButton = needsSummary ? undefined : { text: content.createButtonText }

    return {
      pageHeader: content.pageHeader.replace('{{ fullName }}', fullName),
      backLink: { href: `/progress/${this.caseReference}` },
      needsSummary,
      createButton,
      createLink: `/referral/${this.caseReference}/action-plan/create`,
      noActionPlanText: needsSummary ? undefined : content.noActionPlanText.replace('{{ fullName }}', fullName),
    }
  }

  private buildNeedsSummary(content: ActionPlanContent): GovukFrontendSummaryList {
    return {
      rows: [
        {
          key: { text: content.needsRowTitle },
          // Hard-coded to "In progress" for now, but we'll take this from the API later
          value: { html: `<strong class="govuk-tag govuk-tag--blue">In progress</strong>` },
        },
      ],
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlan'
  }
}

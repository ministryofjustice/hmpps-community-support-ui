import { ActionPlanSummaryDto } from '@community-support-api'
import { Response } from 'express'
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
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlan'
  }
}

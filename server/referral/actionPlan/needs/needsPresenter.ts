import { Response } from 'express'
import PresenterBase from '../../../presenter/presenterBase'
import { NeedsContent, NeedsViewModel } from './needsViewModel'

export default class NeedsPresenter extends PresenterBase<NeedsViewModel, NeedsContent> {
  constructor(private readonly caseReference: string) {
    super()
  }

  protected buildViewModel(res: Response): NeedsViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan` },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/needs'
  }
}

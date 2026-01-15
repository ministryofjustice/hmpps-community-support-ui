import { Response, Request, NextFunction } from 'express'
import { Person } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { FoundPersonViewModel } from './foundPersonViewModel'
import ViewUtils from '../../utils/viewUtils'

export default class FoundPersonPresenter extends PresenterBase<FoundPersonViewModel> {
  constructor(
    staticContent: Record<string, string>,
    private readonly foundPerson: Person,
  ) {
    super(staticContent)
  }

  buildPageContent(): FoundPersonViewModel {
    const viewModel = {} as FoundPersonViewModel
    viewModel.pageHeader = 'Confirm this is the correct person for referral'
    viewModel.continueButtonText = 'Continue'
    viewModel.continueButtonLink = `/referral/create-referral/${this.foundPerson.personIdentifier}`
    const personSummaryItems = [
      ViewUtils.summaryListRow('Name', `${this.foundPerson.firstName} ${this.foundPerson.lastName}`),
      ViewUtils.summaryListRow('CRN', this.foundPerson.personIdentifier),
      ViewUtils.summaryListRow('Sex', this.foundPerson.sex),
    ]
    const attributes = { 'data-testid': 'personsummary' }
    viewModel.personSummary = ViewUtils.summaryList(personSummaryItems, { showBorders: false }, attributes)
    return viewModel
  }

  getTemplatePath(): string {
    return 'referral/foundPerson'
  }

  renderPage(res: Response, req: Request, next: NextFunction): void {
    return res.render(this.getTemplatePath(), {
      content: this.buildPageContent(),
    })
  }
}

import { Response } from 'express'
import { Person } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { FoundPersonContent, FoundPersonViewModel } from './foundPersonViewModel'
import ViewUtils from '../../utils/viewUtils'

export default class FoundPersonPresenter extends PresenterBase<FoundPersonViewModel> {
  constructor(private readonly foundPerson: Person) {
    super()
  }

  buildPageContent(res: Response): FoundPersonViewModel {
    const viewModel = {} as FoundPersonViewModel
    viewModel.staticContent = this.buildStaticContent(res)
    const personSummaryItems = [
      ViewUtils.summaryListRow('Name', `${this.foundPerson.firstName} ${this.foundPerson.lastName}`),
      ViewUtils.summaryListRow('CRN', this.foundPerson.personIdentifier),
      ViewUtils.summaryListRow('Sex', this.foundPerson.sex),
    ]
    const attributes = { 'data-testid': 'personsummary' }
    viewModel.personSummary = ViewUtils.summaryList(personSummaryItems, { showBorders: true }, attributes)
    return viewModel
  }

  buildStaticContent(res: Response): FoundPersonContent {
    const { content } = res.locals
    return {
      pageHeader: content.pageHeader,
      continueButtonText: content.continueButtonText,
      continueButtonLink: content.continueButtonLink,
    }
  }

  getTemplatePath(): string {
    return 'referral/foundPerson'
  }

  renderPage(res: Response): void {
    const pageContent = this.buildPageContent(res)
    return res.render(this.getTemplatePath(), {
      content: pageContent,
    })
  }
}

import { Response } from 'express'
import { Person } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { FoundPersonContent, FoundPersonViewModel } from './foundPersonViewModel'
import ViewUtils from '../../utils/viewUtils'
import { resolveIdentifierRow } from '../personIdentifierUtils'

const resolveName = (person: Person): string =>
  [person.firstName, person.middleNames, person.lastName].filter(Boolean).join(' ')

export default class FoundPersonPresenter extends PresenterBase<FoundPersonViewModel, FoundPersonContent> {
  constructor(private readonly foundPerson: Person) {
    super()
  }

  protected override buildPageContent(res: Response): FoundPersonViewModel {
    const { foundPerson } = this
    const identifierRow = resolveIdentifierRow(foundPerson)

    const viewModel = {} as FoundPersonViewModel
    viewModel.staticContent = this.buildStaticContent(res)
    const personSummaryItems = [
      ViewUtils.summaryListRow('Name', resolveName(foundPerson)),
      ...(identifierRow ? [ViewUtils.summaryListRow(identifierRow.label, identifierRow.value)] : []),
      ViewUtils.summaryListRow('Date of birth', foundPerson.dateOfBirth || ''),
      ViewUtils.summaryListRow('Sex', foundPerson.sex || ''),
    ]
    const attributes = { 'data-testid': 'personsummary' }
    viewModel.personSummary = ViewUtils.summaryList(personSummaryItems, { showBorders: true }, attributes)
    return viewModel
  }

  protected override getTemplatePath(): string {
    return 'referral/foundPerson'
  }

  renderPage(res: Response): void {
    const pageContent = this.buildPageContent(res)
    return res.render(this.getTemplatePath(), {
      content: pageContent,
    })
  }
}

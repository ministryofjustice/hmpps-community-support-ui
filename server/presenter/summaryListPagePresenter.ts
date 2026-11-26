import type { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import PresenterBase from './presenterBase'

export interface SummaryListPageContent {
  pageTitle: string
  heading: string
  backLink: GovukFrontendBackLink
  summaryList: GovukFrontendSummaryList
}

export interface SummaryListPageViewModel {
  pageTitle: string
  heading: string
  backLink: GovukFrontendBackLink
  summaryList: GovukFrontendSummaryList
}

export default class SummaryListPagePresenter extends PresenterBase<SummaryListPageViewModel> {
  constructor(private readonly getContent: () => SummaryListPageContent) {
    super()
  }

  buildViewModel(): SummaryListPageViewModel {
    const { pageTitle, heading, backLink, summaryList } = this.getContent()

    return {
      pageTitle,
      heading,
      backLink,
      summaryList,
    }
  }

  protected getTemplatePath(): string {
    return 'shared/summaryListPage'
  }
}

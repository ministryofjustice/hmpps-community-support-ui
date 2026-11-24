import type { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import PresenterBase from './presenterBase'

export interface SummaryListPageContent {
  title: string
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
  /** Dot-separated path to a page in global content, for example referral.examplePage. */
  constructor(private readonly pageRoute: string) {
    super()
  }

  private validatePageContent(content: SummaryListPageContent | undefined): asserts content is SummaryListPageContent {
    if (
      !content ||
      typeof content.title !== 'string' ||
      typeof content.backLink?.href !== 'string' ||
      !Array.isArray(content.summaryList?.rows)
    ) {
      throw new Error(
        `Invalid summary list page content at "${this.pageRoute}": expected title, backLink.href and summaryList.rows`,
      )
    }
  }

  buildViewModel(): SummaryListPageViewModel {
    const content = this.getPageContent<SummaryListPageContent>(this.pageRoute)
    this.validatePageContent(content)
    const { title, backLink, summaryList } = content

    return {
      pageTitle: title,
      heading: title,
      backLink,
      summaryList,
    }
  }

  protected getTemplatePath(): string {
    return 'shared/summaryListPage'
  }
}

import { globalContent } from '../../assets/content/GlobalContent'
import type { GlobalContent } from '../../assets/content/GlobalContent'
import type { SummaryListPageContent } from '../presenter/summaryListPagePresenter'
import type { InitialContactSessionDetailsContent } from '../referral/InitialContactSessionDetailsPresenter'

function isSummaryListPageContent(content: unknown): content is SummaryListPageContent {
  if (!content || typeof content !== 'object') {
    return false
  }

  const page = content as Partial<SummaryListPageContent>

  return (
    typeof page.pageTitle === 'string' &&
    typeof page.heading === 'string' &&
    typeof page.backLink?.href === 'string' &&
    Array.isArray(page.summaryList?.rows)
  )
}

export default function getSummaryListPageContent(key: keyof GlobalContent): () => SummaryListPageContent {
  return () => {
    const content = globalContent[key]

    if (!isSummaryListPageContent(content)) {
      throw new Error(`Invalid summary list page content at "${key}"`)
    }

    return content
  }
}

export function getInitialContactSessionDetailsContent(historical: boolean): () => InitialContactSessionDetailsContent {
  return () => ({
    ...globalContent.referralDetails.id.page,
    ...(historical
      ? globalContent.referralDetails.id.changedIcsDetails.id
      : globalContent.referralDetails.id.icsViewOrChange),
  })
}

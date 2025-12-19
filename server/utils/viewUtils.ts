import * as nunjucks from 'nunjucks'
import { ListStyle, SummaryListItem, SummaryListItemContent } from './summaryList'
import { GovukFrontendSummaryList, GovukFrontendSummaryListRowActionsItem } from '../@types/govukFrontend'

const environment = new nunjucks.Environment()
export default class ViewUtils {
  static escape(val: string): string {
    const escape = environment.getFilter('escape')
    return escape(val).val
  }

  static nl2br(val: unknown): unknown {
    if (typeof val !== 'string') return val
    const nl2br = environment.getFilter('nl2br')
    return nl2br(val)
  }

  private static summaryListItemLine(line: SummaryListItemContent): string {
    return `${ViewUtils.escape(line)}`
  }

  static summaryListArgs(
    summaryListItems: SummaryListItem[],
    options: { showBorders: boolean } = { showBorders: true },
  ): GovukFrontendSummaryList {
    return {
      classes: options.showBorders ? undefined : 'govuk-summary-list--no-border',
      rows: summaryListItems.map((item, index) => {
        return {
          key: {
            text: item.key,
          },
          value: (() => {
            if (item.listStyle !== undefined) {
              const itemClass = `govuk-list${item.listStyle === ListStyle.bulleted ? ' govuk-list--bullet' : ''}`
              const html = `<ul class="${itemClass}">${item.lines
                .map(line => `<li>${ViewUtils.summaryListItemLine(line)}</li>`)
                .join('\n')}</ul>`
              return { html }
            }
            if (item.valueLink) {
              const html = item.valueLink
              return { html }
            }
            const html = item.lines
              .map(line => `<p class="govuk-body">${ViewUtils.nl2br(ViewUtils.summaryListItemLine(line))}</p>`)
              .join('\n')
            return { html }
          })(),
          actions: {
            items: (() => {
              const items: GovukFrontendSummaryListRowActionsItem[] = []
              if (item.deleteLink) {
                items.push({
                  href: item.deleteLink,
                  text: 'Delete',
                  attributes: { id: `delete-link-${index}` },
                  visuallyHiddenText: item.deleteHiddenText || undefined,
                })
              }
              if (item.changeLink) {
                items.push({
                  href: item.changeLink,
                  text: 'Change',
                  attributes: { id: `change-link-${index}` },
                  visuallyHiddenText: item.changeHiddenText || undefined,
                })
              }
              return items
            })(),
          },
        }
      }),
    }
  }
}

import { expect, type Locator, type Page } from '@playwright/test'

type ReferralTab = 'Case details' | 'Progress' | 'Action Plan' | 'Appointments' | 'Change log'

export default class ReferralNavigation {
  readonly links: Locator

  readonly actionPlanLink: Locator

  constructor(page: Page) {
    this.links = page.getByRole('navigation', { name: 'Sub navigation', exact: true }).getByRole('link')
    this.actionPlanLink = this.links.filter({ hasText: /^Action Plan$/ })
  }

  async verify(caseReference: string, activeTab: ReferralTab, isAssigned = true): Promise<void> {
    const items = [
      { text: 'Case details', href: `/referral-details/${caseReference}` },
      { text: 'Progress', href: `/progress/${caseReference}` },
      { text: 'Action Plan', href: `/referral/${caseReference}/action-plan` },
      { text: 'Appointments', href: `/referral/${caseReference}/appointments` },
      { text: 'Change log', href: '#' },
    ].filter(item => isAssigned || ['Case details', 'Change log'].includes(item.text))

    await expect(this.links).toHaveText(items.map(item => item.text))
    await Promise.all(
      items.map(async (item, index) => {
        const link = this.links.nth(index)
        await expect(link).toHaveAttribute('href', item.href)
        if (item.text === activeTab) {
          await expect(link).toHaveAttribute('aria-current', 'page')
        } else {
          await expect(link).not.toHaveAttribute('aria-current', 'page')
        }
      }),
    )
  }
}

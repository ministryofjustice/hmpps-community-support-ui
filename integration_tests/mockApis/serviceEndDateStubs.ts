import { Page } from '@playwright/test'
import { ServiceEndDatePageDto } from '@community-support-api'

export async function stubGetServiceEndDatePage(page: Page, _data: ServiceEndDatePageDto = {}): Promise<void> {
  await page.route('**/api/referral/*/service-end-date', async route => {
    await route.abort('blockedbyclient')
  })

  await page.route('**/referral/*/service-end-date', async route => {
    if (route.request().method() === 'GET') {
      await route.continue()
    }
  })
}

export async function stubUpdateServiceEndDatePage(page: Page): Promise<void> {
  await page.route('**/referral/*/service-end-date', async route => {
    if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
      await route.abort('blockedbyclient')
    } else {
      await route.continue()
    }
  })
}

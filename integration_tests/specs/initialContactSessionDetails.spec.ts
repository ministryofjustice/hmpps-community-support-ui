import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ReferralDetailsPage from '../pages/referralDetailsPage'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'

test.describe('Initial Contact Session Details Page', () => {
  const virtual = {
    referralId: randomUUID(),
    icsId: randomUUID(),
  } as const

  const inPersion = {
    referralId: randomUUID(),
    icsId: randomUUID(),
  } as const

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(
      virtual.referralId,
      virtual.icsId,
      initialContactSessionDetailsPageData.virtual(virtual.referralId, virtual.icsId),
    )
    await communitySupport.stubGetICS(
      inPersion.referralId,
      inPersion.icsId,
      initialContactSessionDetailsPageData.inPersion(inPersion.referralId, inPersion.icsId),
    )
    await page.goto('/')
    await login(page)
  })

  test('should display the page - virtual', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${virtual.referralId}/appointment/${virtual.icsId}`)
    })
    await ReferralDetailsPage.verifyOnPage(page)
  })

  test('should display the page - in persion', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${inPersion.referralId}/appointment/${inPersion.icsId}`)
    })
    await ReferralDetailsPage.verifyOnPage(page)
  })
})

/* test.describe("in person", () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(referralId, icsId, initialContactSessionDetailsPageData.inPersion(referralId, icsId))
    await page.goto('/')
    await login(page)
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${referralId}/appointment/${icsId}`)
    })
  })

  test('should display the page', async ({ page }) => {
    await ReferralDetailsPage.verifyOnPage(page)
  })
}) */

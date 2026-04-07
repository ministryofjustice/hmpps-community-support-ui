import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import InitialContactSessionDetailsPage from '../pages/InitialContactSessionDetailsPage'

test.describe('Initial Contact Session Details Page', () => {
  const virtual = {
    referralId: randomUUID(),
    icsId: randomUUID(),
  } as const

  const virtualData = initialContactSessionDetailsPageData.virtual(virtual.referralId, virtual.icsId)

  const inPersion = {
    referralId: randomUUID(),
    icsId: randomUUID(),
  } as const

  const inPersionData = initialContactSessionDetailsPageData.inPersion(inPersion.referralId, inPersion.icsId)

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(virtual.referralId, virtual.icsId, virtualData)
    await communitySupport.stubGetICS(inPersion.referralId, inPersion.icsId, inPersionData)
    await page.goto('/')
    await login(page)
  })

  test('should display the page - virtual', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${virtual.referralId}/appointment/${virtual.icsId}`)
    })
    await InitialContactSessionDetailsPage.verifyOnPage(page)
  })

  test('should display the page - in persion', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${inPersion.referralId}/appointment/${inPersion.icsId}`)
    })
    await InitialContactSessionDetailsPage.verifyOnPage(page)
  })

  // IPB-2130:AC1
  // No page to navigate from...

  // IPB-2130:AC2
  test('Heading', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${virtual.referralId}/appointment/${virtual.icsId}`)
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    await expect(referralDetailsPage.header).toHaveText('View or change session details')
  })

  // IPB-2130:AC3
  test('Navigate back', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${virtual.referralId}/appointment/${virtual.icsId}`)
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    const backlink = referralDetailsPage.backLink
    await test.step('check backlink', async () => {
      await backlink.click()
      await expect(page).toHaveURL(`referral/${virtual.referralId}/appointment/change-ics`)
    })
  })

  // IPB-2130:AC4
  test('View ICS details - virtual', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${virtual.referralId}/appointment/${virtual.icsId}`)
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    const summary = referralDetailsPage.details
    await test.step('summary has required number of rows', () => {
      expect(summary.rows).toHaveLength(5)
    })
    await test.step('I can see the details I entered, including:', async () => {
      const { rows } = summary
      await test.step('summary has required number of rows', () => {
        expect(rows).toHaveLength(5)
      })
      await test.step('Date', async () => {
        await expect(rows[0].key).toHaveText('Date')
      })
      await test.step('Start time', async () => {
        await expect(rows[1].key).toHaveText('Start time')
      })
      await test.step('Method', async () => {
        await expect(rows[2].key).toHaveText('Method')
      })
      await test.step('Reason session is not in person', async () => {
        await expect(rows[3].key).toHaveText('Reason session is not in person')
      })
      await test.step('How [First Name] was informed about the session', async () => {
        await expect(rows[4].key).toHaveText(`How ${virtualData.referralFirstName} was informed about the session`)
      })
    })
  })
  // IPB-2130:AC4
  test('View ICS details - in persion', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(`/referral/${inPersion.referralId}/appointment/${inPersion.icsId}`)
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    const summary = referralDetailsPage.details
    await test.step('summary has required number of rows', () => {
      expect(summary.rows).toHaveLength(5)
    })
    await test.step('I can see the details I entered, including:', async () => {
      const { rows } = summary
      await test.step('summary has required number of rows', () => {
        expect(rows).toHaveLength(5)
      })
      await test.step('Date', async () => {
        await expect(rows[0].key).toHaveText('Date')
      })
      await test.step('Start time', async () => {
        await expect(rows[1].key).toHaveText('Start time')
      })
      await test.step('Method', async () => {
        await expect(rows[2].key).toHaveText('Method')
      })
      await test.step('Location', async () => {
        await expect(rows[3].key).toHaveText('Location')
      })
      await test.step('How [First Name] was informed about the session', async () => {
        await expect(rows[4].key).toHaveText(`How ${inPersionData.referralFirstName} was informed about the session`)
      })
    })
  })
})

import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { addDays, subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'

test.describe('RecordSessionAttendancePage', () => {
  const pastMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(subDays(new Date(), 10)),
  } as const

  const futureMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.inPerson(addDays(new Date(), 10)),
  } as const

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(pastMeeting.caseRefId, pastMeeting.data)
    await communitySupport.stubGetICS(futureMeeting.caseRefId, futureMeeting.data)
    await page.goto('/')
    await login(page)
  })

  // IPB-2208:AC1
  test('Recording feedback and attendance availability', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await expect(recordSessionAttendancePage.radios.locator).toBeVisible()
  })

  // IPB-2208:AC2
  test('No option to record feedback before session time', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(futureMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await expect(recordSessionAttendancePage.radios.locator).not.toBeVisible()
  })
})

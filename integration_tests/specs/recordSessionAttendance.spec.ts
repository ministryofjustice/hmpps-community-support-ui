import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'

test.describe('RecordSessionAttendancePage', () => {
  const virtual = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(),
  } as const

  const inPerson = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.inPerson(),
  } as const

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(virtual.caseRefId, virtual.data)
    await communitySupport.stubGetICS(inPerson.caseRefId, inPerson.data)
    await page.goto('/')
    await login(page)
  })

  test('should display the page - virtual', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(virtual.caseRefId))
    })
    await RecordSessionAttendancePage.verifyOnPage(page)
  })
})

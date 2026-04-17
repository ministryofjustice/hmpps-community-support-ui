import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { addDays, format, subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport, { ReferralProgress } from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'
import ReferralProgressPage from '../pages/referralProgressPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'

test.describe('RecordSessionAttendancePage', () => {
  const date = new Date()
  const pastDate = subDays(date, 10)
  const futureDate = addDays(date, 10)
  const pastMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(pastDate),
  } as const

  const futureMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.inPerson(futureDate),
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

  // IPB-2208:AC3 !!! Navigation url is wrong !!!
  test.skip('Navigating to the record attendance screen', async ({ page }) => {
    const referralProgressWithAppointments: ReferralProgress = buildReferralProgress([
      { events: [{ status: 'NEEDS_FEEDBACK' }] },
    ])
    await communitySupport.stubGetReferralProgress(referralProgressWithAppointments, pastMeeting.caseRefId)

    await test.step('go to referral progress screen', async () => {
      await page.goto(ReferralProgressPage.url(pastMeeting.caseRefId))
    })
    await test.step('select the option to record the session feedback and attendance ', async () => {
      await page.getByRole('cell', { name: 'Add attendance and feedback' }).click()
    })
    await test.step('should be on the Record Session Attendance screen', async () => {
      await expect(page).toHaveURL(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
  })
  // IPB-2208:AC4
  test('Displaying the heading and content', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await expect(recordSessionAttendancePage.header).toHaveText('Record session attendance')
    await expect(recordSessionAttendancePage.subheading).toHaveText(
      'The date and time of the session are a permanent record of where this person was. If the session started late, you must record this as part of the feedback.',
    )
    await test.step('check summary content', async () => {
      const { summary } = recordSessionAttendancePage
      expect(summary.rows).toHaveLength(2)
      await test.step('check content of first row', async () => {
        const row = summary.rows[0]
        await expect(row.key).toHaveText('Date')
        await expect(row.value).toHaveText(format(pastDate, 'd MMMM uuuu'))
      })
      await test.step('check content of second row', async () => {
        const row = summary.rows[1]
        await expect(row.key).toHaveText('Start time')
        await expect(row.value).toHaveText(format(pastDate, 'h:maaa'))
      })
    })
    // TODO - MORE
  })
})

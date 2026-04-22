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
  const fixedDate = new Date('2026-03-08T09:30:40+00:00')
  const fixedDatePm = new Date('2026-03-12T14:30:40+00:00')
  const date = new Date()
  const pastDate = subDays(date, 12)
  const futureDate = addDays(date, 10)

  const fixedTimeMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(fixedDate),
  } as const

  const fixedTimePmMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(fixedDatePm),
  } as const

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
    await communitySupport.stubGetICS(fixedTimeMeeting.caseRefId, fixedTimeMeeting.data)
    await communitySupport.stubGetICS(fixedTimePmMeeting.caseRefId, fixedTimePmMeeting.data)
    await page.goto('/')
    await login(page)
  })

  // IPB-2208:AC1
  test('Recording feedback and attendance availability', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await expect(recordSessionAttendancePage.attendedRadios.locator).toBeVisible()
  })

  // IPB-2208:AC2
  test('No option to record feedback before session time', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(futureMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await expect(recordSessionAttendancePage.attendedRadios.locator).not.toBeVisible()
  })

  // IPB-2208:AC3
  test('Navigating to the record attendance screen', async ({ page }) => {
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
        await expect(row.value).toHaveText(format(pastDate, 'h:mmaaa'))
      })
    })
    await expect(recordSessionAttendancePage.attendedRadios.fieldset.legend).toHaveText('Did the session happen?')
    await expect(recordSessionAttendancePage.attendedRadios.fieldset.hint).toHaveText(
      'The session happened if something was delivered.',
    )
    await test.step('attended radios have the correct content', async () => {
      expect(recordSessionAttendancePage.attendedRadios.items).toHaveLength(2)
      const [item1, item2] = recordSessionAttendancePage.attendedRadios.items
      await expect(item1.label).toHaveText('Yes')
      await expect(item2.label).toHaveText('No')
    })
    await test.step('session happend radios have the correct content', async () => {
      const [_, attendNo] = recordSessionAttendancePage.attendedRadios.items
      await attendNo.input.click()
      expect(recordSessionAttendancePage.sessionHappenedRadios.items).toHaveLength(2)
      const [item1, item2] = recordSessionAttendancePage.sessionHappenedRadios.items
      await expect(item1.label).toHaveText('Yes')
      await expect(item2.label).toHaveText('No')
    })
    await test.step('Button has correct content', async () => {
      await expect(recordSessionAttendancePage.submitButton).toHaveText('Continue')
    })
  })
  // IPB-2208:AC5
  test('Display ICS session date - one number day of month', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(fixedTimeMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await test.step('check content', async () => {
      const { summary } = recordSessionAttendancePage
      const [row] = summary.rows
      expect(row).toBeDefined()
      const { value } = row
      await expect(value).toHaveText('8 March 2026')
    })
  })

  // IPB-2208:AC5
  test('Display ICS session date - two number day of month', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(fixedTimePmMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await test.step('check content', async () => {
      const { summary } = recordSessionAttendancePage
      const [row] = summary.rows
      expect(row).toBeDefined()
      const { value } = row
      await expect(value).toHaveText('12 March 2026')
    })
  })
  // IPB-2208:AC6
  test('Display ICS start time - morning meeting', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(fixedTimeMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await test.step('check content', async () => {
      const { summary } = recordSessionAttendancePage
      const [_, row] = summary.rows
      expect(row).toBeDefined()
      const { value } = row
      await expect(value).toHaveText('9:30am')
    })
  })
  // IPB-2208:AC6
  test('Display ICS start time - afternoon meeting', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(fixedTimePmMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await test.step('check content', async () => {
      const { summary } = recordSessionAttendancePage
      const [_, row] = summary.rows
      expect(row).toBeDefined()
      const { value } = row
      await expect(value).toHaveText('2:30pm')
    })
  })

  // IPB-2208:AC7
  test('Select whether the session happened - Yes', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await test.step('select attended', async () => {
      await recordSessionAttendancePage.attendedRadios.items[0].input.click()
    })
    await test.step('click submit', async () => {
      await recordSessionAttendancePage.submitButton.click()
    })
  })

  // IPB-2208:AC7
  test('Select whether the session happened - No', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await test.step('select attended', async () => {
      await recordSessionAttendancePage.attendedRadios.items[1].input.click()
    })
    await test.step('click submit', async () => {
      await recordSessionAttendancePage.submitButton.click()
    })
  })
})

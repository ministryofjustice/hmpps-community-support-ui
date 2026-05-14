import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { addDays, format, subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport, { ReferralProgress } from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'
import ReferralProgressPage from '../pages/referralProgressPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import IcsFeedbackHowSessionTookPlacePage from '../pages/icsFeedbackHowSessionTookPlacePage'
import IcsFeedbackWhyDidTheSessionNotHappenPage from '../pages/IcsFeedbackWhyDidTheSessionNotHappenPage'
import IcsFeedbackHowTheyTriedToContactThePersonPage from '../pages/IcsFeedbackHowTheyTriedToContactThePersonPage'

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
    await expect(recordSessionAttendancePage.sessionHappenedRadios.locator).toBeVisible()
  })

  // IPB-2208:AC2
  test('No option to record feedback before session time', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(futureMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await expect(recordSessionAttendancePage.sessionAttendedRadios.locator).not.toBeVisible()
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
    await test.step('session happened radios have the correct content', async () => {
      await expect(recordSessionAttendancePage.sessionHappenedRadios.fieldset.legend).toHaveText(
        'Did the session happen?',
      )
      await expect(recordSessionAttendancePage.sessionHappenedRadios.fieldset.hint).toHaveText(
        'The session happened if something was delivered.',
      )
      expect(recordSessionAttendancePage.sessionHappenedRadios.items).toHaveLength(2)
      const [item1, item2] = recordSessionAttendancePage.sessionHappenedRadios.items
      await expect(item1.label).toHaveText('Yes')
      await expect(item2.label).toHaveText('No')
    })
    await test.step('session attended radios have the correct content', async () => {
      const [, attendNo] = recordSessionAttendancePage.sessionHappenedRadios.items
      await attendNo.input.click()
      expect(recordSessionAttendancePage.sessionAttendedRadios.items).toHaveLength(2)
      const [item1, item2] = recordSessionAttendancePage.sessionAttendedRadios.items
      await expect(item1.label).toHaveText('Yes')
      await expect(item2.label).toHaveText('No')
    })
    await test.step('Button has correct content', async () => {
      await expect(recordSessionAttendancePage.continueButton).toHaveText('Continue')
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
      const [, row] = summary.rows
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
      const [, row] = summary.rows
      expect(row).toBeDefined()
      const { value } = row
      await expect(value).toHaveText('2:30pm')
    })
  })

  // IPB-2208:AC7
  test('Select whether the session happened', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await test.step('select attended', async () => {
      await recordSessionAttendancePage.sessionHappenedRadios.items[0].input.click()
    })
    await test.step('click submit', async () => {
      await recordSessionAttendancePage.continueButton.click()
    })
  })

  // IPB-2208:AC8
  test('Error when session happened selection is not made', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    await test.step('click continue without selecting radio option', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await recordSessionAttendancePage.continueButton.click()
    })
    await test.step('check error content', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await test.step('check banner content', async () => {
        await expect(recordSessionAttendancePage.errorSummary.locator).toBeVisible()
        await expect(recordSessionAttendancePage.errorSummary.title).toHaveText('There is a problem')
        await expect(recordSessionAttendancePage.errorSummary.list).toBeVisible()
        await expect(recordSessionAttendancePage.errorSummary.items).toHaveCount(1)
        const [errorMessage] = await recordSessionAttendancePage.errorSummary.items.all()
        await expect(errorMessage).toHaveText('Select yes if the session happened')
      })
      await test.step('check radio content', async () => {
        await expect(recordSessionAttendancePage.sessionHappenedRadios.errorText).toBeVisible()
        await expect(recordSessionAttendancePage.sessionHappenedRadios.errorText).toHaveText(
          'Error: Select yes if the session happened',
        )
      })
    })
  })
  // NO AC - check validaiton session data is cleared away after use
  test('validation errors get cleared after page render', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    await test.step('click continue without selecting radio option', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await recordSessionAttendancePage.continueButton.click()
    })
    await test.step('check error content', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await test.step('check banner content', async () => {
        await expect(recordSessionAttendancePage.errorSummary.locator).toBeVisible()
      })
      await test.step('check radio content', async () => {
        await expect(recordSessionAttendancePage.sessionHappenedRadios.errorText).toBeVisible()
      })
    })
    await test.step('visit page again', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await test.step('check banner content', async () => {
        await expect(recordSessionAttendancePage.errorSummary.locator).not.toBeVisible()
      })
      await test.step('check radio content', async () => {
        await expect(recordSessionAttendancePage.sessionHappenedRadios.errorText).not.toBeVisible()
      })
    })
  })
  // IPB-2208:AC9
  test('Select whether the person came to the appointment', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    const [, attendNo] = recordSessionAttendancePage.sessionHappenedRadios.items
    await attendNo.input.click()
    const [happenedYes] = recordSessionAttendancePage.sessionAttendedRadios.items
    await happenedYes.input.click()
    await test.step('click submit', async () => {
      await recordSessionAttendancePage.continueButton.click()
    })
  })

  // IPB-2208:AC10
  test('Error when attendance selection is not made', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    await test.step('select attended no and click continue without clicking drop down radios', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      const [, attendNo] = recordSessionAttendancePage.sessionHappenedRadios.items
      await attendNo.input.click()

      await recordSessionAttendancePage.continueButton.click()
    })

    await test.step('check error content', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await test.step('check banner content', async () => {
        await expect(recordSessionAttendancePage.errorSummary.locator).toBeVisible()
        await expect(recordSessionAttendancePage.errorSummary.title).toHaveText('There is a problem')
        await expect(recordSessionAttendancePage.errorSummary.list).toBeVisible()
        await expect(recordSessionAttendancePage.errorSummary.items).toHaveCount(1)
        const [errorMessage] = await recordSessionAttendancePage.errorSummary.items.all()
        await expect(errorMessage).toHaveText('Select yes if Alice came to the appointment')
      })
      await test.step('check radio content', async () => {
        await expect(recordSessionAttendancePage.sessionAttendedRadios.errorText).toBeVisible()
        await expect(recordSessionAttendancePage.sessionAttendedRadios.errorText).toHaveText(
          'Error: Select yes if Alice came to the appointment',
        )
      })
    })
  })
  // IPB-2208:AC11 covered by AC4

  // IPB-2208:AC12
  test('Navigate back to the referral progress screen', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.backLink.click()
    await expect(page).toHaveURL(ReferralProgressPage.url(pastMeeting.caseRefId))
  })

  // IPB-2208:AC13
  test('Session happened', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.sessionHappenedRadios.items[0].input.click()
    await recordSessionAttendancePage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackHowSessionTookPlacePage.url(pastMeeting.caseRefId))
  })

  // IPB-2208:AC14
  test('Session did not happen but the person attended', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.sessionHappenedRadios.items[1].input.click()
    await recordSessionAttendancePage.sessionAttendedRadios.items[0].input.click()
    await recordSessionAttendancePage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackWhyDidTheSessionNotHappenPage.url(pastMeeting.caseRefId))
  })
  // IPB-2208:AC15
  test('Session did not happen and the person did not attend', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    })
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.sessionHappenedRadios.items[1].input.click()
    await recordSessionAttendancePage.sessionAttendedRadios.items[1].input.click()
    await recordSessionAttendancePage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackHowTheyTriedToContactThePersonPage.url(pastMeeting.caseRefId))
  })
})

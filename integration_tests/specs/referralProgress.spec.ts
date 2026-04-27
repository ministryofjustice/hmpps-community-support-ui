import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { ReferralProgress } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ReferralProgressPage from '../pages/referralProgressPage'
import CaseListPage from '../pages/caseListPage'
import ScheduleIcsPage from '../pages/scheduleIcsPage'

test.describe('Referral Progress Page', () => {
  const caseReference = 'AB1234CD'
  const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([{ events: [] }])
  const appointmentScheduled: ReferralProgress = buildReferralProgress([
    { appointmentId: randomUUID(), events: [{ status: 'SCHEDULED', dateTime: '2026-03-26T10:00:00' }] },
  ])
  const appointmentDidNotHappen: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [
        { status: 'SCHEDULED', dateTime: '2026-03-26T10:00:00' },
        { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        { status: 'DID_NOT_HAPPEN', dateTime: '2026-03-28T10:00:00' },
      ],
    },
  ])
  const appointmentDidNotAttend: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [
        { status: 'SCHEDULED', dateTime: '2026-03-26T10:00:00' },
        { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        { status: 'DID_NOT_ATTEND', dateTime: '2026-03-28T10:00:00' },
      ],
    },
  ])
  const appointmentCompleted: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [
        { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
        { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-26T10:00:00' },
        { status: 'COMPLETED', dateTime: '2026-03-28T12:00:00' },
      ],
    },
  ])

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  // IPB-2142:AC1
  test('Navigate back to referral dashboard', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('click back link', async () => {
      await referralProgressPage.backLink.click()
    })
    await test.step('should be on referral dashboard screen', async () => {
      await expect(page).toHaveURL(CaseListPage.url('in-progress'))
    })
  })

  // IPB-2142:AC2
  test('View ICS section', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('I can see the Initial Contact Session section', async () => {
      await expect(referralProgressPage.icsTitle).toHaveText('Initial contact session (ICS)')
      await expect(referralProgressPage.table.locator).toBeVisible()
    })
  })

  // IPB-2142:AC3
  test('Status display when ICS not scheduled', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('When I haven’t scheduled the ICS, I can see the status displayed as Not scheduled', async () => {
      await test.step('can see ICS appointment table with correct headers', async () => {
        expect(referralProgressPage.table.header).toHaveLength(1)
        expect(referralProgressPage.table.header[0].elements).toHaveLength(2)
        await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Status')
        await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Action')
      })

      await test.step('can see ICS appointment table with correct status and action', async () => {
        expect(referralProgressPage.table.body).toHaveLength(1)
        expect(referralProgressPage.table.body[0].elements).toHaveLength(2)
        await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('Not scheduled')
        await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Schedule session')
      })
    })
  })

  // IPB-2142:AC4
  test('Option to Schedule the Initial Contact Session', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('When I haven’t scheduled the ICS, I can see the status displayed as Not scheduled', async () => {
      await test.step('can see ICS appointment table with correct headers', async () => {
        expect(referralProgressPage.table.header).toHaveLength(1)
        expect(referralProgressPage.table.header[0].elements).toHaveLength(2)
        await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Status')
        await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Action')
      })

      await test.step('can see ICS appointment table with correct status and action', async () => {
        expect(referralProgressPage.table.body).toHaveLength(1)
        expect(referralProgressPage.table.body[0].elements).toHaveLength(2)
        await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('Not scheduled')
        await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Schedule session')

        await test.step('then I can select to Schedule session', async () => {
          await referralProgressPage.scheduleSessionLink.click()
        })
        await test.step('I’m taken to the Schedule the ICS screen', async () => {
          await expect(page).toHaveURL(ScheduleIcsPage.url(caseReference))
        })
      })
    })
  })

  // IPB-2142:AC5
  test('Show ICS scheduling success message', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(appointmentScheduled, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference, 'scheduledIcs'))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can see Scheduled ICS success notification banner', async () => {
      await expect(referralProgressPage.notificationBanner).toContainText('The ICS has been scheduled')
    })
  })

  // IPB-2142:AC5
  test('Returning to progress will not show ICS scheduling success message', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(appointmentScheduled, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can not see ICS success notification banner', async () => {
      await expect(referralProgressPage.notificationBanner).not.toBeVisible()
    })
  })

  // IPB-2142:AC6
  test('Show ICS appointment with status of SCHEDULED', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(appointmentScheduled, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can see ICS appointment table with correct headers', async () => {
      expect(referralProgressPage.table.header).toHaveLength(1)
      expect(referralProgressPage.table.header[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Date and time')
      await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Status')
      await expect(referralProgressPage.table.header[0].elements[2]).toHaveText('Action')
    })

    await test.step('can see ICS appointment table with correct data', async () => {
      expect(referralProgressPage.table.body).toHaveLength(1)
      expect(referralProgressPage.table.body[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('26 March 2026 at 10:00am')
      await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Scheduled')
      await expect(referralProgressPage.table.body[0].elements[2]).toHaveText('View or change details')
    })
  })

  /*
    IPB-2212: AC2 - Success banner displayed
    IPB-2212: AC3 - ICS date and time displayed
    IPB-2212: AC4 - Status updated to ‘Completed’
    IPB-2212: AC5 - Option to view feedback displayed
  */
  test('Show ICS banner when appointment has been updated to COMPLETED status from session feedback', async ({
    page,
  }) => {
    await communitySupport.stubGetReferralProgress(appointmentCompleted, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference, 'completedIcs'))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can see Completed ICS success notification banner', async () => {
      await expect(referralProgressPage.notificationBanner).toContainText('Session feedback submitted')
      await expect(referralProgressPage.notificationBanner).toContainText(
        'The ICS is now complete. The probation practitioner will receive an email.',
      )
    })

    await test.step('can see completed ICS appointment table with correct headers', async () => {
      expect(referralProgressPage.table.header).toHaveLength(1)
      expect(referralProgressPage.table.header[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Date and time')
      await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Status')
      await expect(referralProgressPage.table.header[0].elements[2]).toHaveText('Action')
    })

    await test.step('can see completed ICS appointment table with correct data', async () => {
      expect(referralProgressPage.table.body).toHaveLength(1)
      expect(referralProgressPage.table.body[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('28 March 2026 at 12:00pm')
      await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Completed')
      await expect(referralProgressPage.table.body[0].elements[2]).toHaveText('View feedback')
    })
  })

  /*
    IPB-2212: AC7 - Success banner displayed
    IPB-2212: AC8 - ICS date and time displayed
    IPB-2212: AC9 - Status updated to ‘Did not happen’
    IPB-2212: AC10 - Option to reschedule displayed
    IPB-2212: AC11 - Option to view feedback displayed
  */
  test('Show ICS banner when appointment has been updated to DID NOT HAPPEN status from session feedback', async ({
    page,
  }) => {
    await communitySupport.stubGetReferralProgress(appointmentDidNotHappen, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference, 'rescheduledIcs'))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can see rescheduled ICS success notification banner', async () => {
      await expect(referralProgressPage.notificationBanner).toContainText('Session feedback submitted')
      await expect(referralProgressPage.notificationBanner).toContainText('You must now reschedule the ICS.')
    })

    await test.step('can see rescheduled ICS appointment table with correct headers', async () => {
      expect(referralProgressPage.table.header).toHaveLength(1)
      expect(referralProgressPage.table.header[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Date and time')
      await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Status')
      await expect(referralProgressPage.table.header[0].elements[2]).toHaveText('Action')
    })

    await test.step('can see rescheduled ICS appointment table with correct data', async () => {
      expect(referralProgressPage.table.body).toHaveLength(1)
      expect(referralProgressPage.table.body[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('28 March 2026 at 10:00am')
      await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Did not happen')
      await expect(referralProgressPage.table.body[0].elements[2]).toContainText('Reschedule')
      await expect(referralProgressPage.table.body[0].elements[2]).toContainText('View feedback')
    })
  })

  /*
    IPB-2212: AC13 - Success banner displayed
    IPB-2212: AC14 - ICS date and time displayed
    IPB-2212: AC15 - Status updated to ‘Did not attend’
    IPB-2212: AC16 - Option to reschedule displayed
    IPB-2212: AC17 - Option to view feedback displayed
  */
  test('Show ICS banner when appointment has been updated to DID NOT ATTEND status from session feedback', async ({
    page,
  }) => {
    await communitySupport.stubGetReferralProgress(appointmentDidNotAttend, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference, 'rescheduledIcs'))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can see rescheduled ICS success notification banner', async () => {
      await expect(referralProgressPage.notificationBanner).toContainText('Session feedback submitted')
      await expect(referralProgressPage.notificationBanner).toContainText('You must now reschedule the ICS.')
    })

    await test.step('can see rescheduled ICS appointment table with correct headers', async () => {
      expect(referralProgressPage.table.header).toHaveLength(1)
      expect(referralProgressPage.table.header[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Date and time')
      await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Status')
      await expect(referralProgressPage.table.header[0].elements[2]).toHaveText('Action')
    })

    await test.step('can see Rescheduled ICS appointment table with correct data', async () => {
      expect(referralProgressPage.table.body).toHaveLength(1)
      expect(referralProgressPage.table.body[0].elements).toHaveLength(3)
      await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('28 March 2026 at 10:00am')
      await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Did not attend')
      await expect(referralProgressPage.table.body[0].elements[2]).toContainText('Reschedule')
      await expect(referralProgressPage.table.body[0].elements[2]).toContainText('View feedback')
    })
  })
})

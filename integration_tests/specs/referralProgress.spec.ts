import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { ReferralProgress } from '@community-support-api'
import { daysAfter, login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ReferralProgressPage from '../pages/referralProgressPage'
import CaseListPage from '../pages/caseListPage'
import ScheduleIcsPage from '../pages/scheduleIcsPage'

test.describe('Referral Progress Page', () => {

  const caseReference = 'AB1234CD'
  const baseDate = new Date('2026-03-25T10:00:00')
  const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([{ events: [] }])
  const appointmentScheduled: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [{ status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) }],
    },
  ])
  const appointmentDidNotHappen: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [
        { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) },
        { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 2) },
        { status: 'DID_NOT_HAPPEN', dateTime: daysAfter(baseDate, 3) },
      ],
    },
  ])
  const appointmentDidNotAttend: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [
        { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) },
        { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 2) },
        { status: 'DID_NOT_ATTEND', dateTime: daysAfter(baseDate, 3) },
      ],
    },
  ])
  const appointmentCompleted: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [
        { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 0) },
        { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 1) },
        { status: 'COMPLETED', dateTime: daysAfter(baseDate, 3, 12) },
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

  type Scenario = {
    name: string
    fixture: ReferralProgress
    successQuery: 'completedIcs' | 'rescheduleIcs'
    expected: {
      bannerTexts: string[]
      dateTime: string
      status: string
      actions: string[]
    }
  }

  const scenarios: Scenario[] = [
    {
      name: 'COMPLETED',
      fixture: appointmentCompleted,
      successQuery: 'completedIcs',
      expected: {
        bannerTexts: [
          'Session feedback submitted',
          'The ICS is now complete. The probation practitioner will receive an email.',
        ],
        dateTime: '28 March 2026 at 12:00pm',
        status: 'Completed',
        actions: ['View feedback'],
      },
    },
    {
      name: 'DID NOT HAPPEN',
      fixture: appointmentDidNotHappen,
      successQuery: 'rescheduleIcs',
      expected: {
        bannerTexts: ['Session feedback submitted', 'You must now reschedule the ICS.'],
        dateTime: '28 March 2026 at 10:00am',
        status: 'Did not happen',
        actions: ['Reschedule', 'View feedback'],
      },
    },
    {
      name: 'DID NOT ATTEND',
      fixture: appointmentDidNotAttend,
      successQuery: 'rescheduleIcs',
      expected: {
        bannerTexts: ['Session feedback submitted', 'You must now reschedule the ICS.'],
        dateTime: '28 March 2026 at 10:00am',
        status: 'Did not attend',
        actions: ['Reschedule', 'View feedback'],
      },
    },
  ]

  // IPB-2212: AC1-AC17, excluding AC1, AC6 and AC12
  test.describe('ICS success banner + appointment table', () => {
    for (const scenario of scenarios) {
      test(`shows correct UI for ${scenario.name}`, async ({ page }) => {
        await communitySupport.stubGetReferralProgress(scenario.fixture, caseReference)
        await page.goto(ReferralProgressPage.url(caseReference, scenario.successQuery))

        const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

        await test.step('banner is correct', async () => {
          for (const text of scenario.expected.bannerTexts) {
            expect(referralProgressPage.notificationBanner).toContainText(text)
          }
        })

        await test.step('table headers are correct', async () => {
          expect(referralProgressPage.table.header).toHaveLength(1)
          expect(referralProgressPage.table.header[0].elements).toHaveLength(3)

          await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Date and time')
          await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Status')
          await expect(referralProgressPage.table.header[0].elements[2]).toHaveText('Action')
        })

        await test.step('table row data is correct', async () => {
          expect(referralProgressPage.table.body).toHaveLength(1)
          expect(referralProgressPage.table.body[0].elements).toHaveLength(3)

          await expect(referralProgressPage.table.body[0].elements[0]).toHaveText(scenario.expected.dateTime)

          await expect(referralProgressPage.table.body[0].elements[1]).toHaveText(scenario.expected.status)

          for (const action of scenario.expected.actions) {
            expect(referralProgressPage.table.body[0].elements[2]).toContainText(action)
          }
        })
      })
    }
  })
})

import { test, expect, Page } from '@playwright/test'
import { randomUUID } from 'crypto'
import { ReferralProgress } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ReferralProgressPage from '../pages/referralProgressPage'
import CaseListPage from '../pages/caseListPage'
import ScheduleIcsPage from '../pages/scheduleIcsPage'
import { ReferralProgressBannerContent } from '../../server/referral/progress/ReferralProgressBannerContent'

test.describe('Referral Progress Page', () => {
  function daysAfter(base: Date, days: number, hour: number = 10): string {
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }

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
        { status: 'DID_NOT_ATTEND', dateTime: daysAfter(baseDate, 3, 13) },
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

  const setupReferralProgressSessionBanner = async (page: Page, bannerContent: ReferralProgressBannerContent) => {
    await page.request.post('/test/setup-referral-progress-session', {
      data: { referralProgressBanner: bannerContent },
    })
  }

  const scheduledIcsSessionBannerContent: ReferralProgressBannerContent = {
    caseReference,
    heading: 'ICS scheduled',
    body: 'The ICS has been scheduled for 27 March 2026 at 1:00pm',
  }

  const rescheduleIcsSessionBannerContent: ReferralProgressBannerContent = {
    caseReference,
    heading: 'Session feedback submitted',
    body: 'You must now reschedule the ICS.',
  }

  const completedIcsSessionBannerContent: ReferralProgressBannerContent = {
    caseReference,
    heading: 'Session feedback submitted',
    body: 'The ICS is now complete. The probation practitioner will receive an email.',
  }

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

  const expectNotScheduledState = async (referralProgressPage: ReferralProgressPage) => {
    expect(referralProgressPage.table.header).toHaveLength(1)
    expect(referralProgressPage.table.header[0].elements).toHaveLength(2)

    await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Status')
    await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Action')

    expect(referralProgressPage.table.body).toHaveLength(1)
    expect(referralProgressPage.table.body[0].elements).toHaveLength(2)

    await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('Not scheduled')
    await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Schedule session')
  }

  // IPB-2142:AC3
  test('Status display when ICS not scheduled', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('ICS not scheduled state is displayed correctly', async () => {
      await expectNotScheduledState(referralProgressPage)
    })
  })

  // IPB-2142:AC4
  test('Option to Schedule the Initial Contact Session', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('ICS not scheduled state is displayed correctly', async () => {
      await expectNotScheduledState(referralProgressPage)
    })

    await test.step('user can navigate to schedule session screen', async () => {
      await referralProgressPage.scheduleSessionLink.click()
      await expect(page).toHaveURL(ScheduleIcsPage.url(caseReference))
    })
  })

  // IPB-2142:AC5
  test('Show ICS scheduling success message', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(appointmentScheduled, caseReference)
    await setupReferralProgressSessionBanner(page, scheduledIcsSessionBannerContent)

    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can see Scheduled ICS success notification banner', async () => {
      await expect(referralProgressPage.notificationBanner).toContainText('The ICS has been scheduled')
    })
  })

  test('Should not display success banner when session banner belongs to different case reference', async ({
    page,
  }) => {
    await communitySupport.stubGetReferralProgress(appointmentScheduled, caseReference)

    await setupReferralProgressSessionBanner(page, {
      caseReference: 'ZZ9999ZZ',
      heading: 'ICS scheduled',
      body: 'The ICS has been scheduled for 27 March 2026 at 1:00pm',
    })

    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await expect(referralProgressPage.notificationBanner).not.toBeVisible()
  })

  // IPB-2142:AC6 and other Referral Progress statuses
  test.describe('Returning to Referral Progress screen will show ICS appointment and not show success banner.', () => {
    const scenarios = [
      {
        name: 'SCHEDULED',
        fixture: appointmentScheduled,
        expectedDateTime: '26 March 2026 at 10:00am',
        expectedStatus: 'Scheduled',
        expectedActions: ['View details'],
      },
      {
        name: 'COMPLETED',
        fixture: appointmentCompleted,
        expectedDateTime: '28 March 2026 at 12:00pm',
        expectedStatus: 'Completed',
        expectedActions: ['View feedback'],
      },
      {
        name: 'DID_NOT_HAPPEN',
        fixture: appointmentDidNotHappen,
        expectedDateTime: '28 March 2026 at 10:00am',
        expectedStatus: 'Did not happen',
        expectedActions: ['Reschedule', 'View feedback'],
      },
      {
        name: 'DID_NOT_ATTEND',
        fixture: appointmentDidNotAttend,
        expectedDateTime: '28 March 2026 at 1:00pm',
        expectedStatus: 'Did not attend',
        expectedActions: ['Reschedule', 'View feedback'],
      },
    ]

    for (const scenario of scenarios) {
      test(`renders correctly for ${scenario.name}`, async ({ page }) => {
        await communitySupport.stubGetReferralProgress(scenario.fixture, caseReference)
        await page.goto(ReferralProgressPage.url(caseReference))

        const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

        await test.step('no notification banner is shown', async () => {
          await expect(referralProgressPage.notificationBanner).not.toBeVisible()
        })

        await test.step('can see ICS appointment table with correct headers', async () => {
          expect(referralProgressPage.table.header).toHaveLength(1)
          expect(referralProgressPage.table.header[0].elements).toHaveLength(3)

          await expect(referralProgressPage.table.header[0].elements[0]).toHaveText('Date and time')
          await expect(referralProgressPage.table.header[0].elements[1]).toHaveText('Status')
          await expect(referralProgressPage.table.header[0].elements[2]).toHaveText('Action')
        })

        await test.step('can see ICS appointment table rows with correct data', async () => {
          expect(referralProgressPage.table.body).toHaveLength(1)
          expect(referralProgressPage.table.body[0].elements).toHaveLength(3)

          await expect(referralProgressPage.table.body[0].elements[0]).toHaveText(scenario.expectedDateTime)
          await expect(referralProgressPage.table.body[0].elements[1]).toHaveText(scenario.expectedStatus)

          for (const action of scenario.expectedActions) {
            expect(referralProgressPage.table.body[0].elements[2]).toContainText(action)
          }
        })
      })
    }
  })

  // IPB-2212: AC1-AC17, excluding AC1, AC6 and AC12
  test.describe('ICS completion and reschedule scenarios', () => {
    const scenarios = [
      {
        name: 'COMPLETED',
        fixture: appointmentCompleted,
        banner: completedIcsSessionBannerContent,
      },
      {
        name: 'DID NOT HAPPEN',
        fixture: appointmentDidNotHappen,
        banner: rescheduleIcsSessionBannerContent,
      },
      {
        name: 'DID NOT ATTEND',
        fixture: appointmentDidNotAttend,
        banner: rescheduleIcsSessionBannerContent,
      },
    ]

    for (const scenario of scenarios) {
      test(`shows correct UI for ${scenario.name}`, async ({ page }) => {
        await communitySupport.stubGetReferralProgress(scenario.fixture, caseReference)
        await setupReferralProgressSessionBanner(page, scenario.banner)

        await page.goto(ReferralProgressPage.url(caseReference))

        const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

        await test.step('banner is displayed with correct content', async () => {
          await expect(referralProgressPage.notificationBanner).toBeVisible()
          await expect(referralProgressPage.notificationBanner).toContainText(scenario.banner.heading)
          await expect(referralProgressPage.notificationBanner).toContainText(scenario.banner.body)
        })
      })
    }
  })
})

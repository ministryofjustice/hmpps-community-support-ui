import { test, expect } from '@playwright/test'

import { ReferralProgress } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ReferralProgressPage from '../pages/referralProgressPage'

test.describe('Referral Progress Page', () => {
  const caseReference = 'AB1234CD'
  const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([{ events: [] }])
  const referralProgressWithAppointments: ReferralProgress = buildReferralProgress([
    { events: [{ status: 'SCHEDULED' }] },
  ])

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  // IPB-2142:AC1
  test.skip('Navigate back to referral dashboard', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)

    await page.goto(`/referral-details/${caseReference}/progress`)

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('click back link', async () => {
      await referralProgressPage.backLink.click()
    })
    await test.step('should be on referral dashboard screen', async () => {
      await expect(page).toHaveURL('/referral-dashboard') // need confirmation on url
    })
  })

  // IPB-2142:AC2
  test('View ICS section', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)

    await page.goto(`/referral-details/${caseReference}/progress`)

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('I can see the Initial Contact Session section', async () => {
      await expect(referralProgressPage.icsTitle).toHaveText('Initial contact session (ICS)')
      await expect(referralProgressPage.table.locator).toBeVisible()
    })
  })

  // IPB-2142:AC3
  test('Status display when ICS not scheduled', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, caseReference)

    await page.goto(`/referral-details/${caseReference}/progress`)

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

    await page.goto(`/referral-details/${caseReference}/progress`)

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
          await expect(page).toHaveURL(`/referral/${caseReference}/appointment/schedule-ics`)
        })
      })
    })
  })

  // IPB-2142:AC5
  test('Show ICS scheduling success message', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressWithAppointments, caseReference)

    await page.goto(`/referral-details/${caseReference}/progress`)

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await test.step('can see ICS success notification banner', async () => {
      await expect(referralProgressPage.notificationBanner).toContainText('The ICS has been scheduled')
    })
  })

  // IPB-2142:AC6
  test('View scheduled ICS on referral progress', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralProgressWithAppointments, caseReference)

    await page.goto(`/referral-details/${caseReference}/progress`)

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
      await expect(referralProgressPage.table.body[0].elements[0]).toHaveText('25 March 2026 at 10:00am')
      await expect(referralProgressPage.table.body[0].elements[1]).toHaveText('Scheduled')
      await expect(referralProgressPage.table.body[0].elements[2]).toHaveText('View or change details')
    })
  })
})

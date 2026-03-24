import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'

import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import buildAppointments from '../../server/testutils/buildReferralProgress'

test.describe('Referral Progress Page', () => {
  const referralId = randomUUID()

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('renders progress page with no appointments', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralId, [])

    await page.goto(`/referral-details/${referralId}/progress`)

    await expect(page.locator('text=Not scheduled')).toBeVisible()
    await expect(page.locator('text=Schedule session')).toBeVisible()
  })

  test('renders progress page with a single SCHEDULED appointment', async ({ page }) => {
    const appointments = buildAppointments({ events: [{ status: 'SCHEDULED' }] })

    await communitySupport.stubGetReferralProgress(referralId, appointments)

    await page.goto(`/referral-details/${referralId}/progress`)

    await expect(page.locator('text=ICS has been scheduled')).toBeVisible()
    await expect(page.locator('text=View or change details')).toBeVisible()
  })

  test('renders multiple appointments showing only latest per appointmentId', async ({ page }) => {
    const appointments = buildAppointments(
      {
        appointmentId: 'appId1',
        events: [{ status: 'SCHEDULED' }, { status: 'NEEDS_FEEDBACK' }, { status: 'COMPLETED' }],
      },
      { appointmentId: 'appId2', events: [{ status: 'SCHEDULED' }] },
    )

    await communitySupport.stubGetReferralProgress(referralId, appointments)

    await page.goto(`/referral-details/${referralId}/progress`)

    await expect(page.locator('text=View feedback')).toBeVisible()
    await expect(page.locator('text=ICS has been scheduled')).toBeVisible()
    await expect(page.locator('text=View or change details')).toHaveCount(0)
  })

  test('shows error when referral not found', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralId, [], 404)

    await page.goto(`/referral-details/${referralId}/progress`)

    await expect(page.locator('text=No referral with identifier')).toBeVisible()
  })

  test('shows generic error on service failure', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(referralId, [], 500)

    await page.goto(`/referral-details/${referralId}/progress`)

    await expect(page.locator('text=An unexpected error when retrieving referral progress')).toBeVisible()
  })
})

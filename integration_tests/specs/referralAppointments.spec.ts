import { test, expect } from '@playwright/test'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ReferralAppointmentsPage from '../pages/referralAppointmentsPage'
import ReferralProgressPage from '../pages/referralProgressPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'

test.describe('Referral Appointments Page', () => {
  const caseReference = 'AB1234CD'
  const appointments: ReferralAppointmentsBffResponseDto = {
    personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
    appointments: [
      { id: '11111111-1111-4111-8111-111111111111', label: 'Contact session', time: '2026-10-09T13:30:00Z' },
      { id: '22222222-2222-4222-8222-222222222222', label: 'Handover session', time: '2026-10-12T09:00:00Z' },
    ],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('shows appointments from the API and links to appointment type selection', async ({ page }) => {
    await communitySupport.stubGetReferralAppointments(appointments, caseReference)
    await communitySupport.stubGetReferralProgress(buildReferralProgress([]), caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)
    await referralProgressPage.appointmentsLink.click()
    await expect(page).toHaveURL(ReferralAppointmentsPage.url(caseReference))

    const appointmentsPage = new ReferralAppointmentsPage(page)
    await appointmentsPage.verifyOnPage()
    await expect(appointmentsPage.header).toHaveText('Referral for Alex Example')
    await expect(appointmentsPage.appointmentsTable).toContainText('Contact session')
    await expect(appointmentsPage.appointmentsTable).toContainText('Handover session')

    await appointmentsPage.createAppointmentLink.click()
    await expect(page).toHaveURL(`/referral/${caseReference}/appointment/select-type`)
    await expect(page.getByRole('heading', { name: 'Select appointment type', level: 1 })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Contact session' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Handover session' })).toBeVisible()
  })
})

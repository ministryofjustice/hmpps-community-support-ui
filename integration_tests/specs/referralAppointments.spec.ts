import { test, expect } from '@playwright/test'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ReferralAppointmentsPage from '../pages/referralAppointmentsPage'
import ReferralProgressPage from '../pages/referralProgressPage'
import AppointmentTypePage from '../pages/AppointmentTypePage'
import { createAppointmentReferenceData } from '../mockData/referenceData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'

test.describe('Referral Appointments Page', () => {
  const caseReference = 'AB1234CD'
  const appointments: ReferralAppointmentsBffResponseDto = {
    personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
    upcomingAppointments: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        label: 'Contact session',
        appointmentDate: '2026-11-01',
        appointmentTime: { hour: 1, minute: 30, amPm: 'pm' },
        appointmentStatus: 'SCHEDULED',
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        label: 'Handover session',
        appointmentDate: '2026-10-12',
        appointmentTime: { hour: 9, minute: 0, amPm: 'am' },
        appointmentStatus: 'SCHEDULED',
      },
    ],
    pastAppointments: [
      {
        id: '33333333-3333-4333-8333-333333333333',
        label: 'Initial assessment',
        appointmentDate: '2026-09-01',
        appointmentTime: { hour: 10, minute: 0, amPm: 'am' },
        appointmentStatus: 'SCHEDULED',
      },
    ],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('shows appointments from the API and links to appointment type selection', async ({ page }) => {
    await communitySupport.stubGetReferralAppointments(appointments, caseReference)
    await communitySupport.stubGetReferralInformation(200, caseReference, referralInformationInCommunity)
    await communitySupport.stubGetCreateAppointmentReferenceData(caseReference, createAppointmentReferenceData)
    await communitySupport.stubGetReferralProgress(buildReferralProgress([]), caseReference)
    await page.goto(ReferralProgressPage.url(caseReference))

    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)
    await referralProgressPage.appointmentsLink.click()
    await expect(page).toHaveURL(ReferralAppointmentsPage.url(caseReference))

    const appointmentsPage = new ReferralAppointmentsPage(page)
    await appointmentsPage.verifyOnPage()
    await appointmentsPage.navigation.verify(caseReference, 'Appointments')
    await expect(appointmentsPage.header).toHaveText('Referral for Alex Example')
    await expect(page.getByRole('heading', { name: 'Appointments', level: 2, exact: true })).toBeVisible()
    await expect(page.getByText('Referral progress')).toHaveCount(0)
    await expect(appointmentsPage.upcomingAppointmentsTable).toContainText('Contact session')
    await expect(appointmentsPage.upcomingAppointmentsTable).toContainText('Handover session')
    await expect(appointmentsPage.upcomingAppointmentsTable).not.toContainText('Initial assessment')
    await expect(appointmentsPage.pastAppointmentsTable.locator('tbody tr td')).toHaveText([
      'Initial assessment',
      '01 September 2026',
      '10:00am',
    ])
    await expect(appointmentsPage.upcomingAppointmentsTable.getByRole('columnheader')).toHaveText([
      'Appointment type',
      'Date',
      'Start time',
    ])
    await expect(appointmentsPage.upcomingAppointmentsTable.locator('tbody tr').first().locator('td')).toHaveText([
      'Contact session',
      '01 November 2026',
      '1:30pm',
    ])
    await expect(page.getByRole('heading', { name: 'Upcoming appointments', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Past appointments', exact: true })).toBeVisible()
    await expect(appointmentsPage.noAppointmentsMessage).toHaveCount(0)
    await expect(appointmentsPage.bookAppointmentButton).toHaveAttribute('href', AppointmentTypePage.url(caseReference))

    await appointmentsPage.bookAppointmentButton.click()
    await expect(page).toHaveURL(AppointmentTypePage.url(caseReference))
    await AppointmentTypePage.verifyOnPage(page)
  })

  ;[
    { column: 'Appointment type', ascending: ['Contact session', 'Handover session'] },
    { column: 'Date', ascending: ['Handover session', 'Contact session'] },
    { column: 'Start time', ascending: ['Handover session', 'Contact session'] },
  ].forEach(({ column, ascending }) => {
    test(`sorts ${column} in both directions`, async ({ page }) => {
      await communitySupport.stubGetReferralAppointments(appointments, caseReference)
      await page.goto(ReferralAppointmentsPage.url(caseReference))

      const appointmentsPage = new ReferralAppointmentsPage(page)
      await appointmentsPage.verifyOnPage()
      const labels = appointmentsPage.upcomingAppointmentsTable.locator('tbody tr td:first-child')
      const header = appointmentsPage.upcomingAppointmentsTable.getByRole('columnheader', { name: column, exact: true })
      await expect(header).toHaveAttribute('aria-sort', 'none')
      await header.getByRole('button').click()
      await expect(header).toHaveAttribute('aria-sort', 'ascending')
      await expect(labels).toHaveText(ascending)
      await header.getByRole('button').click()
      await expect(header).toHaveAttribute('aria-sort', 'descending')
      await expect(labels).toHaveText([...ascending].reverse())
    })
  })

  test('shows the empty state and booking button when there are no appointments', async ({ page }) => {
    await communitySupport.stubGetReferralAppointments(
      { ...appointments, upcomingAppointments: [], pastAppointments: [] },
      caseReference,
    )
    await page.goto(ReferralAppointmentsPage.url(caseReference))

    const appointmentsPage = new ReferralAppointmentsPage(page)
    await appointmentsPage.verifyOnPage()
    await expect(appointmentsPage.header).toHaveText('Referral for Alex Example')
    await expect(appointmentsPage.noAppointmentsMessage).toHaveText('No appointments scheduled')
    await expect(appointmentsPage.upcomingAppointmentsTable).toHaveCount(0)
    await expect(appointmentsPage.pastAppointmentsTable).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Upcoming appointments', exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Past appointments', exact: true })).toHaveCount(0)
    await expect(appointmentsPage.bookAppointmentButton).toBeVisible()
    await expect(appointmentsPage.bookAppointmentButton).toHaveAttribute(
      'href',
      `/referral/${caseReference}/create-an-appointment/appointment-type`,
    )
  })

  test('shows past appointments when there are no upcoming appointments', async ({ page }) => {
    await communitySupport.stubGetReferralAppointments({ ...appointments, upcomingAppointments: [] }, caseReference)
    await page.goto(ReferralAppointmentsPage.url(caseReference))

    const appointmentsPage = new ReferralAppointmentsPage(page)
    await appointmentsPage.verifyOnPage()
    await expect(appointmentsPage.noAppointmentsMessage).toHaveCount(0)
    await expect(appointmentsPage.upcomingAppointmentsTable.locator('tbody tr')).toHaveCount(0)
    await expect(appointmentsPage.pastAppointmentsTable).toContainText('Initial assessment')
    await expect(appointmentsPage.bookAppointmentButton).toBeVisible()
  })
})

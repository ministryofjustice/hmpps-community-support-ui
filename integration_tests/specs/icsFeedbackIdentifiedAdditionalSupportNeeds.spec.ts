import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { AppointmentIcsResponse, IcsFeedbackSubmission } from '@community-support-api'
import { login, resetStubs, seedSessionWithIcsFeedback } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import IcsFeedbackIdentifiedAdditionalSupportNeedsPage from '../pages/IcsFeedbackIdentifiedAdditionalSupportNeedsPage'

const CASE_REFERENCE = 'AB1234CD'

const IDENTIFIED_ADDITIONAL_NEEDS_URL = `/ics-feedback/${CASE_REFERENCE}/identified-additional-needs`
const ISSUE_OR_CONCERN_PAGE_URL = `/ics-feedback/${CASE_REFERENCE}/issues-or-concerns`

const REFERRAL_ID = randomUUID()
const ICS_ID = randomUUID()

const mockIcsFeedbackSubmission: IcsFeedbackSubmission = { record: { didSessionHappen: true } }
const mockAppointment: AppointmentIcsResponse = {
  appointmentIcsId: ICS_ID,
  appointmentId: randomUUID(),
  referralId: REFERRAL_ID,
  appointmentType: 'ICS',
  appointmentDate: '2026-04-21',
  appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
  appointmentStatus: 'NEEDS_FEEDBACK',
  sessionMethod: { type: 'PHONE', appointmentCategory: 'VIRTUAL' },
  sessionCommunications: [],
  referralFirstName: 'John',
  referralLastName: 'Doe',
  createdAt: '2026-04-21T10:00:00Z',
}

test.describe('Identified Additional Support Needs Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetICS(CASE_REFERENCE, mockAppointment)
  })

  test('AC1 Page displays inputs and labels', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(IDENTIFIED_ADDITIONAL_NEEDS_URL)
    await IcsFeedbackIdentifiedAdditionalSupportNeedsPage.verifyOnPage(page, 'John Doe')
  })

  test('AC2 Back link navigates to issues or concerns page', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(IDENTIFIED_ADDITIONAL_NEEDS_URL)
    const identifiedAdditionalSupportNeedsPage = await IcsFeedbackIdentifiedAdditionalSupportNeedsPage.verifyOnPage(
      page,
      'John Doe',
    )
    await identifiedAdditionalSupportNeedsPage.backLink.click()
    await expect(page).toHaveURL(ISSUE_OR_CONCERN_PAGE_URL)
  })
})

import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { AppointmentIcsResponse, IcsFeedbackSubmission } from '@community-support-api'
import { login, resetStubs, seedSessionWithIcsFeedback } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import IcsFeedbackSessionFeedbackPage from '../pages/IcsFeedbackSessionFeedbackPage'
import IcsFeedbackSessionDetailsPage from '../pages/IcsFeedbackSessionDetailsPage'

const CASE_REFERENCE = 'AB1234CD'
const SESSION_FEEDBACK_URL = `/ics-feedback/${CASE_REFERENCE}/session-feedback`
const SESSION_DETAILS_URL = IcsFeedbackSessionDetailsPage.url(CASE_REFERENCE)
const CHECK_ANSWERS_URL = `/ics-feedback/${CASE_REFERENCE}/check-answers`

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

test.describe('Session Feedback Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetICS(CASE_REFERENCE, mockAppointment)
  })

  test('AC1 - Session feedback', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(SESSION_FEEDBACK_URL)
    await expect(page).toHaveTitle('Session feedback – ICS feedback - [service name]')
  })

  test('AC2 - Providing details of what happened in the session', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(SESSION_FEEDBACK_URL)
    await IcsFeedbackSessionFeedbackPage.verifyOnPage(page)
  })

  test('AC3 - Empty field error message', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(SESSION_FEEDBACK_URL)
    const sessionFeedbackPage = await IcsFeedbackSessionFeedbackPage.verifyOnPage(page)
    await test.step('submit', async () => {
      await sessionFeedbackPage.whatDidYouDoInput.fill('')
      await sessionFeedbackPage.continueButton.click()
    })
    await IcsFeedbackSessionFeedbackPage.verifyFieldErrorOnPage(
      page,
      'whatDidYouDo',
      'Enter what you did in the session',
    )
  })

  test('AC4 - Too many characters error message', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(SESSION_FEEDBACK_URL)
    const sessionFeedbackPage = await IcsFeedbackSessionFeedbackPage.verifyOnPage(page)
    const tooLongText = 'x'.repeat(3001)
    await test.step('submit', async () => {
      await sessionFeedbackPage.whatDidYouDoInput.fill(tooLongText)
      await sessionFeedbackPage.continueButton.click()
    })
    await IcsFeedbackSessionFeedbackPage.verifyFieldErrorOnPage(
      page,
      'whatDidYouDo',
      'What you did in the session must be 3000 characters or less ',
    )
  })

  test('AC5: Back link navigation', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(SESSION_FEEDBACK_URL)
    const sessionFeedbackPage = await IcsFeedbackSessionFeedbackPage.verifyOnPage(page)
    await test.step('click back link', async () => {
      await sessionFeedbackPage.backLink.click()
    })
    await test.step('should be on session details screen', async () => {
      await expect(page).toHaveURL(SESSION_DETAILS_URL)
    })
  })

  test('AC6: Successful submission of ICS details', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(SESSION_FEEDBACK_URL)
    const sessionFeedbackPage = await IcsFeedbackSessionFeedbackPage.verifyOnPage(page)
    await test.step('submit', async () => {
      await sessionFeedbackPage.whatDidYouDoInput.fill('Some feedback information')
      await sessionFeedbackPage.continueButton.click()
    })
    await test.step('should be on check your answers page', async () => {
      await expect(page).toHaveURL(CHECK_ANSWERS_URL)
    })
  })
})

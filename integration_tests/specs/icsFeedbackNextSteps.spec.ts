import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { AppointmentIcsResponse, IcsFeedbackSubmission } from '@community-support-api'
import { login, resetStubs, seedSessionWithIcsFeedback } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import IcsFeedbackNextStepsPage from '../pages/IcsFeedbackNextStepsPage'

const CASE_REFERENCE = 'AB1234CD'
const NEXT_STEPS_URL = `/ics-feedback/${CASE_REFERENCE}/next-steps`
const ISSUES_OR_CONCERNS_URL = `/ics-feedback/${CASE_REFERENCE}/issues-or-concerns`
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

test.describe('Next Steps Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetICS(CASE_REFERENCE, mockAppointment)
  })

  test('Page displays inputs and labels', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(NEXT_STEPS_URL)
    await IcsFeedbackNextStepsPage.verifyOnPage(page)
  })

  test('Validation errors for empty inputs', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(NEXT_STEPS_URL)
    const nextStepsPage = await IcsFeedbackNextStepsPage.verifyOnPage(page)
    await nextStepsPage.plannedForNextSessionInput.fill('')
    await nextStepsPage.actionsBeforeNextSessionInput.fill('')
    await nextStepsPage.continueButton.click()

    await IcsFeedbackNextStepsPage.verifyFieldErrorOnPage(
      page,
      'plannedForNextSession',
      'Enter what you have planned for the next session',
    )
    await IcsFeedbackNextStepsPage.verifyFieldErrorOnPage(
      page,
      'actionsBeforeNextSession',
      'Enter what actions you have before the next session takes place ',
    )
  })

  test('Back link navigates to issues or concerns', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(NEXT_STEPS_URL)
    const nextStepsPage = await IcsFeedbackNextStepsPage.verifyOnPage(page)
    await nextStepsPage.backLink.click()
    await expect(page).toHaveURL(ISSUES_OR_CONCERNS_URL)
  })

  test('Successful submission navigates to check answers', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await communitySupport.stubIcsFeedbackSubmission(
      mockIcsFeedbackSubmission,
      mockAppointment.appointmentIcsId,
      CASE_REFERENCE,
    )
    await page.goto(NEXT_STEPS_URL)
    const nextStepsPage = await IcsFeedbackNextStepsPage.verifyOnPage(page)
    await nextStepsPage.plannedForNextSessionInput.fill('Plan for next')
    await nextStepsPage.actionsBeforeNextSessionInput.fill('Actions to take')
    await nextStepsPage.continueButton.click()
    await expect(page).toHaveURL(CHECK_ANSWERS_URL)
  })
})

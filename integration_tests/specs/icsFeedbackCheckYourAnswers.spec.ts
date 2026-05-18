import { expect, test } from '@playwright/test'
import { IcsFeedbackSubmission, ReferralProgress } from '@community-support-api'
import { randomUUID } from 'crypto'
import { daysAfter, login, resetStubs, seedSessionWithIcsFeedback } from '../testUtils'
import IcsFeedbackCheckYourAnswersPage from '../pages/IcsFeedbackCheckYourAnswersPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import communitySupport from '../mockApis/communitySupport'

test.describe('Ics Feedback CYA Page', () => {
  const caseRefId = 'DC2964SE'
  const icsId = randomUUID()
  const REFERRAL_PROGRESS_URL = `/progress/${caseRefId}`
  const baseDate = new Date('2026-03-25T10:00:00')
  const icsFeedbackSubmission = {
    record: {
      didSessionHappen: true,
    },
    sessionDetails: {
      wasPersonLate: false,
      lateReason: null,
      duration: { hours: 1 },
    },
    sessionFeedback: {
      whatHappened: "Session took place.",
    }
  } as IcsFeedbackSubmission
  const appointmentScheduled: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [{ status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) }],
    },
  ])
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('should display the ics feedback check your answers page if we have session data for the case', async ({
    page,
  }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmission)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.attendanceSummary).toBeVisible()
  })

  test('when we dont have valid session data should redirect to referral progress page', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(appointmentScheduled, caseRefId)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    await test.step('should navigate to the progress screen', async () => {
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
      await expect(page.locator('h2')).toHaveText('Referral progress')
    })
  })

  // AC2.1
  test('when we have valid session data should always display the attendance summary', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmission)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.attendanceSummary).toBeVisible()
  })

  // AC2.2
  test('when the ICS has taken place we should see the session details section', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmission)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.sessionDetailsSummary).toBeVisible()
  })

  // AC2.3
  test('when the ICS has taken place we should see the session feedback section', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmission)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.sessionFeedbackSummary).toBeVisible()
  })

  // AC6
  test('when I submit feedback successfully I am taken to the referral progress page', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmission)
    await communitySupport.stubIcsFeedbackSubmission(icsFeedbackSubmission, icsId, caseRefId)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    await icsFeedbackCheckYourAnswersPage.submitButton.click()
    await test.step('should navigate to the progress screen', async () => {
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
      await expect(page.locator('h2')).toHaveText('Referral progress')
    })
  })
})

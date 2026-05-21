import { expect, test } from '@playwright/test'
import { ReferralProgress } from '@community-support-api'
import { randomUUID } from 'crypto'
import { daysAfter, login, resetStubs, seedSessionWithIcsFeedback } from '../testUtils'
import IcsFeedbackCheckYourAnswersPage from '../pages/IcsFeedbackCheckYourAnswersPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import communitySupport from '../mockApis/communitySupport'

test.describe('Ics Feedback CYA Page', () => {
  const caseRefId = 'DC2964SE'
  const REFERRAL_PROGRESS_URL = `/progress/${caseRefId}`
  const baseDate = new Date('2026-03-25T10:00:00')
  const icsFeedbackSubmissionNoAddress = {
    record: {
      didSessionHappen: true,
      howSessionTookPlace: {
        type: 'PHONE' as const,
      },
    },
    sessionDetails: {
      wasPersonLate: false,
      lateReason: null,
      duration: { hours: 1 },
    },
    sessionFeedback: {
      whatHappened: 'Session took place.',
    },
    caseReferenceId: caseRefId,
  }
  const icsFeedbackSubmissionPdu = {
    record: {
      didSessionHappen: true,
      howSessionTookPlace: {
        type: 'IN_PERSON_PROBATION_OFFICE' as const,
        pdu: 'Newcastle',
      },
    },
    sessionDetails: {
      wasPersonLate: false,
      lateReason: null,
      duration: { hours: 1 },
    },
    sessionFeedback: {
      whatHappened: 'Session took place.',
    },
    caseReferenceId: caseRefId,
  }
  const icsFeedbackSubmissionOtherAddress = {
    record: {
      didSessionHappen: true,
      howSessionTookPlace: {
        type: 'IN_PERSON_OTHER_LOCATION' as const,
        addressLine1: '123 Main Street',
        addressLine2: 'Flat 4',
        townOrCity: 'Leeds',
        county: 'West Yorkshire',
        postcode: 'LS1 1AA',
      },
    },
    sessionDetails: {
      wasPersonLate: false,
      lateReason: null,
      duration: { hours: 1 },
    },
    sessionFeedback: {
      whatHappened: 'Session took place.',
    },
    caseReferenceId: caseRefId,
  }
  const appointmentScheduled: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [{ status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) }],
    },
  ])
  const feedbackCompleted: ReferralProgress = buildReferralProgress([
    {
      appointmentId: randomUUID(),
      events: [{ status: 'COMPLETED', dateTime: daysAfter(baseDate, 1) }],
    },
  ])
  const mockAppointmentIcsResponse = {
    appointmentIcsId: '123e4567-e89b-12d3-a456-426614174000',
    appointmentId: '987fcdeb-51a2-43e8-9f9b-123456789abc',
    referralId: randomUUID(),
    appointmentType: 'ICS' as const,
    appointmentDate: '2026-05-15',
    appointmentTime: {
      hour: 14,
      minute: 30,
      amPm: 'PM',
    },
    appointmentStatus: 'SCHEDULED' as const,
    sessionMethod: {
      type: 'IN_PERSON' as const,
      appointmentCategory: 'IN_PERSON' as const,
    } as const,
    sessionCommunications: ['informedByEmail', 'informedByPhone'],
    referralFirstName: 'John',
    referralLastName: 'Smith',
    createdAt: '2026-04-22T10:15:30Z',
  }
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(caseRefId, mockAppointmentIcsResponse)
    await page.goto('/')
    await login(page)
  })

  test('should display the ics feedback check your answers page if we have session data for the case', async ({
    page,
  }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionNoAddress)
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
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionNoAddress)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.attendanceSummary).toBeVisible()
  })

  // AC2.2
  test('when the ICS has taken place we should see the session details section', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionNoAddress)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.sessionDetailsSummary).toBeVisible()
  })

  // AC2.3
  test('when the ICS has taken place we should see the session feedback section', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionNoAddress)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.sessionFeedbackSummary).toBeVisible()
  })

  test('when the ICS has taken place in a PDU display the PDU', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionPdu)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.locationRowTitle).toBeVisible()
    expect(icsFeedbackCheckYourAnswersPage.sessionFeedbackSummary).toBeVisible()
  })

  test('when the ICS has taken place in a custom location display the address', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionOtherAddress)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(icsFeedbackCheckYourAnswersPage.locationRowTitle).toBeVisible()
    expect(icsFeedbackCheckYourAnswersPage.sessionFeedbackSummary).toBeVisible()
  })

  test('when the ICS has taken place display persons first name in was late question', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionOtherAddress)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    expect(page.getByText(`Was ${mockAppointmentIcsResponse.referralFirstName} late?`)).toBeVisible()
    expect(icsFeedbackCheckYourAnswersPage.sessionDetailsSummary).toBeVisible()
  })

  // AC6
  test('when I submit feedback successfully I am taken to the referral progress page', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, caseRefId, icsFeedbackSubmissionNoAddress)
    await communitySupport.stubGetICS(caseRefId, mockAppointmentIcsResponse)
    await communitySupport.stubIcsFeedbackSubmission(
      icsFeedbackSubmissionNoAddress,
      mockAppointmentIcsResponse.appointmentIcsId,
      caseRefId,
    )
    await communitySupport.stubGetReferralProgress(feedbackCompleted, caseRefId)
    await page.goto(`ics-feedback/${caseRefId}/check-answers`)
    const icsFeedbackCheckYourAnswersPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    await icsFeedbackCheckYourAnswersPage.submitButton.click()
    await test.step('should navigate to the progress screen', async () => {
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
      await expect(page.locator('h2')).toHaveText('Referral progress')
    })
  })
})

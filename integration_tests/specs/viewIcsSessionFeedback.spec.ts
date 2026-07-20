import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { ReferralProgress } from '@community-support-api'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import { daysAfter, login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ViewIcsSessionFeedbackPage from '../pages/ViewIcsSessionFeedbackPage'
import IcsFeedbackResponseFactory, {
  caseWorkerOne,
  caseWorkerTwo,
} from '../../server/testutils/factories/IcsFeedbackSubmissionResponse'

test.describe('View ICS Session Feedback', () => {
  const caseRefId = 'DC2964SE'
  const icsFeedbackId = randomUUID()
  const baseDate = new Date('2026-03-25T10:00:00')

  const didNotHappenReferralProgress: ReferralProgress = buildReferralProgress([
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'DID_NOT_HAPPEN', dateTime: daysAfter(baseDate, 3), icsFeedbackId },
    },
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 2), icsFeedbackId },
    },
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'CHANGED', dateTime: daysAfter(baseDate, 1), icsFeedbackId },
    },
  ])

  const didNotAttendReferralProgress: ReferralProgress = buildReferralProgress([
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'DID_NOT_ATTEND', dateTime: daysAfter(baseDate, 3, 13), icsFeedbackId },
    },
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 2), icsFeedbackId },
    },
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'CHANGED', dateTime: daysAfter(baseDate, 1), icsFeedbackId },
    },
  ])

  const completedReferralProgress: ReferralProgress = buildReferralProgress([
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'COMPLETED', dateTime: daysAfter(baseDate, 3, 12), icsFeedbackId },
    },
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 1), icsFeedbackId },
    },
    {
      appointmentIcsId: randomUUID(),
      event: { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 0), icsFeedbackId },
    },
  ])

  const sessionDidHappenFeedback = IcsFeedbackResponseFactory.build({
    recordSessionDidSessionHappen: true,
    recordSessionDidPersonAttend: true,
    sessionDetailsWasPersonLate: false,
    sessionDetailsLateReason: 'No reason provided',
    sessionFeedbackWhatHappened: 'Alex discussed his current situation and was open to new possibilities',
  })

  const sessionDidNotHappenFeedback = IcsFeedbackResponseFactory.build({
    recordSessionDidSessionHappen: false,
    recordSessionDidPersonAttend: true,
    recordSessionNotHappenReason: 'SERVICE_PROVIDER_ISSUE',
    recordSessionNotHappenReasonDetails: 'Room booking was cancelled due to a fire alarm.',
  })

  const sessionDidNotAttendFeedback = IcsFeedbackResponseFactory.build({
    recordSessionDidSessionHappen: false,
    recordSessionDidPersonAttend: false,
    recordSessionNotHappenReason: 'REFERRAL_COULD_NOT_TAKE_PART',
    recordSessionNoAttendanceInformation: 'Called Alex twice but no answer, left voicemail',
  })

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('back link returns user to referral progress page', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(completedReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, sessionDidHappenFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()

    const viewPage = await ViewIcsSessionFeedbackPage.verifyOnPage(page)

    await viewPage.backLink.click()
    await expect(page).toHaveURL(`/progress/${caseRefId}`)
  })

  test('shows plural current caseworkers label and names when multiple caseworkers exist', async ({ page }) => {
    const multipleCaseWorkersFeedback = IcsFeedbackResponseFactory.build({
      sessionFeedbackAppointmentDetails: {
        currentCaseworkers: [caseWorkerOne, caseWorkerTwo],
      },
    })

    await communitySupport.stubGetReferralProgress(completedReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, multipleCaseWorkersFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()

    const pageObject = await ViewIcsSessionFeedbackPage.verifyOnPage(page)

    await expect(pageObject.header).toHaveText('View session feedback')

    const appointmentDetailsCard = page.locator('.govuk-summary-card', { hasText: 'Appointment details' })

    await expect(appointmentDetailsCard).toBeVisible()
    await expect(appointmentDetailsCard).toContainText('Current caseworkers')
    await expect(appointmentDetailsCard).toContainText('CaseWorker One')
    await expect(appointmentDetailsCard).toContainText('CaseWorker Two')
  })

  test('shows location for in-person sessions', async ({ page }) => {
    const inPersonSessionFeedback = IcsFeedbackResponseFactory.build({
      recordSessionHowSessionTookPlace: 'In person (probation office)',
      sessionDetailsWasPersonLate: true,
      sessionDetailsLateReason: 'Missed the bus',
      recordSessionPdu: 'Test Area PDU',
    })

    await communitySupport.stubGetReferralProgress(completedReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, inPersonSessionFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()

    const appointmentDetailsCard = page.locator('.govuk-summary-card', { hasText: 'Appointment details' })

    await expect(appointmentDetailsCard).toBeVisible()
    await expect(appointmentDetailsCard).toContainText('Method')
    await expect(appointmentDetailsCard).toContainText('In person (probation office)')
    await expect(appointmentDetailsCard).toContainText('Location')
    await expect(appointmentDetailsCard).toContainText('Test Area PDU')
    await expect(appointmentDetailsCard).not.toContainText('Reason session was not in-person')
  })

  test('shows session details and session feedback when session did happen', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(completedReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, sessionDidHappenFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()

    const pageObject = await ViewIcsSessionFeedbackPage.verifyOnPage(page)

    await expect(pageObject.header).toHaveText('View session feedback')
    await expect(page).toHaveURL(ViewIcsSessionFeedbackPage.url(caseRefId, icsFeedbackId))

    const sessionDetailsCard = page.locator('.govuk-summary-card', { hasText: 'Session details' })

    await expect(sessionDetailsCard).toBeVisible()
    await expect(sessionDetailsCard).toContainText('Session duration')
    await expect(sessionDetailsCard).toContainText('1 hour and 45 minutes')

    const sessionFeedbackCard = page.locator('.govuk-summary-card', { hasText: 'Session feedback' })

    await expect(sessionFeedbackCard).toContainText('What happened in the session')
    await expect(sessionFeedbackCard).toContainText(
      'Alex discussed his current situation and was open to new possibilities',
    )
  })

  test('shows session feedback why the session did not happen', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(didNotHappenReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, sessionDidNotHappenFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()

    const sessionFeedbackCard = page.locator('.govuk-summary-card', { hasText: 'Session feedback' })

    await expect(sessionFeedbackCard).toContainText('Why the session did not happen')
    await expect(sessionFeedbackCard).toContainText('Room booking was cancelled due to a fire alarm.')
  })

  test('shows session feedback when the user did not attend', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(didNotAttendReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, sessionDidNotAttendFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()

    const sessionFeedbackCard = page.locator('.govuk-summary-card', { hasText: 'Session feedback' })

    await expect(sessionFeedbackCard).toContainText(
      'Details about how you tried to contact Alex and why they did not attend',
    )
    await expect(sessionFeedbackCard).toContainText('Called Alex twice but no answer, left voicemail')
  })
})

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
    sessionFeedbackBehaviour: 'Engaged and positive',
    sessionFeedbackStrengthsIdentified: 'Strong family support',
    issuesOrConcernsIdentified: 'No immediate concerns identified',
    additionalSupportNeeds: 'Needs a quiet room for sessions',
    nextStepsPlannedForNextSession: 'Continue with action plan',
    nextStepsActionsBeforeNextSession: 'Complete CV template',
  })

  const sessionDidNotHappenFeedback = IcsFeedbackResponseFactory.build({
    recordSessionDidSessionHappen: false,
    recordSessionDidPersonAttend: true,
    recordSessionNotHappenReason: 'SERVICE_PROVIDER_ISSUE',
    recordSessionNotHappenReasonDetails: 'Room booking was cancelled due to a fire alarm.',
    issuesOrConcernsIdentified: 'Alex was distressed by the cancellation',
    additionalSupportNeeds: 'Needs reassurance before the rescheduled session',
  })

  const sessionDidNotAttendFeedback = IcsFeedbackResponseFactory.build({
    recordSessionDidSessionHappen: false,
    recordSessionDidPersonAttend: false,
    recordSessionNotHappenReason: 'REFERRAL_COULD_NOT_TAKE_PART',
    recordSessionNoAttendanceInformation: 'Called Alex twice but no answer, left voicemail',
    issuesOrConcernsIdentified: 'Unable to contact Alex after the missed appointment',
    additionalSupportNeeds: 'Needs a reminder before the next appointment',
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
      issuesOrConcernsIdentified: 'Travel difficulties affected attendance',
      additionalSupportNeeds: 'Needs help planning travel to the probation office',
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

    const sessionDetailsCard = page.locator('.govuk-summary-card', { hasText: 'Session details' })
    await expect(sessionDetailsCard).toContainText('Was Alex late?')
    await expect(sessionDetailsCard).toContainText('Why Alex was late')
    await expect(sessionDetailsCard).toContainText('Missed the bus')

    const issuesCard = page.locator('.govuk-summary-card', { hasText: 'Issues or concerns' })
    await expect(issuesCard).toContainText('Travel difficulties affected attendance')

    const supportCard = page.locator('.govuk-summary-card', { hasText: 'Needs and additional support' })
    await expect(supportCard).toContainText('Needs help planning travel to the probation office')
  })

  test('shows the reason and no location for a remote session', async ({ page }) => {
    const remoteSessionFeedback = IcsFeedbackResponseFactory.build({
      recordSessionHowSessionTookPlace: 'Phone call',
      recordSessionNotInPersonReason: 'Alex requested a remote session',
      recordSessionPdu: 'Location that must not be displayed',
      recordSessionAddressLine1: 'Address that must not be displayed',
      issuesOrConcernsIdentified: 'Alex had difficulty hearing during the call',
      additionalSupportNeeds: 'Needs a headset for remote sessions',
      sessionFeedbackAppointmentDetails: {
        sessionCommunications: ['informedByPhone', 'informedByTextMessage', 'informedByEmail'],
      },
    })

    await communitySupport.stubGetReferralProgress(completedReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, remoteSessionFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()
    await ViewIcsSessionFeedbackPage.verifyOnPage(page)

    const appointmentDetailsCard = page.locator('.govuk-summary-card', { hasText: 'Appointment details' })
    await expect(appointmentDetailsCard).toContainText('Phone call')
    await expect(appointmentDetailsCard).toContainText('Reason session was not in-person')
    await expect(appointmentDetailsCard).toContainText('Alex requested a remote session')
    await expect(appointmentDetailsCard.getByText('Location', { exact: true })).toHaveCount(0)
    await expect(appointmentDetailsCard).not.toContainText('Location that must not be displayed')
    await expect(appointmentDetailsCard).not.toContainText('Address that must not be displayed')

    const submittedByRow = appointmentDetailsCard
      .locator('.govuk-summary-list__row')
      .filter({ hasText: 'Feedback submitted by' })
    await expect(submittedByRow).toContainText('CaseWorker Two')
    await expect(submittedByRow.getByRole('link')).toHaveAttribute(
      'href',
      `mailto:${caseWorkerTwo.emailAddress}`,
    )

    const communicationRow = appointmentDetailsCard
      .locator('.govuk-summary-list__row')
      .filter({ hasText: 'How Alex was informed about the session' })
    await expect(communicationRow.locator('.govuk-summary-list__value')).toHaveText('Phone call, Text message, Email')

    const issuesCard = page.locator('.govuk-summary-card', { hasText: 'Issues or concerns' })
    await expect(issuesCard).toContainText('Alex had difficulty hearing during the call')

    const supportCard = page.locator('.govuk-summary-card', { hasText: 'Needs and additional support' })
    await expect(supportCard).toContainText('Needs a headset for remote sessions')
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
    await expect(sessionDetailsCard).toContainText('Was Alex late?')
    await expect(sessionDetailsCard).not.toContainText('Why Alex was late')
    await expect(sessionDetailsCard).not.toContainText('No reason provided')

    const sessionFeedbackCard = page.locator('.govuk-summary-card', { hasText: 'Session feedback' })

    await expect(sessionFeedbackCard).toContainText('What happened in the session')
    await expect(sessionFeedbackCard).toContainText(
      'Alex discussed his current situation and was open to new possibilities',
    )
    await expect(sessionFeedbackCard).toContainText('How Alex behaved')
    await expect(sessionFeedbackCard).toContainText('Engaged and positive')
    await expect(sessionFeedbackCard).toContainText('Strengths identified')
    await expect(sessionFeedbackCard).toContainText('Strong family support')
    await expect(sessionFeedbackCard).not.toContainText('Why the session did not happen')
    await expect(sessionFeedbackCard).not.toContainText('Details about how you tried to contact')

    const attendanceCard = page.locator('.govuk-summary-card', { hasText: 'Record session attendance' })
    await expect(attendanceCard).toHaveCount(0)

    const issuesCard = page.locator('.govuk-summary-card', { hasText: 'Issues or concerns' })
    await expect(issuesCard).toContainText('Issues or concerns identified')
    await expect(issuesCard).toContainText('No immediate concerns identified')

    const additionalSupportNeedsCard = page.locator('.govuk-summary-card', {
      hasText: 'Needs and additional support',
    })
    await expect(additionalSupportNeedsCard).toContainText('New support needs identified')
    await expect(additionalSupportNeedsCard).toContainText('Needs a quiet room for sessions')

    const nextStepsCard = page.locator('.govuk-summary-card', { hasText: 'Next steps' })
    await expect(nextStepsCard).toContainText('Planned for the next session')
    await expect(nextStepsCard).toContainText('Actions before the next session')
    await expect(nextStepsCard).toContainText('Continue with action plan')
    await expect(nextStepsCard).toContainText('Complete CV template')
  })

  test('shows the reason when the person attended but the session did not happen', async ({ page }) => {
    await communitySupport.stubGetReferralProgress(didNotHappenReferralProgress, caseRefId)
    await communitySupport.stubGetIcsSessionFeedback(icsFeedbackId, sessionDidNotHappenFeedback, 200)

    await page.goto(`/progress/${caseRefId}`)
    await page.getByRole('link', { name: 'View feedback' }).click()

    const sessionDetailsCard = page.locator('.govuk-summary-card', { hasText: 'Session details' })
    await expect(sessionDetailsCard).toHaveCount(0)

    const sessionFeedbackCard = page.locator('.govuk-summary-card', { hasText: 'Session feedback' })

    await expect(sessionFeedbackCard).toContainText('Why the session did not happen')
    await expect(sessionFeedbackCard).toContainText('Service provider issue')
    await expect(sessionFeedbackCard).toContainText('Room booking was cancelled due to a fire alarm.')
    await expect(sessionFeedbackCard.locator('.govuk-summary-list__row')).toHaveCount(1)

    const attendanceCard = page.locator('.govuk-summary-card', { hasText: 'Record session attendance' })
    await expect(attendanceCard).toBeVisible()
    const happenedRow = attendanceCard.locator('.govuk-summary-list__row').filter({ hasText: 'Did the session happen?' })
    await expect(happenedRow.locator('.govuk-summary-list__value')).toHaveText('No')
    const attendedRow = attendanceCard
      .locator('.govuk-summary-list__row')
      .filter({ hasText: 'Did Alex come to the appointment?' })
    await expect(attendedRow.locator('.govuk-summary-list__value')).toHaveText('Yes')

    const additionalSupportNeedsCard = page.locator('.govuk-summary-card', { hasText: 'Needs and additional support' })
    await expect(additionalSupportNeedsCard).toHaveCount(0)

    const issuesCard = page.locator('.govuk-summary-card', { hasText: 'Issues or concerns' })
    await expect(issuesCard).toHaveCount(0)

    const nextStepsCard = page.locator('.govuk-summary-card', { hasText: 'Next steps' })
    await expect(nextStepsCard).toHaveCount(0)
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
    await expect(sessionFeedbackCard.locator('.govuk-summary-list__row')).toHaveCount(1)
    await expect(sessionFeedbackCard).not.toContainText('Why the session did not happen')

    const attendanceCard = page.locator('.govuk-summary-card', { hasText: 'Record session attendance' })
    await expect(attendanceCard).toContainText('Did Alex come to the appointment?')
    await expect(attendanceCard).toContainText('No')

    const issuesCard = page.locator('.govuk-summary-card', { hasText: 'Issues or concerns' })
    await expect(issuesCard).toHaveCount(0)

    const supportCard = page.locator('.govuk-summary-card', { hasText: 'Needs and additional support' })
    await expect(supportCard).toHaveCount(0)

    const sessionDetailsCard = page.locator('.govuk-summary-card', { hasText: 'Session details' })
    await expect(sessionDetailsCard).toHaveCount(0)

    const nextStepsCard = page.locator('.govuk-summary-card', { hasText: 'Next steps' })
    await expect(nextStepsCard).toHaveCount(0)
  })
})

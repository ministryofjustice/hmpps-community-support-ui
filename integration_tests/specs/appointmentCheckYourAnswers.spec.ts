import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { createAppointmentReferenceData, prisonsData, probationOfficesData } from '../mockData/referenceData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import { login, resetStubs, seedAppointmentSession } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AppointmentCheckYourAnswersPage from '../pages/AppointmentCheckYourAnswersPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import AppointmentTypePage from '../pages/AppointmentTypePage'
import CreateAppointmentDetailsPage from '../pages/createAppointmentDetailsPage'
import prisonApi from '../mockApis/prisonApi'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'
import IcsFeedbackCheckYourAnswersPage from '../pages/IcsFeedbackCheckYourAnswersPage'
import ReferralAppointmentsPage from '../pages/referralAppointmentsPage'
import { getMatchingRequests, stubFor } from '../mockApis/wiremock'

const CASE_REFERENCE = 'AB1234CD'

const appointmentSessionData = {
  appointmentType: 'CONTACT_SESSION',
  date: '2026-10-16',
  startTime: '1:30pm',
  method: 'IN_PERSON_PROBATION_OFFICE',
  probationOfficeLocationId: '2',
  informedBy: ['informedByPhone', 'informedByEmail'],
}

const appointmentResponse = {
  appointmentIcsId: '123e4567-e89b-12d3-a456-426614174000',
  appointmentId: '987fcdeb-51a2-43e8-9f9b-123456789abc',
  referralId: randomUUID(),
  caseReference: CASE_REFERENCE,
  appointmentType: 'CONTACT_SESSION' as const,
  appointmentDate: '2026-10-16',
  appointmentTime: { hour: 1, minute: 30, amPm: 'pm' },
  appointmentStatus: 'SCHEDULED' as const,
  sessionMethod: {
    appointmentCategory: 'IN_PERSON' as const,
    type: 'IN_PERSON_PROBATION_OFFICE' as const,
    probationOfficeName: 'Derbyshire: Buxton Probation Office',
  },
  sessionCommunications: ['informedByPhone', 'informedByEmail'],
  referralFirstName: 'John',
  referralLastName: 'Doe',
  createdAt: '2026-10-16T10:15:30Z',
}

test.describe('Appointment Check Your Answers Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await Promise.all([
      communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity),
      communitySupport.stubGetCreateAppointmentReferenceData(CASE_REFERENCE, createAppointmentReferenceData),
      communitySupport.stubSubmitAppointment(CASE_REFERENCE, appointmentResponse),
      communitySupport.stubGetReferralProgress(buildReferralProgress([], CASE_REFERENCE), CASE_REFERENCE),
      communitySupport.stubGetReferralAppointments(
        {
          personDetails: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1980-01-01',
            crn: 'X123456',
          },
          upcomingAppointments: [],
          pastAppointments: [],
        },
        CASE_REFERENCE,
      ),
      communitySupport.stubGetProbationOffices(probationOfficesData),
      prisonApi.stubGetPrisons(),
    ])
  })

  test('submits the appointment and returns to the appointments page', async ({ page }) => {
    await seedAppointmentSession(page, appointmentSessionData)

    await page.goto(AppointmentCheckYourAnswersPage.url(CASE_REFERENCE))
    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(cyaPage.summaryCard.getByRole('heading', { name: 'Contact session' })).toBeVisible()
    await expect(cyaPage.probationOfficeRow).toContainText('Derbyshire: Buxton Probation Office')
    await expect(cyaPage.submitButton).toHaveText('Submit')

    await cyaPage.submitButton.click()
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/appointments`)
  })

  test('collects feedback for a retrospective ICS and returns to its past appointment', async ({ page }) => {
    const ics = { ...appointmentResponse, appointmentType: 'ICS' as const }
    await Promise.all([
      communitySupport.stubSubmitAppointment(CASE_REFERENCE, ics),
      communitySupport.stubGetIcsFeedbackAttendance(CASE_REFERENCE, ics),
      communitySupport.stubGetIcsFeedbackDidSessionTakePlace(CASE_REFERENCE, ics),
      communitySupport.stubGetIcsFeedbackSessionDetails(CASE_REFERENCE, ics),
      ...['session-feedback', 'issues-or-concerns', 'identified-additional-needs', 'next-steps'].map(feedbackPage =>
        communitySupport.stubGetIcsFeedbackPage(CASE_REFERENCE, feedbackPage, { referralFirstName: 'John' }),
      ),
      communitySupport.stubGetIcsFeedbackPage(CASE_REFERENCE, 'check-answers', {
        referralFirstName: 'John',
        appointmentIcsId: ics.appointmentIcsId,
      }),
      communitySupport.stubIcsFeedbackSubmission(
        { record: { didSessionHappen: true } },
        ics.appointmentIcsId,
        CASE_REFERENCE,
      ),
      stubFor({
        request: {
          method: 'GET',
          urlPath: `/community-support/bff/referral/${CASE_REFERENCE}/existing-support-needs`,
        },
        response: { status: 404 },
      }),
      communitySupport.stubGetReferralAppointments(
        {
          personDetails: { firstName: 'John', lastName: 'Doe', dateOfBirth: '1980-01-01', crn: 'X123456' },
          upcomingAppointments: [],
          pastAppointments: [
            {
              id: ics.appointmentId,
              label: 'Initial contact session',
              appointmentDate: ics.appointmentDate,
              appointmentTime: ics.appointmentTime,
              appointmentStatus: 'COMPLETED',
            },
          ],
        },
        CASE_REFERENCE,
      ),
    ])
    await seedAppointmentSession(page, { ...appointmentSessionData, appointmentType: 'ICS' })
    await page.goto(AppointmentCheckYourAnswersPage.url(CASE_REFERENCE))
    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(cyaPage.submitButton).toHaveText('Continue')
    await cyaPage.submitButton.click()

    await expect(page).toHaveURL(RecordSessionAttendancePage.url(CASE_REFERENCE))
    const attendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await attendancePage.selectHappened('Yes')
    await attendancePage.clickContinue()

    await expect(page).toHaveURL(`/ics-feedback/${CASE_REFERENCE}/did-session-take-place`)
    await page.locator('[name="didSessionTakePlaceAsPlanned"][value="yes"]').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(page).toHaveURL(`/ics-feedback/${CASE_REFERENCE}/session-details`)
    await page.locator('[name="wasPersonLate"][value="No"]').check()
    await page.locator('[name="sessionDuration-hours"]').fill('1')
    await page.locator('[name="sessionDuration-minutes"]').fill('0')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(page).toHaveURL(`/ics-feedback/${CASE_REFERENCE}/session-feedback`)
    await page.locator('[name="whatDidYouDo"]').fill('Discussed the support available.')
    await page.locator('[name="behaviour"]').fill('John engaged well throughout.')
    await page.locator('[name="strengthsIdentified"]').fill('Strong family support.')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(page).toHaveURL(`/ics-feedback/${CASE_REFERENCE}/issues-or-concerns`)
    await page.locator('[name="issuesOrConcerns"]').fill('No issues or concerns identified.')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(page).toHaveURL(`/ics-feedback/${CASE_REFERENCE}/identified-additional-needs`)
    await page.locator('[name="didYouIdentify"][value="No"]').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(page).toHaveURL(`/ics-feedback/${CASE_REFERENCE}/next-steps`)
    await page.locator('[name="plannedForNextSession"]').fill('Review the support plan.')
    await page.locator('[name="actionsBeforeNextSession"]').fill('Contact the support provider.')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    const feedbackCyaPage = await IcsFeedbackCheckYourAnswersPage.verifyOnPage(page)
    const feedbackRequestsBeforeSubmit = await getMatchingRequests({
      method: 'POST',
      urlPath: `/community-support/referral/${CASE_REFERENCE}/ics/${ics.appointmentIcsId}/feedback`,
    })
    expect(feedbackRequestsBeforeSubmit.body.requests).toHaveLength(0)
    await feedbackCyaPage.submitButton.click()

    await expect(page).toHaveURL(ReferralAppointmentsPage.url(CASE_REFERENCE))
    const appointmentsPage = new ReferralAppointmentsPage(page)
    await expect(appointmentsPage.pastAppointmentsTable).toContainText('Initial contact session')
    await expect(appointmentsPage.pastAppointmentsTable).toContainText('Completed')
    await expect(appointmentsPage.successAlert).toContainText('Session feedback submitted')
    const creationRequests = await getMatchingRequests({
      method: 'POST',
      urlPath: `/community-support/referral/${CASE_REFERENCE}/appointment`,
    })
    expect(creationRequests.body.requests).toHaveLength(1)
    const feedbackRequests = await getMatchingRequests({
      method: 'POST',
      urlPath: `/community-support/referral/${CASE_REFERENCE}/ics/${ics.appointmentIcsId}/feedback`,
    })
    expect(feedbackRequests.body.requests).toHaveLength(1)
    expect(JSON.parse(feedbackRequests.body.requests[0].body)).toMatchObject({
      record: { didSessionHappen: true },
      sessionFeedback: { whatHappened: 'Discussed the support available.' },
    })
  })

  for (const appointmentType of [
    'ICS',
    'CONTACT_SESSION',
    'HANDOVER_SESSION',
    'POST_RELEASE_SESSION',
    'PRE_RELEASE_SESSION',
  ]) {
    test(`shows next steps for a past ${appointmentType}`, async ({ page }) => {
      await seedAppointmentSession(page, {
        ...appointmentSessionData,
        appointmentType,
        date: '2000-01-01',
      })

      await page.goto(AppointmentCheckYourAnswersPage.url(CASE_REFERENCE))
      await AppointmentCheckYourAnswersPage.verifyOnPage(page)
      await expect(page.locator('.govuk-summary-card + h2')).toHaveText('What happens next')
      await expect(
        page.getByText("As you've entered a date and time in the past, we'll ask you to add appointment feedback.", {
          exact: true,
        }),
      ).toBeVisible()
      await expect(page.locator('.govuk-notification-banner, [role="alert"]')).toHaveCount(0)
    })
  }

  test('allows a user to change the appointment details before submitting', async ({ page }) => {
    await seedAppointmentSession(page, appointmentSessionData)

    await page.goto(AppointmentCheckYourAnswersPage.url(CASE_REFERENCE))
    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)

    await cyaPage.changeLink.click()
    await AppointmentTypePage.verifyOnPage(page)
    await page.getByRole('radio', { name: 'Post-release session' }).check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    const detailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'POST_RELEASE_SESSION')
    await detailsPage.fillDateAndTime('21/6/2026', '10', '30', 'AM')
    await detailsPage.phoneCallRadioButton.click()
    await detailsPage.phoneCallReasonInput.fill('John is unable to travel to the probation office')
    await detailsPage.meetAtTheGateYesRadioButton.check()
    await detailsPage.informedByEmailCheckbox.check()
    await detailsPage.saveAndContinueButton.click()

    const updatedCyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(updatedCyaPage.heading).toHaveText('Check the details before booking the post-release session')
    await expect(updatedCyaPage.summaryCard).toContainText('Post-release session')
    await expect(updatedCyaPage.dateRow).toContainText('21 June 2026')
    await expect(updatedCyaPage.methodRow).toContainText('Phone call')
    await expect(updatedCyaPage.reasonSessionNotInPersonRow).toContainText(
      'John is unable to travel to the probation office',
    )
    await expect(updatedCyaPage.informedByRow).toContainText('Email')

    await updatedCyaPage.submitButton.click()
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/appointments`)
  })

  test('does not show the informed-by row for a handover session', async ({ page }) => {
    await seedAppointmentSession(page, {
      appointmentType: 'HANDOVER_SESSION',
      date: '2026-10-16',
      startTime: '1:30pm',
      method: 'IN_PERSON',
      informedBy: ['informedByPhone'],
    })

    await page.goto(AppointmentCheckYourAnswersPage.url(CASE_REFERENCE))
    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)

    await expect(cyaPage.informedByRow).toHaveCount(0)
  })

  test('shows the selected prison after changing to a pre-release session', async ({ page }) => {
    await seedAppointmentSession(page, {
      appointmentType: 'CONTACT_SESSION',
      date: '2026-10-16',
      startTime: '1:30pm',
      method: 'IN_PERSON_PROBATION_OFFICE',
      probationOfficeLocationId: '2',
      informedBy: ['informedByPhone'],
    })

    await page.goto(AppointmentCheckYourAnswersPage.url(CASE_REFERENCE))
    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)

    await cyaPage.changeLink.click()
    await AppointmentTypePage.verifyOnPage(page)
    await page.getByRole('radio', { name: 'Pre-release session' }).check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    const detailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
    await detailsPage.fillDateAndTime('21/6/2026', '10', '30', 'AM')
    await detailsPage.prisonRadioButton.check()
    await detailsPage.prisonSelect.selectOption(prisonsData[0].agencyId)
    await detailsPage.saveAndContinueButton.click()

    const updatedCyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(updatedCyaPage.methodRow).toContainText('In person: prison')
    await expect(updatedCyaPage.prisonRow).toContainText(prisonsData[0].description)
  })
})

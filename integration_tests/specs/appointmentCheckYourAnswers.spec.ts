import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { createAppointmentReferenceData, probationOfficesData } from '../mockData/referenceData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import { login, resetStubs, seedAppointmentSession } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AppointmentCheckYourAnswersPage from '../pages/AppointmentCheckYourAnswersPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import AppointmentTypePage from '../pages/AppointmentTypePage'
import CreateAppointmentDetailsPage from '../pages/createAppointmentDetailsPage'
import prisonApi from '../mockApis/prisonApi'

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
          appointments: [],
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

    await cyaPage.submitButton.click()
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/appointments`)
  })

  test('allows a user to change the appointment details before submitting', async ({ page }) => {
    await seedAppointmentSession(page, appointmentSessionData)

    await page.goto(AppointmentCheckYourAnswersPage.url(CASE_REFERENCE))
    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)

    await cyaPage.changeLink.click()
    await AppointmentTypePage.verifyOnPage(page)
    await page.getByRole('radio', { name: 'Post-release session' }).check()
    await page.getByRole('button', { name: 'Save and continue' }).click()

    const detailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'POST_RELEASE_SESSION')
    await detailsPage.fillDateAndTime('21/6/2026', '10', '30', 'AM')
    await detailsPage.phoneCallRadioButton.click()
    await detailsPage.phoneCallReasonInput.fill('Updated reason')
    await detailsPage.meetAtTheGateYesRadioButton.check()
    await detailsPage.informedByEmailCheckbox.check()
    await detailsPage.saveAndContinueButton.click()

    const updatedCyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(updatedCyaPage.heading).toHaveText('Check the details before scheduling the post-release session')
    await expect(updatedCyaPage.summaryCard).toContainText('Post-release session details')
    await expect(updatedCyaPage.dateRow).toContainText('21/6/2026')
    await expect(updatedCyaPage.methodRow).toContainText('Phone call')
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

  test('shows the entered other-location address in the location row after changing to a pre-release session', async ({
    page,
  }) => {
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
    await page.getByRole('button', { name: 'Save and continue' }).click()

    const detailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
    await detailsPage.fillDateAndTime('21/6/2026', '10', '30', 'AM')
    await detailsPage.inSomewhereElseRadioButton.click()
    await detailsPage.addressLine1Input.fill('1 High Street')
    await detailsPage.townInput.fill('Derby')
    await detailsPage.postcodeInput.fill('DE1 2EQ')
    await detailsPage.informedByPhoneCheckbox.check()
    await detailsPage.saveAndContinueButton.click()

    const updatedCyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(updatedCyaPage.locationRow).toContainText('1 High Street, Derby, DE1 2EQ')
  })
})

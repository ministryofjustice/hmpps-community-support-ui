import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import AppointmentTypePage from '../pages/AppointmentTypePage'
import CreateAppointmentDetailsPage from '../pages/createAppointmentDetailsPage'
import AppointmentCheckYourAnswersPage from '../pages/AppointmentCheckYourAnswersPage'
import { createAppointmentReferenceData, probationOfficesData } from '../mockData/referenceData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ReferralAppointmentsPage from '../pages/referralAppointmentsPage'
import ReferralProgressPage from '../pages/referralProgressPage'

const CASE_REFERENCE = 'AB1234CD'

const appointmentResponse = {
  appointmentIcsId: '123e4567-e89b-12d3-a456-426614174000',
  appointmentId: '987fcdeb-51a2-43e8-9f9b-123456789abc',
  referralId: randomUUID(),
  caseReference: CASE_REFERENCE,
  appointmentType: 'PRE_RELEASE_SESSION' as const,
  appointmentDate: '2026-10-16',
  appointmentTime: { hour: 1, minute: 30, amPm: 'pm' },
  appointmentStatus: 'SCHEDULED' as const,
  sessionMethod: {
    appointmentCategory: 'IN_PERSON' as const,
    type: 'IN_PERSON_OTHER_LOCATION' as const,
    probationOfficeName: 'Other location',
  },
  sessionCommunications: ['informedByPhone'],
  referralFirstName: 'John',
  referralLastName: 'Doe',
  createdAt: '2026-10-16T10:15:30Z',
}

test.describe('Full appointment journey', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await Promise.all([
      communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity),
      communitySupport.stubGetCreateAppointmentReferenceData(CASE_REFERENCE, createAppointmentReferenceData),
      communitySupport.stubGetProbationOffices(probationOfficesData),
      prisonApi.stubGetPrisons(),
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
          appointments: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              label: 'Contact session',
              appointmentDate: '2026-10-16',
              appointmentTime: { hour: 1, minute: 30, amPm: 'pm' },
              appointmentStatus: 'SCHEDULED',
            },
          ],
        },
        CASE_REFERENCE,
      ),
    ])
  })

  test('creates, updates and submits an appointment end to end', async ({ page }) => {
    await page.goto(ReferralProgressPage.url(CASE_REFERENCE))
    const referralProgressPage = await ReferralProgressPage.verifyOnPage(page)

    await referralProgressPage.appointmentsLink.click()
    await expect(page).toHaveURL(ReferralAppointmentsPage.url(CASE_REFERENCE))

    const appointmentsPage = new ReferralAppointmentsPage(page)
    await appointmentsPage.verifyOnPage()
    await appointmentsPage.createAppointmentLink.click()
    await expect(page).toHaveURL(AppointmentTypePage.url(CASE_REFERENCE))
    const appointmentTypePage = await AppointmentTypePage.verifyOnPage(page)

    await appointmentTypePage.selectAppointmentType('CONTACT_SESSION')
    await appointmentTypePage.continueButton.click()

    const initialDetailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
    await initialDetailsPage.fillDateAndTime('21/6/2026', '10', '30', 'AM')
    await initialDetailsPage.videoCallRadioButton.click()
    await initialDetailsPage.videoCallReasonInput.fill('Initial reason')
    await initialDetailsPage.informedByPhoneCheckbox.check()
    await initialDetailsPage.saveAndContinueButton.click()

    const initialCyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await initialCyaPage.changeLink.click()
    await AppointmentTypePage.verifyOnPage(page)

    await page.getByRole('radio', { name: 'Pre-release session' }).check()
    await page.getByRole('button', { name: 'Save and continue' }).click()

    const preReleaseDetailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
    await preReleaseDetailsPage.fillDateAndTime('21/6/2026', '10', '30', 'AM')
    await preReleaseDetailsPage.inSomewhereElseRadioButton.click()
    await preReleaseDetailsPage.addressLine1Input.fill('1 High Street')
    await preReleaseDetailsPage.townInput.fill('Derby')
    await preReleaseDetailsPage.postcodeInput.fill('DE1 2EQ')
    await preReleaseDetailsPage.informedByPhoneCheckbox.check()
    await preReleaseDetailsPage.saveAndContinueButton.click()

    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(cyaPage.locationRow).toContainText('1 High Street, Derby, DE1 2EQ')

    await cyaPage.submitButton.click()
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/appointments`)
  })
})

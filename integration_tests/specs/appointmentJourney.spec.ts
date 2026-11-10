import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { addDays, format } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import AppointmentTypePage from '../pages/AppointmentTypePage'
import CreateAppointmentDetailsPage from '../pages/createAppointmentDetailsPage'
import AppointmentCheckYourAnswersPage from '../pages/AppointmentCheckYourAnswersPage'
import { createAppointmentReferenceData, prisonsData, probationOfficesData } from '../mockData/referenceData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ReferralAppointmentsPage from '../pages/referralAppointmentsPage'
import ReferralProgressPage from '../pages/referralProgressPage'
import { getMatchingRequests } from '../mockApis/wiremock'

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
    type: 'IN_PERSON_PRISON' as const,
    prisonCode: prisonsData[0].agencyId,
    prisonName: prisonsData[0].description,
  },
  sessionCommunications: [],
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
    await appointmentsPage.bookAppointmentButton.click()
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
    await expect(initialCyaPage.methodRow).toContainText('Video call')
    await expect(initialCyaPage.reasonSessionNotInPersonRow).toContainText('Initial reason')
    await initialCyaPage.changeLink.click()
    await AppointmentTypePage.verifyOnPage(page)

    await page.getByRole('radio', { name: 'Pre-release session' }).check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    const preReleaseDetailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
    await preReleaseDetailsPage.fillDateAndTime('21/6/2026', '10', '30', 'AM')
    await preReleaseDetailsPage.prisonRadioButton.check()
    await preReleaseDetailsPage.prisonSelect.selectOption(prisonsData[0].agencyId)
    await preReleaseDetailsPage.saveAndContinueButton.click()

    const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
    await expect(cyaPage.methodRow).toContainText('In person: prison')
    await expect(cyaPage.prisonRow).toContainText(prisonsData[0].description)
    await expect(cyaPage.informedByRow).toHaveCount(0)

    await cyaPage.changeLink.click()
    const typePage = await AppointmentTypePage.verifyOnPage(page)
    await typePage.continueButton.click()
    const returnedPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
    await expect(returnedPage.prisonRadioButton).toBeChecked()
    await expect(returnedPage.prisonSelect).toHaveValue(prisonsData[0].agencyId)
    await returnedPage.saveAndContinueButton.click()
    await AppointmentCheckYourAnswersPage.verifyOnPage(page)

    await cyaPage.submitButton.click()
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/appointments`)

    const appointmentsAfterBooking = new ReferralAppointmentsPage(page)
    await expect(appointmentsAfterBooking.successAlert).toContainText('Pre-release session booked')
    await expect(appointmentsAfterBooking.successAlert).toContainText(
      'Pre-release session booked for 16 October 2026 at 1:30pm',
    )

    await page.reload()
    await expect(appointmentsAfterBooking.successAlert).toHaveCount(0)
    const requests = await getMatchingRequests({
      method: 'POST',
      urlPath: `/community-support/referral/${CASE_REFERENCE}/appointment`,
    })
    expect(requests.body.requests).toHaveLength(1)
    const requestBody = JSON.parse(requests.body.requests[0].body)
    expect(requestBody).toMatchObject({
      appointmentType: 'PRE_RELEASE_SESSION',
      sessionMethodRequest: { type: 'IN_PERSON_PRISON', prisonCode: prisonsData[0].agencyId },
      sessionCommunication: [],
    })
    expect(requestBody.sessionMethodRequest).toEqual({ type: 'IN_PERSON_PRISON', prisonCode: prisonsData[0].agencyId })
    expect(requestBody).not.toHaveProperty('meetAtTheGate')
  })

  for (const method of ['PHONE', 'VIDEO'] as const) {
    test(`submits a pre-release ${method.toLowerCase()} session with its reason`, async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
      const detailsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
      await detailsPage.fillDateAndTime(format(addDays(new Date(), 7), 'd/M/yyyy'), '10', '30', 'AM')
      await (method === 'PHONE' ? detailsPage.phoneCallRadioButton : detailsPage.videoCallRadioButton).check()
      await (method === 'PHONE' ? detailsPage.phoneCallReasonInput : detailsPage.videoCallReasonInput).fill(
        'The person cannot attend in person',
      )
      await detailsPage.saveAndContinueButton.click()
      const cyaPage = await AppointmentCheckYourAnswersPage.verifyOnPage(page)
      await expect(cyaPage.reasonSessionNotInPersonRow).toContainText('The person cannot attend in person')
      await expect(cyaPage.informedByRow).toHaveCount(0)
      await cyaPage.submitButton.click()
      await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/appointments`)

      const requests = await getMatchingRequests({
        method: 'POST',
        urlPath: `/community-support/referral/${CASE_REFERENCE}/appointment`,
      })
      expect(requests.body.requests).toHaveLength(1)
      const requestBody = JSON.parse(requests.body.requests[0].body)
      expect(requestBody.sessionMethodRequest).toEqual({
        type: method,
        additionalDetails: 'The person cannot attend in person',
      })
      expect(requestBody.sessionCommunication).toEqual([])
      expect(requestBody).not.toHaveProperty('meetAtTheGate')
    })
  }
})

import { expect, test } from '@playwright/test'
import { ReferralProgress } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import AppointmentTypePage from '../pages/AppointmentTypePage'
import CreateAppointmentDetailsPage from '../pages/createAppointmentDetailsPage'
import { createAppointmentReferenceData, probationOfficesData } from '../mockData/referenceData'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'

const CASE_REFERENCE = 'AB1234CD'

test.describe('Appointment Type Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await Promise.all([
      communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity),
      communitySupport.stubGetCreateAppointmentReferenceData(CASE_REFERENCE, createAppointmentReferenceData),
      communitySupport.stubGetProbationOffices(probationOfficesData),
      prisonApi.stubGetPrisons(),
    ])
  })

  test('should display the appointment type options returned by the BFF endpoint', async ({ page }) => {
    await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
    const appointmentTypePage = await AppointmentTypePage.verifyOnPage(page)

    await expect(page).toHaveTitle('Select the appointment type - Community Support')
    await expect(appointmentTypePage.heading).toHaveText('Create an appointment for John Doe')
    await expect(appointmentTypePage.radioOption('CONTACT_SESSION')).toBeVisible()
    await expect(appointmentTypePage.radioOption('PRE_RELEASE_SESSION')).toBeVisible()
    await expect(appointmentTypePage.radioOption('POST_RELEASE_SESSION')).toBeVisible()
    await expect(appointmentTypePage.radioOption('HANDOVER_SESSION')).toBeVisible()
  })

  test('should show a validation error when no appointment type is selected', async ({ page }) => {
    await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
    const appointmentTypePage = await AppointmentTypePage.verifyOnPage(page)

    await appointmentTypePage.continueButton.click()

    await expect(page).toHaveURL(AppointmentTypePage.url(CASE_REFERENCE))
    await expect(appointmentTypePage.errorSummary).toContainText('Select the appointment type')
  })

  test('should go to the appointment details page after saving the appointment type', async ({ page }) => {
    await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
    const appointmentTypePage = await AppointmentTypePage.verifyOnPage(page)

    await appointmentTypePage.selectAppointmentType('POST_RELEASE_SESSION')
    await appointmentTypePage.continueButton.click()

    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/appointment-details`)
    await CreateAppointmentDetailsPage.verifyOnPage(page, 'POST_RELEASE_SESSION')
  })

  test('should return to the appointments tab when the back link is clicked', async ({ page }) => {
    const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([], CASE_REFERENCE)
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, CASE_REFERENCE)
    await communitySupport.stubGetReferralAppointments(
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
    )

    await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
    const appointmentTypePage = await AppointmentTypePage.verifyOnPage(page)

    await appointmentTypePage.backLink.click()

    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/appointments`)
    await expect(page.getByRole('heading', { name: 'Appointments', level: 2 })).toBeVisible()
  })
})

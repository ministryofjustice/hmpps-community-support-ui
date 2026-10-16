import { expect, test } from '@playwright/test'
import { ReferralProgress } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AppointmentTypePage from '../pages/AppointmentTypePage'
import ReferralProgressPage from '../pages/referralProgressPage'
import { createAppointmentReferenceData } from '../mockData/referenceData'
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

  // TODO:
  //  Update this test to check for the correct redirect URL once the appointment details page is implemented

  test('should save the appointment type and return a redirect response', async ({ page }) => {
    await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
    await AppointmentTypePage.verifyOnPage(page)

    const response = await page.request.post(AppointmentTypePage.url(CASE_REFERENCE), {
      form: { appointmentType: 'POST_RELEASE_SESSION' },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(302)
  })

  // TODO:
  //  Update this test to check for the correct redirect URL once the appointments tab page is implemented

  test('should return to referral progress when the back link is clicked', async ({ page }) => {
    const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([], CASE_REFERENCE)
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, CASE_REFERENCE)

    await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
    const appointmentTypePage = await AppointmentTypePage.verifyOnPage(page)

    await appointmentTypePage.backLink.click()

    await expect(page).toHaveURL(ReferralProgressPage.url(CASE_REFERENCE))
    await ReferralProgressPage.verifyOnPage(page)
  })
})

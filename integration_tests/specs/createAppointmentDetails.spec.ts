import { test, expect } from '@playwright/test'
import { format, addDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import CreateAppointmentDetailsPage, { SessionType } from '../pages/createAppointmentDetailsPage'
import { referralInformationInCommunity, referralInformationInPrison } from '../mockData/referralInformationData'
import { createAppointmentReferenceData, probationOfficesData } from '../mockData/referenceData'

const CASE_REFERENCE = 'AB1234CD'
const futureDate = () => format(addDays(new Date(), 7), 'd/M/yyyy')

test.describe('Create an appointment - appointment details page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await Promise.all([
      prisonApi.stubGetPrisons(),
      communitySupport.stubGetProbationOffices(probationOfficesData),
      communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity),
      communitySupport.stubGetCreateAppointmentReferenceData(CASE_REFERENCE, createAppointmentReferenceData),
    ])
  })

  test('redirects to the appointment type page when the session type is invalid', async ({ page }) => {
    await page.goto(`/referral/${CASE_REFERENCE}/create-an-appointment/appointment-details?session=nonsense`)
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/appointment-type`)
  })

  test.describe('field visibility per session type', () => {
    test('contact session', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
      await expect(appointmentPage.phoneCallRadioButton).toBeVisible()
      await expect(appointmentPage.videoCallRadioButton).toBeVisible()
      await expect(appointmentPage.inProbationOfficeRadioButton).toBeVisible()
      await expect(appointmentPage.inSomewhereElseRadioButton).toBeVisible()
      await expect(appointmentPage.inPersonRadioButton).toHaveCount(0)
      await expect(appointmentPage.meetAtTheGateFieldset).toHaveCount(0)
      await expect(appointmentPage.informedByPhoneCheckbox).toBeVisible()
    })

    test('pre-release session', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
      await expect(appointmentPage.inProbationOfficeRadioButton).toHaveCount(0)
      await expect(appointmentPage.inSomewhereElseRadioButton).toBeVisible()
      await expect(appointmentPage.meetAtTheGateFieldset).toHaveCount(0)
      await expect(appointmentPage.informedByPhoneCheckbox).toBeVisible()
    })

    test('post-release session', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'POST_RELEASE_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'POST_RELEASE_SESSION')
      await expect(appointmentPage.inProbationOfficeRadioButton).toBeVisible()
      await expect(appointmentPage.inSomewhereElseRadioButton).toBeVisible()
      await expect(appointmentPage.meetAtTheGateYesRadioButton).toBeVisible()
      await expect(appointmentPage.meetAtTheGateNoRadioButton).toBeVisible()
      await expect(appointmentPage.informedByPhoneCheckbox).toBeVisible()
    })

    test('handover session', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'HANDOVER_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'HANDOVER_SESSION')
      await expect(appointmentPage.phoneCallRadioButton).toBeVisible()
      await expect(appointmentPage.videoCallRadioButton).toBeVisible()
      await expect(appointmentPage.inPersonRadioButton).toBeVisible()
      await expect(appointmentPage.inProbationOfficeRadioButton).toHaveCount(0)
      await expect(appointmentPage.inSomewhereElseRadioButton).toHaveCount(0)
      await expect(appointmentPage.meetAtTheGateFieldset).toHaveCount(0)
      await expect(appointmentPage.informedByPhoneCheckbox).toHaveCount(0)
    })

    test('handover session for a person in prison has no prison option', async ({ page }) => {
      await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInPrison)
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'HANDOVER_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'HANDOVER_SESSION')
      await expect(appointmentPage.inPersonRadioButton).toBeVisible()
      await expect(page.locator('input[type="radio"][value="InPrison"]')).toHaveCount(0)
    })
  })

  test.describe('save and continue', () => {
    const journeys: { session: SessionType; fill: (p: CreateAppointmentDetailsPage) => Promise<void> }[] = [
      {
        session: 'CONTACT_SESSION',
        fill: async p => {
          await p.videoCallRadioButton.click()
          await p.videoCallReasonInput.fill('Some reasons')
          await p.informedByPhoneCheckbox.check()
        },
      },
      {
        session: 'PRE_RELEASE_SESSION',
        fill: async p => {
          await p.inSomewhereElseRadioButton.click()
          await p.addressLine1Input.fill('1 High Street')
          await p.townInput.fill('Derby')
          await p.postcodeInput.fill('DE1 2EQ')
          await p.informedByPhoneCheckbox.check()
        },
      },
      {
        session: 'POST_RELEASE_SESSION',
        fill: async p => {
          await p.phoneCallRadioButton.click()
          await p.phoneCallReasonInput.fill('Some reasons')
          await p.meetAtTheGateYesRadioButton.check()
          await p.informedByPhoneCheckbox.check()
        },
      },
      {
        session: 'HANDOVER_SESSION',
        fill: async p => {
          await p.inPersonRadioButton.click()
        },
      },
    ]

    for (const { session, fill } of journeys) {
      test(`${session} navigates to the confirm page`, async ({ page }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, session))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, session)
        await appointmentPage.fillDateAndTime(futureDate(), '10', '30', 'AM')
        await fill(appointmentPage)
        await appointmentPage.saveAndContinueButton.click()
        await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
      })
    }

    test('post-release shows an error when meet at the gate is not answered', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'POST_RELEASE_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'POST_RELEASE_SESSION')
      await appointmentPage.fillDateAndTime(futureDate(), '10', '30', 'AM')
      await appointmentPage.phoneCallRadioButton.click()
      await appointmentPage.phoneCallReasonInput.fill('Some reasons')
      await appointmentPage.informedByPhoneCheckbox.check()
      await appointmentPage.saveAndContinueButton.click()
      await expect(appointmentPage.errorHeader).toBeVisible()
      await expect(
        page
          .locator('[data-testid="error-messages"] a[href*="#meetAtTheGate"]')
          .filter({ hasText: 'Select whether this is a meet at the gate session' }),
      ).toBeVisible()
    })

    test('shows validation errors when nothing is entered', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
      await appointmentPage.saveAndContinueButton.click()
      await expect(appointmentPage.errorHeader).toBeVisible()
      await expect(page.locator('[data-testid="error-messages"] a[href*="#sessionDate"]')).toBeVisible()
    })
  })
})

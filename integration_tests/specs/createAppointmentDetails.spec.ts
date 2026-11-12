import { test, expect } from '@playwright/test'
import { format, addDays, addMonths, parseISO, subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import CreateAppointmentDetailsPage, { SessionType } from '../pages/createAppointmentDetailsPage'
import { referralInformationInCommunity, referralInformationInPrison } from '../mockData/referralInformationData'
import { createAppointmentReferenceData, prisonsData, probationOfficesData } from '../mockData/referenceData'
import AppointmentTypePage from '../pages/AppointmentTypePage'

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
      await expect(appointmentPage.inSomewhereElseRadioButton).toHaveCount(0)
      await expect(appointmentPage.inPersonRadioButton).toHaveCount(0)
      await expect(appointmentPage.prisonRadioButton).toBeVisible()
      await expect(appointmentPage.phoneCallRadioButton).toBeVisible()
      await expect(appointmentPage.videoCallRadioButton).toBeVisible()
      await expect(appointmentPage.meetAtTheGateFieldset).toHaveCount(0)
      await expect(appointmentPage.informedByPhoneCheckbox).toHaveCount(0)
    })

    test('post-release session', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'POST_RELEASE_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'POST_RELEASE_SESSION')
      await expect(page).toHaveTitle('Book post-release session - Community Support')
      await expect(appointmentPage.inProbationOfficeRadioButton).toBeVisible()
      await expect(appointmentPage.inSomewhereElseRadioButton).toBeVisible()
      await expect(page.getByText('Is this a meet at the gate session?', { exact: true })).toBeVisible()
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

    test('pre-release session offers prison for a person in custody', async ({ page }) => {
      await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInPrison)
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
      await expect(appointmentPage.prisonRadioButton).toBeVisible()
      await expect(appointmentPage.inSomewhereElseRadioButton).toHaveCount(0)
      await expect(appointmentPage.informedByPhoneCheckbox).toHaveCount(0)
    })
  })

  test.describe('save and continue', () => {
    const journeys: { session: SessionType; fill: (p: CreateAppointmentDetailsPage) => Promise<void> }[] = [
      {
        session: 'CONTACT_SESSION',
        fill: async p => {
          await p.videoCallRadioButton.click()
          await p.videoCallReasonInput.fill('The person cannot attend in person')
          await p.informedByPhoneCheckbox.check()
        },
      },
      {
        session: 'PRE_RELEASE_SESSION',
        fill: async p => {
          await p.prisonRadioButton.check()
          await p.prisonSelect.selectOption(prisonsData[0].agencyId)
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
          .filter({ hasText: 'Select yes if this is a meet at the gate session' }),
      ).toBeVisible()
    })

    test('shows validation errors when nothing is entered', async ({ page }) => {
      await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
      const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
      await appointmentPage.saveAndContinueButton.click()
      await expect(appointmentPage.errorHeader).toBeVisible()
      await expect(page.locator('[data-testid="error-messages"] a[href*="#sessionDate"]')).toBeVisible()
    })

    test.describe('pre-release session design', () => {
      test('the calendar opens and sets the session date', async ({ page }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
        const selectedDate = addDays(new Date(), 7)
        await appointmentPage.dateInput.fill(format(selectedDate, 'd/M/yyyy'))
        await page.getByRole('button', { name: 'Choose date', exact: true }).click()
        await expect(page.locator('.moj-datepicker__calendar')).toBeVisible()
        selectedDate.setDate(15)
        await page.getByRole('button', { name: format(selectedDate, 'EEEE d MMMM yyyy'), exact: true }).click()
        await expect(appointmentPage.dateInput).toHaveValue(format(selectedDate, 'd/M/yyyy'))
      })

      test('selecting pre-release opens the booking page and Back returns to appointment type', async ({ page }) => {
        await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
        const typePage = await AppointmentTypePage.verifyOnPage(page)
        await typePage.selectAppointmentType('PRE_RELEASE_SESSION')
        await typePage.continueButton.click()

        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
        await expect(page).toHaveTitle('Book pre-release session - Community Support')
        await appointmentPage.backLink.click()
        await expect(page).toHaveURL(AppointmentTypePage.url(CASE_REFERENCE))
      })

      test('the prison selector is revealed, required and retained after another error', async ({ page }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
        await expect(appointmentPage.prisonSelect).toBeHidden()
        await appointmentPage.fillDateAndTime(futureDate(), '10', '30', 'AM')
        await appointmentPage.prisonRadioButton.check()
        await expect(appointmentPage.prisonSelect).toBeVisible()
        await expect(appointmentPage.prisonSelect.locator('option')).toHaveCount(
          prisonsData.filter(prison => prison.active).length + 1,
        )
        await appointmentPage.saveAndContinueButton.click()
        await expect(page.locator('#prisonList-error')).toContainText('Select a prison')
        await expect(page.locator('[data-testid="error-messages"] a[href="#prisonList"]')).toContainText(
          'Select a prison',
        )
        await expect(appointmentPage.prisonRadioButton).toBeChecked()
        await appointmentPage.prisonSelect.selectOption(prisonsData[0].agencyId)
        await appointmentPage.dateInput.clear()
        await appointmentPage.saveAndContinueButton.click()
        await expect(page.locator('#sessionDate-error')).toContainText('Enter a session date')
        await expect(appointmentPage.prisonSelect).toHaveValue(prisonsData[0].agencyId)
        await appointmentPage.dateInput.fill(futureDate())
        await appointmentPage.saveAndContinueButton.click()
        await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
        await expect(page.getByText(prisonsData[0].description, { exact: true })).toBeVisible()
      })

      for (const method of ['phone', 'video'] as const) {
        test(`${method} requires a reason and shows it on check your answers`, async ({ page }) => {
          await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
          const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
          await appointmentPage.fillDateAndTime(futureDate(), '11', '30', 'PM')
          await (
            method === 'phone' ? appointmentPage.phoneCallRadioButton : appointmentPage.videoCallRadioButton
          ).check()
          await appointmentPage.saveAndContinueButton.click()
          const reasonInput =
            method === 'phone' ? appointmentPage.phoneCallReasonInput : appointmentPage.videoCallReasonInput
          const reasonError = page.locator(method === 'phone' ? '#ByPhone-error' : '#ByVideo-error')
          await expect(reasonInput).toBeVisible()
          await expect(reasonError).toContainText('Enter the reason the session is not in person')
          await expect(
            page.locator('[data-testid="error-messages"] a').filter({
              hasText: 'Enter the reason the session is not in person',
            }),
          ).toBeVisible()
          await reasonInput.fill('The person cannot attend in person')
          await appointmentPage.dateInput.clear()
          await appointmentPage.saveAndContinueButton.click()
          await expect(reasonInput).toHaveValue('The person cannot attend in person')
          await appointmentPage.dateInput.fill(futureDate())
          await appointmentPage.saveAndContinueButton.click()
          await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
          await expect(
            page.locator('.govuk-summary-list__row').filter({ hasText: 'Reason session is not in person' }),
          ).toContainText('The person cannot attend in person')
        })
      }

      const referralDate = parseISO(referralInformationInCommunity.referralDate)
      const dateErrors = [
        ['', 'Enter a session date'],
        ['30/2/2026', 'Enter a date in the correct format, like 10/7/2025'],
        [format(subDays(referralDate, 1), 'd/M/yyyy'), 'Session date must be after the referral date'],
        [format(referralDate, 'd/M/yyyy'), 'Session date must be after the referral date'],
        [
          format(addDays(addMonths(new Date(), 6), 1), 'd/M/yyyy'),
          'Session date must not be more than 6 months in the future',
        ],
      ]
      for (const [date, message] of dateErrors) {
        test(`date error: ${date || 'empty'}`, async ({ page }) => {
          await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
          const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
          await appointmentPage.fillDateAndTime(date, '10', '30', 'AM')
          await appointmentPage.prisonRadioButton.check()
          await appointmentPage.prisonSelect.selectOption(prisonsData[0].agencyId)
          await appointmentPage.saveAndContinueButton.click()
          await expect(page.locator('#sessionDate-error')).toContainText(message)
          await expect(page.locator('[data-testid="error-messages"] a[href*="#sessionDate"]')).toContainText(message)
          await expect(appointmentPage.dateInput).toHaveValue(date)
          await expect(appointmentPage.prisonSelect).toHaveValue(prisonsData[0].agencyId)
        })
      }

      const timeErrors = [
        ['', '', '', 'Enter a start time', '#sessionTime'],
        ['', '30', 'AM', 'Start time must include hours', '#sessionTime-hour'],
        ['10', '', 'AM', 'Start time must include minutes', '#sessionTime-minute'],
        ['10', '30', '', 'Select am or pm', '#sessionTime-meridiem'],
        ['13', '30', 'AM', 'Enter a real start time', '#sessionTime-hour'],
        ['10', '60', 'AM', 'Enter a real start time', '#sessionTime-minute'],
      ]
      for (const [hour, minute, meridiem, message, anchor] of timeErrors) {
        test(`start time error: ${hour}:${minute} ${meridiem}`, async ({ page }) => {
          await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
          const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
          await appointmentPage.fillDateAndTime(futureDate(), hour, minute, meridiem)
          await appointmentPage.prisonRadioButton.check()
          await appointmentPage.prisonSelect.selectOption(prisonsData[0].agencyId)
          await appointmentPage.saveAndContinueButton.click()
          await expect(page.locator('[data-testid="error-messages"] a').filter({ hasText: message })).toHaveAttribute(
            'href',
            anchor,
          )
          await expect(page.locator('#sessionTime-error')).toContainText(message)
          await expect(appointmentPage.timeHourInput).toHaveValue(hour)
          await expect(appointmentPage.timeMinuteInput).toHaveValue(minute)
        })
      }

      test('nothing entered shows errors without selecting a method', async ({ page }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'PRE_RELEASE_SESSION'))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'PRE_RELEASE_SESSION')
        await appointmentPage.saveAndContinueButton.click()
        await expect(page.locator('#sessionDate-error')).toContainText('Enter a session date')
        await expect(page.locator('#sessionTime-error')).toContainText('Enter a start time')
        await expect(page.locator('#sessionTakePlace-error')).toContainText('Select how the session will take place')
        await expect(page.locator('[name="sessionTakePlace"]:checked')).toHaveCount(0)
      })
    })

    test.describe('contact session design', () => {
      test('the calendar button opens the date picker and fills the selected date', async ({ page }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
        const selectedDate = addDays(new Date(), 7)
        await appointmentPage.dateInput.fill(format(selectedDate, 'd/M/yyyy'))
        await page.getByRole('button', { name: 'Choose date', exact: true }).click()
        await expect(page.locator('.moj-datepicker__calendar')).toBeVisible()
        selectedDate.setDate(15)
        await page.getByRole('button', { name: format(selectedDate, 'EEEE d MMMM yyyy'), exact: true }).click()
        await expect(appointmentPage.dateInput).toHaveValue(format(selectedDate, 'd/M/yyyy'))
      })

      test('selecting Contact session opens the booking page and Back returns to appointment type', async ({
        page,
      }) => {
        await page.goto(AppointmentTypePage.url(CASE_REFERENCE))
        const typePage = await AppointmentTypePage.verifyOnPage(page)
        await typePage.selectAppointmentType('CONTACT_SESSION')
        await typePage.continueButton.click()
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
        await expect(page).toHaveTitle('Book contact session - Community Support')
        await appointmentPage.backLink.click()
        await expect(page).toHaveURL(AppointmentTypePage.url(CASE_REFERENCE))
      })

      for (const method of ['phone', 'video'] as const) {
        test(`${method} requires a remote reason and shows it on check your answers`, async ({ page }) => {
          await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
          const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
          await appointmentPage.fillDateAndTime(futureDate(), '11', '30', 'PM')
          await (
            method === 'phone' ? appointmentPage.phoneCallRadioButton : appointmentPage.videoCallRadioButton
          ).check()
          await appointmentPage.informedByPhoneCheckbox.check()
          await appointmentPage.saveAndContinueButton.click()
          await expect(appointmentPage.errorHeader).toBeVisible()
          const reasonInput =
            method === 'phone' ? appointmentPage.phoneCallReasonInput : appointmentPage.videoCallReasonInput
          const reasonError = page.locator(method === 'phone' ? '#ByPhone-error' : '#ByVideo-error')
          await expect(reasonInput).toBeVisible()
          await expect(reasonError).toContainText('Enter the reason the session is not in person')
          await reasonInput.fill('The person cannot attend in person')
          await appointmentPage.dateInput.clear()
          await appointmentPage.saveAndContinueButton.click()
          await expect(page.locator('#sessionDate-error')).toContainText('Enter a session date')
          await expect(reasonInput).toHaveValue('The person cannot attend in person')
          await appointmentPage.dateInput.fill(futureDate())
          await appointmentPage.saveAndContinueButton.click()
          await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
          await expect(page.getByText('Reason session is not in person', { exact: true })).toBeVisible()
          await expect(
            page.locator('.govuk-summary-list__row').filter({ hasText: 'Reason session is not in person' }),
          ).toContainText('The person cannot attend in person')
        })
      }

      test('probation office is conditionally revealed, required and retained with other notification answers', async ({
        page,
      }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
        await expect(appointmentPage.probationOfficeSelect).toBeHidden()
        await appointmentPage.fillDateAndTime(futureDate(), '10', '30', 'AM')
        await appointmentPage.inProbationOfficeRadioButton.check()
        await expect(appointmentPage.probationOfficeSelect).toBeVisible()
        await appointmentPage.informedByEmailCheckbox.check()
        await appointmentPage.informedByTextMessageCheckbox.check()
        await appointmentPage.informedByOtherMethodCheckbox.check()
        await expect(appointmentPage.informedByOtherMethodInput).toBeVisible()
        await appointmentPage.saveAndContinueButton.click()
        await expect(page.locator('#probationOfficeList-error')).toContainText('Select a probation office')
        await expect(page.locator('#otherMethodOfContact-error')).toContainText('Enter other contact method')
        await expect(appointmentPage.informedByEmailCheckbox).toBeChecked()
        await expect(appointmentPage.informedByTextMessageCheckbox).toBeChecked()
        await expect(appointmentPage.dateInput).toHaveValue(futureDate())
        await appointmentPage.probationOfficeSelect.selectOption({ label: probationOfficesData[0].name })
        await appointmentPage.informedByOtherMethodInput.fill('Letter')
        await appointmentPage.saveAndContinueButton.click()
        await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
        await expect(page.getByText(probationOfficesData[0].name, { exact: true })).toBeVisible()
        await expect(page.getByText('Email, Text message, Letter', { exact: true })).toBeVisible()
      })

      test('another address reveals inline address fields like the initial contact session', async ({ page }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
        await expect(appointmentPage.addressLine1Input).toBeHidden()
        await appointmentPage.fillDateAndTime(futureDate(), '10', '30', 'AM')
        await appointmentPage.inSomewhereElseRadioButton.check()
        await expect(appointmentPage.addressLine1Input).toBeVisible()
        await appointmentPage.informedByPhoneCheckbox.check()
        await appointmentPage.saveAndContinueButton.click()
        await expect(page.locator('#addressLine1-error')).toContainText('Enter an address line 1')
        await expect(page.locator('#addressTown-error')).toContainText('Enter a town or city')
        await expect(page.locator('#addressPostcode-error')).toContainText('Enter a postcode')
        await expect(appointmentPage.inSomewhereElseRadioButton).toBeChecked()
        await expect(appointmentPage.dateInput).toHaveValue(futureDate())
        await appointmentPage.addressLine1Input.fill('14 High Street')
        await appointmentPage.townInput.fill('Bath')
        await appointmentPage.postcodeInput.fill('BA1 1AA')
        await appointmentPage.saveAndContinueButton.click()
        await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
        await expect(page.getByText('14 High Street', { exact: false })).toBeVisible()
        await page.getByRole('link', { name: /^Change Contact session/ }).click()
        const typePage = await AppointmentTypePage.verifyOnPage(page)
        await expect(typePage.radioOption('contact')).toBeChecked()
        await typePage.continueButton.click()
        const returnedPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
        await expect(returnedPage.inSomewhereElseRadioButton).toBeChecked()
        await expect(returnedPage.addressLine1Input).toHaveValue('14 High Street')
        await expect(returnedPage.townInput).toHaveValue('Bath')
        await expect(returnedPage.postcodeInput).toHaveValue('BA1 1AA')
        await expect(returnedPage.informedByPhoneCheckbox).toBeChecked()
      })

      const dateErrors = [
        ['', 'Enter a session date'],
        ['30/2/2026', 'Enter a date in the correct format, like 10/7/2025'],
        [
          format(subDays(new Date(referralInformationInCommunity.referralDate), 1), 'd/M/yyyy'),
          'Session date must be after the referral date',
        ],
        [
          format(addDays(addMonths(new Date(), 6), 1), 'd/M/yyyy'),
          'Session date must not be more than 6 months in the future',
        ],
      ]
      for (const [date, message] of dateErrors) {
        test(`date error: ${message}`, async ({ page }) => {
          await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
          const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
          await appointmentPage.fillDateAndTime(date, '10', '30', 'AM')
          await appointmentPage.phoneCallRadioButton.check()
          await appointmentPage.informedByPhoneCheckbox.check()
          await appointmentPage.saveAndContinueButton.click()
          await expect(page.locator('#sessionDate-error')).toContainText(message)
          await expect(page.locator('[data-testid="error-messages"] a[href*="#sessionDate"]')).toContainText(message)
          await expect(appointmentPage.dateInput).toHaveValue(date)
        })
      }

      const timeErrors = [
        ['', '', '', 'Enter a start time', '#sessionTime'],
        ['', '30', 'AM', 'Start time must include hours', '#sessionTime-hour'],
        ['10', '', 'AM', 'Start time must include minutes', '#sessionTime-minute'],
        ['10', '30', '', 'Select am or pm', '#sessionTime-meridiem'],
        ['13', '30', 'AM', 'Enter a real start time', '#sessionTime-hour'],
        ['10', '60', 'AM', 'Enter a real start time', '#sessionTime-minute'],
      ]
      for (const [hour, minute, meridiem, message, anchor] of timeErrors) {
        test(`time error: ${hour}:${minute} ${meridiem}`, async ({ page }) => {
          await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
          const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
          await appointmentPage.fillDateAndTime(futureDate(), hour, minute, meridiem)
          await appointmentPage.phoneCallRadioButton.check()
          await appointmentPage.informedByPhoneCheckbox.check()
          await appointmentPage.saveAndContinueButton.click()
          await expect(page.locator('[data-testid="error-messages"] a').filter({ hasText: message })).toHaveAttribute(
            'href',
            anchor,
          )
          await expect(page.locator('#sessionTime-error')).toContainText(message)
          await expect(appointmentPage.timeHourInput).toHaveValue(hour)
          await expect(appointmentPage.timeMinuteInput).toHaveValue(minute)
        })
      }

      test('nothing entered shows a location error without selecting an option', async ({ page }) => {
        await page.goto(CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'CONTACT_SESSION'))
        const appointmentPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'CONTACT_SESSION')
        await appointmentPage.saveAndContinueButton.click()
        await expect(page.locator('#sessionTakePlace-error')).toContainText('Select how the session will take place')
        await expect(page.locator('[name="sessionTakePlace"]:checked')).toHaveCount(0)
        await expect(appointmentPage.timeMeridiemInput).toHaveValue('')
      })
    })
  })
})

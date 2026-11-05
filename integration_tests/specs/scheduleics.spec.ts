import { test, expect, type Page } from '@playwright/test'
import { format, addDays, addMonths } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import CreateAppointmentDetailsPage from '../pages/createAppointmentDetailsPage'
import { referralInformationInCommunity, referralInformationInPrison } from '../mockData/referralInformationData'
import { createAppointmentReferenceData, probationOfficesData } from '../mockData/referenceData'

const CASE_REFERENCE = 'AB1234CD'
const ICS_URL = CreateAppointmentDetailsPage.url(CASE_REFERENCE, 'ICS')
const OLD_SCHEDULE_ICS_URL = `/referral/${CASE_REFERENCE}/appointment/schedule-ics`
const futureDate = () => format(addDays(new Date(), 7), 'd/M/yyyy')

const expectTimeInputsInError = async (page: Page, expected: { hour: boolean; minute: boolean; meridiem: boolean }) => {
  const check = async (selector: string, errorClass: string, inError: boolean) => {
    const locator = page.locator(selector)
    if (inError) {
      await expect(locator).toHaveClass(new RegExp(errorClass))
    } else {
      await expect(locator).not.toHaveClass(new RegExp(errorClass))
    }
  }
  await check('#sessionTime-hour', 'govuk-input--error', expected.hour)
  await check('#sessionTime-minute', 'govuk-input--error', expected.minute)
  await check('#sessionTime-meridiem', 'govuk-select--error', expected.meridiem)
}

const expectError = async (page: Page, fieldName: string, message: string) => {
  await expect(page.locator('h2', { hasText: 'There is a problem' })).toBeVisible()
  await expect(
    page.locator(`[data-testid="error-messages"] a[href*="#${fieldName}"]`).filter({ hasText: message }),
  ).toBeVisible()
  await expect(page.locator('.govuk-error-message').filter({ hasText: message }).first()).toBeVisible()
}

test.describe('Book initial contact session (ICS) page', () => {
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

  test('the old schedule ICS url redirects to the appointment details page', async ({ page }) => {
    await page.goto(OLD_SCHEDULE_ICS_URL)
    await expect(page).toHaveURL(ICS_URL)
    await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
  })

  test('displays the questions for a person in the community', async ({ page }) => {
    await page.goto(ICS_URL)
    const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')

    await test.step('session date and start time', async () => {
      await expect(page.getByLabel('Session date')).toBeVisible()
      await expect(page.getByText('For example 10/7/2025')).toBeVisible()
      await expect(page.locator('legend', { hasText: 'Start time' })).toBeVisible()
      await expect(page.getByLabel('Hours')).toBeVisible()
      await expect(page.getByLabel('Minutes')).toBeVisible()
      await expect(page.getByLabel('am or pm')).toBeVisible()
    })

    await test.step('how will the session take place is grouped by in person and remote', async () => {
      const dividers = page.locator('[data-testid="sessionTakePlace-radios"] .govuk-radios__divider')
      await expect(dividers).toHaveText(['In person', 'Remote'])
      await expect(page.getByRole('radio', { name: 'Probation office' })).toBeVisible()
      await expect(page.getByRole('radio', { name: 'Another address' })).toBeVisible()
      await expect(page.getByRole('radio', { name: 'Phone call' })).toBeVisible()
      await expect(page.getByRole('radio', { name: 'Video call' })).toBeVisible()
    })

    await test.step('selecting probation office reveals the probation office list', async () => {
      await icsPage.inProbationOfficeRadioButton.click()
      await expect(page.getByLabel('Select probation office')).toBeVisible()
    })

    await test.step('selecting phone or video call reveals the reason input', async () => {
      await icsPage.phoneCallRadioButton.click()
      await expect(icsPage.phoneCallReasonInput).toBeVisible()
      await icsPage.videoCallRadioButton.click()
      await expect(icsPage.videoCallReasonInput).toBeVisible()
      await expect(page.getByLabel('Reason the session is not in person').last()).toBeVisible()
    })

    await test.step('how was the person informed about the session', async () => {
      await expect(
        page.locator('legend', {
          hasText: `How was ${referralInformationInCommunity.firstName} informed about the session?`,
        }),
      ).toBeVisible()
      await expect(page.locator('input[name="informedMethods"] + label')).toHaveText([
        'Email',
        'Phone call',
        'Text message',
        'Other',
      ])
      await icsPage.informedByOtherMethodCheckbox.check()
      await expect(page.getByLabel('Other contact method')).toBeVisible()
    })
  })

  test('displays the prison option for a person in custody', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInPrison)
    await page.goto(ICS_URL)
    await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
    await page.locator('input[type="radio"][value="InPrison"]').click()
    await expect(page.locator('#prisonList')).toBeVisible()
  })

  test('back link returns to the appointment type page', async ({ page }) => {
    await communitySupport.stubGetCreateAppointmentReferenceData(CASE_REFERENCE, createAppointmentReferenceData)
    await page.goto(ICS_URL)
    const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
    await icsPage.backLink.click()
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/appointment-type`)
  })

  test('continues to check your answers when all mandatory fields are complete', async ({ page }) => {
    await page.goto(ICS_URL)
    const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
    await icsPage.fillDateAndTime(futureDate(), '10', '11', 'PM')
    await icsPage.inProbationOfficeRadioButton.click()
    await icsPage.probationOfficeSelect.selectOption({ index: 1 })
    await icsPage.informedByOtherMethodCheckbox.check()
    await icsPage.informedByOtherMethodInput.fill('Some other method')
    await icsPage.saveAndContinueButton.click()
    await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
  })

  test.describe('error messages', () => {
    test('shows an error for each unanswered question', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'sessionDate', 'Enter a session date')
      await expectError(page, 'sessionTime', 'Enter a start time')
      await expectTimeInputsInError(page, { hour: true, minute: true, meridiem: true })
      await expect(icsPage.timeHourInput).toHaveValue('')
      await expect(icsPage.timeMinuteInput).toHaveValue('')
      await expect(icsPage.timeMeridiemInput).toHaveValue('')
      await expectError(page, 'sessionTakePlace', 'Select how the session will take place')
      await expectError(page, 'informedMethods', 'Select how they were informed about the session')
    })

    test('session date must be after the referral date', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.dateInput.fill('1/1/2026')
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'sessionDate', 'Session date must be after the referral date')
    })

    test('session date must not be more than 6 months in the future', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.dateInput.fill(format(addDays(addMonths(new Date(), 6), 2), 'd/M/yyyy'))
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'sessionDate', 'Session date must not be more than 6 months in the future')
    })

    const timeCases = [
      {
        hour: '',
        minute: '30',
        meridiem: 'AM',
        field: 'sessionTime-hour',
        message: 'Start time must include hours',
        inError: { hour: true, minute: false, meridiem: false },
      },
      {
        hour: '10',
        minute: '',
        meridiem: 'AM',
        field: 'sessionTime-minute',
        message: 'Start time must include minutes',
        inError: { hour: false, minute: true, meridiem: false },
      },
      {
        hour: '10',
        minute: '30',
        meridiem: '',
        field: 'sessionTime-meridiem',
        message: 'Select am or pm',
        inError: { hour: false, minute: false, meridiem: true },
      },
      {
        hour: '13',
        minute: '30',
        meridiem: 'AM',
        field: 'sessionTime-hour',
        message: 'Enter a real start time',
        inError: { hour: true, minute: false, meridiem: false },
      },
    ]
    for (const { hour, minute, meridiem, field, message, inError } of timeCases) {
      test(`start time error: ${message}`, async ({ page }) => {
        await page.goto(ICS_URL)
        const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
        await icsPage.fillDateAndTime(futureDate(), hour, minute, meridiem)
        await icsPage.saveAndContinueButton.click()
        await expectError(page, field, message)
        await expectTimeInputsInError(page, inError)
        await expect(icsPage.timeHourInput).toHaveValue(hour)
        await expect(icsPage.timeMinuteInput).toHaveValue(minute)
        await expect(icsPage.timeMeridiemInput).toHaveValue(meridiem.toLowerCase())
      })
    }

    test('probation office must be selected', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.inProbationOfficeRadioButton.click()
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'probationOfficeList', 'Select a probation office')
    })

    test('reason the session is not in person must be entered', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.phoneCallRadioButton.click()
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'ByPhone', 'Enter the reason the session is not in person')
      await expect(page.locator('input#ByPhone')).toHaveClass(/govuk-input--error/)
    })

    test('postcode must be a real postcode when entering an address manually', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.inSomewhereElseRadioButton.click()
      await icsPage.addressLine1Input.fill('1 High Street')
      await icsPage.townInput.fill('Derby')
      await icsPage.postcodeInput.fill('ABC')
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'addressPostcode', 'Enter a real postcode')
      await expect(icsPage.postcodeInput).toHaveClass(/govuk-input--error/)
    })

    test('other contact method must be entered', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.informedByOtherMethodCheckbox.check()
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'otherMethodOfContact', 'Enter other contact method')
      await expect(page.locator('input#otherMethodOfContact')).toHaveClass(/govuk-input--error/)
    })

    test('other contact method is not pre-filled with the checkbox value after an error', async ({ page }) => {
      await page.goto(ICS_URL)
      const icsPage = await CreateAppointmentDetailsPage.verifyOnPage(page, 'ICS')
      await icsPage.informedByOtherMethodCheckbox.check()
      await icsPage.saveAndContinueButton.click()
      await expectError(page, 'otherMethodOfContact', 'Enter other contact method')

      await expect(icsPage.informedByOtherMethodCheckbox).toBeChecked()
      await expect(icsPage.informedByOtherMethodInput).toHaveValue('')

      await icsPage.fillDateAndTime(futureDate(), '10', '30', 'AM')
      await icsPage.phoneCallRadioButton.click()
      await icsPage.phoneCallReasonInput.fill('Some reasons')
      await icsPage.informedByOtherMethodInput.fill('Letter')
      await icsPage.saveAndContinueButton.click()

      await expect(page).toHaveURL(`/referral/${CASE_REFERENCE}/create-an-appointment/check-your-answers`)
      await expect(page.getByText('Letter')).toBeVisible()
      await expect(page.getByText('informedByOtherMethod')).toHaveCount(0)
    })
  })
})

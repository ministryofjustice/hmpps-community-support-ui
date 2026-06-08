import { expect, test } from '@playwright/test'
import { addDays, formatDate, subDays } from 'date-fns'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import { daysAfter, login, randomCaseReferenceId, resetStubs, seedAppointmentSession } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ChangeIcsDetailsPage from '../pages/ChangeIcsDetailsPage'
import ChangeIcsDetailsReasonPage from '../pages/ChangeIcsDetailsReasonPage'
import ConfirmIcsPage from '../pages/confirmIcsPage'
import prisonApi from '../mockApis/prisonApi'
import { probationOfficesData } from '../mockData/referenceData'

const NOTHING_SELECTED_ERROR_MESSAGE = 'Select who requested this change'
const REASON_EMPTY_ERROR_MESSAGE = 'Enter the reason for this change'
const REASON_TOO_MANY_CHARS_ERROR_MESSAGE = 'Reason for change must be 500 characters or less'

const phoneAppointmentRequest = {
  date: daysAfter(new Date(), 7),
  time: { hour: 1, minute: 0, amPm: 'pm' },
  sessionMethodRequest: {
    type: 'PHONE',
    additionalDetails: 'The referral dont have a vehicle',
  },
  sessionCommunication: ['informedByPhone'],
}

const date = new Date()
const pastDate = subDays(date, 12)
const futureDate = addDays(date, 7)

const pastMeeting = {
  caseRefId: randomCaseReferenceId(),
  data: initialContactSessionDetailsPageData.virtual(pastDate),
}

test.describe('Reschedule Ics Appointment Reason Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(pastMeeting.caseRefId, pastMeeting.data)
    await communitySupport.stubGetReferralInformation(200, pastMeeting.caseRefId)
    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)

    await page.goto('/')
    await login(page)
  })

  // IPB-2341:AC1
  test('Back Link Navigation', async ({ page }) => {
    await test.step('go to change ics details reason page', async () => {
      await page.goto(ChangeIcsDetailsReasonPage.url(pastMeeting.caseRefId))
    })
    const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
    await changeIcsDetailsReasonPage.backLink.click()
    await expect(page).toHaveURL(ChangeIcsDetailsPage.url(pastMeeting.caseRefId))
  })

  // IPB-2377:AC2
  test('Navigate to Reason for changing details Screen', async ({ page }) => {
    await test.step('go to reschedule appointement page and fill out form', async () => {
      await page.goto(ChangeIcsDetailsPage.url(pastMeeting.caseRefId))
      const changeIcsDetailsPage = new ChangeIcsDetailsPage(page)
      await changeIcsDetailsPage.dateInput.fill(formatDate(futureDate, 'dd/MM/yyyy'))
      await changeIcsDetailsPage.timeHourInput.fill('1')
      await changeIcsDetailsPage.timeMinuteInput.fill('0')
      await changeIcsDetailsPage.timeMeridiemInput.selectOption('PM')
      await changeIcsDetailsPage.phoneCallRadioButton.check()
      await changeIcsDetailsPage.phoneCallReasonInput.fill('reason')
      await changeIcsDetailsPage.informedByPhoneCheckbox.check()
      await changeIcsDetailsPage.saveAndContinueButton.click()
    })
    await expect(page).toHaveURL(ChangeIcsDetailsReasonPage.url(pastMeeting.caseRefId))
    const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
    await expect(changeIcsDetailsReasonPage.header).toContainText('Reason for changing the session details')
  })

  // IPB-2341:AC3/AC5
  test('Error Message if not selecting who requested the change', async ({ page }) => {
    await test.step('go to change ics details reason page', async () => {
      await page.goto(ChangeIcsDetailsReasonPage.url(pastMeeting.caseRefId))
    })
    const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
    await changeIcsDetailsReasonPage.continueButton.click()
    await test.step('check error summary content', async () => {
      await expect(changeIcsDetailsReasonPage.errorSummary.locator).toBeVisible()
      await expect(changeIcsDetailsReasonPage.errorSummary.title).toHaveText('There is a problem')
      await expect(changeIcsDetailsReasonPage.errorSummary.list).toBeVisible()
      await expect(changeIcsDetailsReasonPage.errorSummary.items).toHaveCount(2)
      const [error1, error2] = await changeIcsDetailsReasonPage.errorSummary.items.all()
      await expect(error1).toHaveText(NOTHING_SELECTED_ERROR_MESSAGE)
      await expect(error2).toHaveText(REASON_EMPTY_ERROR_MESSAGE)
    })
    await test.step('check field error content', async () => {
      await expect(changeIcsDetailsReasonPage.whoRequestedRadios.errorText).toBeVisible()
      await expect(changeIcsDetailsReasonPage.whoRequestedRadios.errorText).toContainText(
        NOTHING_SELECTED_ERROR_MESSAGE,
      )
      await expect(changeIcsDetailsReasonPage.reasonTextarea.errorText).toBeVisible()
      await expect(changeIcsDetailsReasonPage.reasonTextarea.errorText).toContainText(REASON_EMPTY_ERROR_MESSAGE)
    })
  })

  // IPB-2341:AC4
  test('Change Ics Details Reason page should display correct content', async ({ page }) => {
    await test.step('go to change ics details reason page', async () => {
      await page.goto(ChangeIcsDetailsReasonPage.url(pastMeeting.caseRefId))
    })
    const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
    await test.step('check radios content', async () => {
      await expect(changeIcsDetailsReasonPage.whoRequestedRadios.fieldset.legend).toHaveText(
        'Who requested this change?',
      )
      await expect(changeIcsDetailsReasonPage.whoRequestedRadios.fieldset.hint).toHaveText('Select one option.')
      expect(changeIcsDetailsReasonPage.whoRequestedRadios.items).toHaveLength(3)
      const [item1, item2, item3] = changeIcsDetailsReasonPage.whoRequestedRadios.items
      await expect(item1.label).toHaveText('Delivery partner')
      await expect(item2.label).toHaveText(`${pastMeeting.data.referralFirstName} ${pastMeeting.data.referralLastName}`)
      await expect(item3.label).toHaveText('Probation practitioner')
    })
    await test.step('check textarea content', async () => {
      await expect(changeIcsDetailsReasonPage.reasonTextarea.label).toHaveText('What is the reason for this change?')
    })
    await test.step('check continue button content', async () => {
      await expect(changeIcsDetailsReasonPage.continueButton).toHaveText('Save and continue')
    })
  })

  // IPB-2341:AC5
  test('Error Message for mandatory free text box', async ({ page }) => {
    await test.step('go to change ics details reason page', async () => {
      await page.goto(ChangeIcsDetailsReasonPage.url(pastMeeting.caseRefId))
    })
    const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
    await changeIcsDetailsReasonPage.whoRequestedRadios.items[0].input.click()
    await changeIcsDetailsReasonPage.continueButton.click()
    await test.step('check error summary content', async () => {
      await expect(changeIcsDetailsReasonPage.errorSummary.locator).toBeVisible()
      await expect(changeIcsDetailsReasonPage.errorSummary.title).toHaveText('There is a problem')
      await expect(changeIcsDetailsReasonPage.errorSummary.list).toBeVisible()
      await expect(changeIcsDetailsReasonPage.errorSummary.items).toHaveCount(1)
      const [errorMessage] = await changeIcsDetailsReasonPage.errorSummary.items.all()
      await expect(errorMessage).toHaveText(REASON_EMPTY_ERROR_MESSAGE)
    })
    await test.step('check field error content', async () => {
      await expect(changeIcsDetailsReasonPage.reasonTextarea.errorText).toBeVisible()
      await expect(changeIcsDetailsReasonPage.reasonTextarea.errorText).toContainText(REASON_EMPTY_ERROR_MESSAGE)
    })
  })

  // IPB-2341:AC6
  test('Character Limit Validation', async ({ page }) => {
    await test.step('go to change ics details reason page', async () => {
      await page.goto(ChangeIcsDetailsReasonPage.url(pastMeeting.caseRefId))
    })
    const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
    await changeIcsDetailsReasonPage.whoRequestedRadios.items[0].input.click()
    await changeIcsDetailsReasonPage.reasonTextarea.input.fill(
      `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus`,
    )
    await changeIcsDetailsReasonPage.continueButton.click()
    await test.step('check error summary content', async () => {
      await expect(changeIcsDetailsReasonPage.errorSummary.locator).toBeVisible()
      await expect(changeIcsDetailsReasonPage.errorSummary.title).toHaveText('There is a problem')
      await expect(changeIcsDetailsReasonPage.errorSummary.list).toBeVisible()
      await expect(changeIcsDetailsReasonPage.errorSummary.items).toHaveCount(1)
      const [errorMessage] = await changeIcsDetailsReasonPage.errorSummary.items.all()
      await expect(errorMessage).toHaveText(REASON_TOO_MANY_CHARS_ERROR_MESSAGE)
    })
    await test.step('check field error content', async () => {
      await expect(changeIcsDetailsReasonPage.reasonTextarea.errorText).toBeVisible()
      await expect(changeIcsDetailsReasonPage.reasonTextarea.errorText).toContainText(
        REASON_TOO_MANY_CHARS_ERROR_MESSAGE,
      )
    })
  })

  // IPB-2341:AC7 IPB-2216:AC1
  test('Navigation to Check Details Page', async ({ page }) => {
    await test.step('go to change ics details reason page', async () => {
      await page.goto(ChangeIcsDetailsReasonPage.url(pastMeeting.caseRefId))
    })
    await seedAppointmentSession(page, phoneAppointmentRequest)
    const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
    await changeIcsDetailsReasonPage.whoRequestedRadios.items[1].input.click()
    await changeIcsDetailsReasonPage.reasonTextarea.input.fill('Had work')
    await changeIcsDetailsReasonPage.continueButton.click()
    await expect(page).toHaveURL(ConfirmIcsPage.rescheduleUrl(pastMeeting.caseRefId))
  })
})

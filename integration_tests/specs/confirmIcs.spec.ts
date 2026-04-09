import { expect, test } from '@playwright/test'
import { login, resetStubs, seedAppointmentSession } from '../testUtils'
import ConfirmIcsPage from '../pages/confirmIcsPage'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import { probationOfficesData } from '../mockData/referenceData'

const REFERRAL_ID = 'b190ac1e-1e2a-41c2-a4ac-3ceb9d2dcb1e'
const CONFIRM_ICS_URL = `/referral/${REFERRAL_ID}/appointment/confirm-ics`

function addDays(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function toIsoDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function toDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const futureDate = addDays(7)
const pastDate = addDays(-30)

const futureDateStr = toIsoDateString(futureDate)
const pastDateStr = toIsoDateString(pastDate)
const futureDateDisplay = toDisplayDate(futureDate)

const phoneAppointmentRequest = {
  date: futureDateStr,
  time: { hour: 1, minute: 0, amPm: 'pm' },
  sessionMethodRequest: {
    type: 'PHONE',
    additionalDetails: 'The referral dont have a vehicle',
  },
  sessionCommunication: ['Phone call'],
}

const inPersonAppointmentRequest = {
  date: futureDateStr,
  time: { hour: 10, minute: 30, amPm: 'am' },
  sessionMethodRequest: {
    type: 'PROBATION_OFFICE',
  },
  sessionCommunication: ['Letter', 'Phone call'],
}

const otherLocationAppointmentRequest = {
  date: futureDateStr,
  time: { hour: 10, minute: 30, amPm: 'am' },
  sessionMethodRequest: {
    type: 'OTHER_LOCATION',
    addressLine1: '123 Main Street',
    addressLine2: 'Flat 4',
    townOrCity: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 1AA',
  },
  sessionCommunication: ['Phone call'],
}

const pastAppointmentRequest = {
  date: pastDateStr,
  time: { hour: 9, minute: 0, amPm: 'am' },
  sessionMethodRequest: {
    type: 'PHONE',
    additionalDetails: 'Remote session.',
  },
  sessionCommunication: ['Phone call'],
}

test.describe('Confirm ICS Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('should display the ICS details summary card details for a phone appointment', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.dateRow).toContainText(futureDateDisplay)
    await expect(confirmIcsPage.startTimeRow).toContainText('1:00pm')
    await expect(confirmIcsPage.methodRow).toContainText('Phone call')
    await expect(confirmIcsPage.notInPersonReasonRow).toBeVisible()
    await expect(confirmIcsPage.notInPersonReasonRow).toContainText('The referral dont have a vehicle')
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Phone call')
  })

  test('should display multiple session communication methods joined', async ({ page }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Letter, Phone call')
  })

  test('should display a Change link in the ICS details card', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.changeLink).toBeVisible()
    await expect(confirmIcsPage.changeLink).toHaveAttribute('href', `/referral/${REFERRAL_ID}/appointment/schedule-ics`)
  })

  test('should display the Submit button', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.submitButton).toBeVisible()
  })

  test('should redirect to schedule-ics when no session data is present', async ({ page }) => {
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    await prisonApi.stubGetPrisons()
    await page.goto(CONFIRM_ICS_URL)
    await expect(page).toHaveURL(`/referral/${REFERRAL_ID}/appointment/schedule-ics`)
  })

  test('should display the notification banner when the appointment date and time is in the past', async ({ page }) => {
    await seedAppointmentSession(page, pastAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.notificationBanner).toBeVisible()
    await expect(confirmIcsPage.notificationBanner).toContainText("You've chosen a date and time in the past")
    await expect(confirmIcsPage.notificationBanner).toContainText('you must add the attendance feedback next')
    await expect(confirmIcsPage.notificationBanner).toContainText('select change and enter the correct information')
  })

  test('should not display the notification banner when the appointment date and time is in the future', async ({
    page,
  }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.notificationBanner).not.toBeVisible()
  })

  test('should display Location row with "Probation office" for PROBATION_OFFICE method', async ({ page }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('Probation office')
  })

  test('should display Location row with address lines for OTHER_LOCATION method', async ({ page }) => {
    await seedAppointmentSession(page, otherLocationAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('123 Main Street')
    await expect(confirmIcsPage.locationRow).toContainText('Flat 4')
    await expect(confirmIcsPage.locationRow).toContainText('Leeds')
    await expect(confirmIcsPage.locationRow).toContainText('West Yorkshire')
    await expect(confirmIcsPage.locationRow).toContainText('LS1 1AA')
  })

  test('should not display Location row for non-in-person methods', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(CONFIRM_ICS_URL)
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.locationRow).not.toBeVisible()
  })
})

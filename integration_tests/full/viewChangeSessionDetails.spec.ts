import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { format, addDays, addMonths } from 'date-fns'
import type { AppointmentIcsResponse } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ViewChangeSessionDetailsPage from '../pages/ViewChangeSessionDetailsPage'

const REFERRAL_ID = randomUUID()
const ICS_ID = randomUUID()

const phoneAppointmentIcsResponse: AppointmentIcsResponse = {
  appointmentIcsId: ICS_ID,
  appointmentId: randomUUID(),
  referralId: REFERRAL_ID,
  appointmentType: 'ICS',
  appointmentDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
  appointmentTime: { hour: 1, minute: 0, amPm: 'pm' },
  appointmentStatus: 'SCHEDULED',
  sessionMethod: {
    appointmentCategory: 'VIRTUAL',
    type: 'PHONE',
    whyNotInPersonReason: 'Client does not have access to a vehicle.',
  },
  sessionCommunications: ['Phone', 'Text'],
  referralFirstName: 'Alice',
  referralLastName: 'Smith',
  createdAt: format(addDays(new Date(), -11), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
}

const inPersonProbationAppointmentIcsResponse: AppointmentIcsResponse = {
  appointmentIcsId: ICS_ID,
  appointmentId: randomUUID(),
  referralId: REFERRAL_ID,
  appointmentType: 'ICS',
  appointmentDate: format(addMonths(new Date(), 2), 'yyyy-MM-dd'),
  appointmentTime: { hour: 10, minute: 30, amPm: 'am' },
  appointmentStatus: 'SCHEDULED',
  sessionMethod: {
    appointmentCategory: 'IN_PERSON',
    type: 'IN_PERSON_PROBATION_OFFICE',
    probationOfficeName: 'Sheffield Probation Office',
  },
  sessionCommunications: ['Phone'],
  referralFirstName: 'Carlos',
  referralLastName: 'Garcia',
  createdAt: format(addDays(new Date(), -11), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
}

const otherLocationAppointmentIcsResponse: AppointmentIcsResponse = {
  appointmentIcsId: ICS_ID,
  appointmentId: randomUUID(),
  referralId: REFERRAL_ID,
  appointmentType: 'ICS',
  appointmentDate: format(addMonths(new Date(), 2), 'yyyy-MM-dd'),
  appointmentTime: { hour: 10, minute: 30, amPm: 'am' },
  appointmentStatus: 'SCHEDULED',
  sessionMethod: {
    appointmentCategory: 'IN_PERSON',
    type: 'IN_PERSON_OTHER_LOCATION',
    addressLine1: '123 Main Street',
    addressLine2: 'Flat 4',
    townOrCity: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 1AA',
  },
  sessionCommunications: ['Phone', 'Text'],
  referralFirstName: 'Bob',
  referralLastName: 'Jones',
  createdAt: format(addDays(new Date(), -11), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
}

test.describe('View Session Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('should display the page heading "View session details"', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.header).toHaveText('View session details')
  })

  test('should display the ICS details card with title "ICS details"', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.icsDetailsSummary).toContainText('ICS details')
  })

  test('should display the correct date for a phone appointment', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.dateRow).toContainText(format(addMonths(new Date(), 1), 'd MMMM yyyy'))
  })

  test('should display the correct start time for a phone appointment', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.startTimeRow).toContainText('1:00pm')
  })

  test('should display "Phone call" as the method for a PHONE appointment', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.methodRow).toContainText('Phone call')
  })

  test('should display the reason the session is not in-person for a virtual appointment', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.notInPersonReasonRow).toBeVisible()
    await expect(viewChangePage.notInPersonReasonRow).toContainText('Client does not have access to a vehicle.')
  })

  test('should not display the reason row for an in-person appointment', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, inPersonProbationAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.notInPersonReasonRow).not.toBeVisible()
  })

  test('should display "Probation office" as location for IN_PERSON_PROBATION_OFFICE', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, inPersonProbationAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.locationRow).toBeVisible()
    await expect(viewChangePage.locationRow).toContainText('Probation office')
  })

  test('should display address lines as location for IN_PERSON_OTHER_LOCATION', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, otherLocationAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.locationRow).toBeVisible()
    await expect(viewChangePage.locationRow).toContainText('123 Main Street')
    await expect(viewChangePage.locationRow).toContainText('Leeds')
    await expect(viewChangePage.locationRow).toContainText('LS1 1AA')
  })

  test('should not display location row for a virtual appointment', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.locationRow).not.toBeVisible()
  })

  test('should display the person name in the communication methods label', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.sessionCommunicationLabel).toContainText(
      `How ${phoneAppointmentIcsResponse.referralFirstName} was informed about the session`,
    )
  })

  test('should display mapped session communication methods', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.sessionCommunicationRow).toContainText('Phone call')
    await expect(viewChangePage.sessionCommunicationRow).toContainText('Text message')
  })

  test('should display a back link', async ({ page }) => {
    await communitySupport.stubGetIcsById(REFERRAL_ID, ICS_ID, phoneAppointmentIcsResponse)
    await page.goto(ViewChangeSessionDetailsPage.url(REFERRAL_ID, ICS_ID))
    const viewChangePage = await ViewChangeSessionDetailsPage.verifyOnPage(page)
    await expect(viewChangePage.backLink).toBeVisible()
  })
})

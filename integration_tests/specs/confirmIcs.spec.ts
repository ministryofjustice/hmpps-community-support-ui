import { expect, test } from '@playwright/test'
import { ReferralProgress } from '@community-support-api'
import { login, resetStubs, seedAppointmentSession, seedChangeAppointmentDetails } from '../testUtils'
import ConfirmIcsPage from '../pages/confirmIcsPage'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import { referralInformationInCommunity, referralInformationInPrison } from '../mockData/referralInformationData'
import { probationOfficesData } from '../mockData/referenceData'
import ScheduleIcsPage from '../pages/scheduleIcsPage'
import ReferralProgressPage from '../pages/referralProgressPage'
import ChangeIcsDetailsReasonPage from '../pages/ChangeIcsDetailsReasonPage'

const REFERRAL_ID = 'b190ac1e-1e2a-41c2-a4ac-3ceb9d2dcb1e' as const
const REFERRAL_PROGRESS_URL = `/progress/${REFERRAL_ID}`

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
  sessionCommunication: ['informedByPhone'],
}

const videoAppointmentRequest = {
  date: futureDateStr,
  time: { hour: 1, minute: 0, amPm: 'pm' },
  sessionMethodRequest: {
    type: 'PHONE',
    additionalDetails: 'The referral dont have a vehicle',
  },
  sessionCommunication: ['informedByVideo'],
}

const inPersonAppointmentRequest = {
  date: futureDateStr,
  time: { hour: 10, minute: 30, amPm: 'am' },
  sessionMethodRequest: {
    type: 'IN_PERSON_PROBATION_OFFICE',
    additionalDetails: 'Location of probation office',
  },
  sessionCommunication: ['informedByPhone', 'Letter'],
}

const inPersonPrisonAppointmentRequest = {
  date: futureDateStr,
  time: { hour: 10, minute: 30, amPm: 'am' },
  sessionMethodRequest: {
    type: 'IN_PERSON_PRISON',
    additionalDetails: 'Location of prison',
  },
  sessionCommunication: ['informedByPhone', 'Letter'],
}

const otherLocationAppointmentRequest = {
  date: futureDateStr,
  time: { hour: 10, minute: 30, amPm: 'am' },
  sessionMethodRequest: {
    type: 'IN_PERSON_OTHER_LOCATION',
    addressLine1: '123 Main Street',
    addressLine2: 'Flat 4',
    townOrCity: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 1AA',
  },
  sessionCommunication: ['informedByPhone'],
}

const pastAppointmentRequest = {
  date: pastDateStr,
  time: { hour: 9, minute: 0, amPm: 'am' },
  sessionMethodRequest: {
    type: 'PHONE',
    additionalDetails: 'Remote session.',
  },
  sessionCommunication: ['informedByPhone'],
}

const informedOtherAppointmentRequest = {
  date: pastDateStr,
  time: { hour: 9, minute: 0, amPm: 'am ' },
  sessionMethodRequest: {
    type: 'PHONE',
    additionalDetails: 'Remote session.',
  },
  sessionCommunication: ['Informed by other method'],
}

const mockAppointmentIcsResponse = {
  appointmentIcsId: '123e4567-e89b-12d3-a456-426614174000',
  appointmentId: '987fcdeb-51a2-43e8-9f9b-123456789abc',
  referralId: REFERRAL_ID,
  appointmentType: 'ICS' as const,
  appointmentDate: '2026-05-15',
  appointmentTime: {
    hour: 14,
    minute: 30,
    amPm: 'PM',
  },
  appointmentStatus: 'SCHEDULED' as const,
  sessionMethod: {
    type: 'IN_PERSON' as const,
    appointmentCategory: 'IN_PERSON' as const,
  } as const,
  sessionCommunications: ['informedByEmail', 'informedByPhone'],
  referralFirstName: 'John',
  referralLastName: 'Smith',
  createdAt: '2026-04-22T10:15:30Z',
}

const changeAppointmentDetails = {
  requestedBy: 'Probation practitioner',
  reasonForChange: 'There were technical issues',
}

test.describe('Confirm ICS Page', () => {
  const referralProgressWithAppointments: ReferralProgress = buildReferralProgress([
    { events: [{ status: 'SCHEDULED' }] },
  ])

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetReferralProgress(referralProgressWithAppointments, REFERRAL_ID)
    await communitySupport.stubGetReferralInformation(200, REFERRAL_ID, referralInformationInCommunity)
  })

  test('should display the ICS details summary card details for a phone appointment', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.dateRow).toContainText(futureDateDisplay)
    await expect(confirmIcsPage.startTimeRow).toContainText('1:00pm')
    await expect(confirmIcsPage.methodRow).toContainText('Phone call')
    await expect(confirmIcsPage.notInPersonReasonRow).toBeVisible()
    await expect(confirmIcsPage.notInPersonReasonRow).toContainText('The referral dont have a vehicle')
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Phone call')
  })

  test('should display the person name in the communication methods label', async ({ page }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.sessionCommunicationLabel).toContainText(
      `How ${referralInformationInCommunity.firstName} was informed about the session`,
    )
  })

  test('should display multiple session communication methods joined', async ({ page }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Phone call, Letter')
  })

  test('should display a Change link in the ICS details card', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.changeLinks).toBeVisible()
    await confirmIcsPage.changeLinks.click()
    await expect(page).toHaveURL(ScheduleIcsPage.url(REFERRAL_ID))
  })

  test('should display the Submit button', async ({ page }) => {
    await seedAppointmentSession(page, videoAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.submitButton).toBeVisible()
  })

  test('should redirect to schedule-ics when no session data is present', async ({ page }) => {
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    await prisonApi.stubGetPrisons()
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    await expect(page).toHaveURL(ScheduleIcsPage.url(REFERRAL_ID))
  })

  test('should display the notification banner when the appointment date and time is in the past', async ({ page }) => {
    await seedAppointmentSession(page, pastAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
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
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.notificationBanner).not.toBeVisible()
  })

  test('should display Location row with the correct location for PROBATION_OFFICE method', async ({ page }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('Location of probation office')
  })

  test('should display Location row with address lines for OTHER_LOCATION method', async ({ page }) => {
    await seedAppointmentSession(page, otherLocationAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
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
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.locationRow).not.toBeVisible()
  })

  test('should submit the ics and navigate to the progress screen', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await communitySupport.stubSubmitICS(REFERRAL_ID, mockAppointmentIcsResponse, 200)
    await page.goto(ConfirmIcsPage.url(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.submitButton).toBeVisible()
    await confirmIcsPage.submitButton.click()
    await test.step('should navigate to the progress screen', async () => {
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
      await ReferralProgressPage.verifySuccessBanner(
        page,
        'ICS scheduled',
        'The ICS has been scheduled for 15 May 2026 at 2:30PM',
      )
    })
    await test.step('should navigate to the progress screen again and the banner gone', async () => {
      await page.goto(ReferralProgressPage.url(REFERRAL_ID))
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
      await ReferralProgressPage.verifyNoBanner(page)
    })
  })

  // IPB-2216:AC2
  test('reschedule ics CYA page back link navigation', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await confirmIcsPage.backLink.click()
    await expect(page).toHaveURL(ChangeIcsDetailsReasonPage.url(REFERRAL_ID))
  })

  // IPB-2216:AC3/AC4/AC5/AC6/AC7/AC10/AC11/AC12
  test('should display the Reason for change summary card details when rescheduling', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

    await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
    await expect(confirmIcsPage.dateRow).toContainText(futureDateDisplay)
    await expect(confirmIcsPage.startTimeRow).toContainText('1:00pm')
    await expect(confirmIcsPage.methodRow).toContainText('Phone call')
    await expect(confirmIcsPage.notInPersonReasonRow).toBeVisible()
    await expect(confirmIcsPage.notInPersonReasonRow).toContainText('The referral dont have a vehicle')
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Phone call')

    await expect(confirmIcsPage.changeDetailsSummary).toBeVisible()
    await expect(confirmIcsPage.requestedByRow).toBeVisible()
    await expect(confirmIcsPage.requestedByRow).toContainText('Probation practitioner')
    await expect(confirmIcsPage.reasonForChangeRow).toBeVisible()
    await expect(confirmIcsPage.reasonForChangeRow).toContainText('There were technical issues')
  })

  // IPB-2216:AC8
  test('Reschedule Ics view location - probation office', async ({ page }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

    await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('Location of probation office')
  })

  // IPB-2216:AC9
  test('Reschedule Ics view location - prison', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, REFERRAL_ID, referralInformationInPrison)
    await seedAppointmentSession(page, inPersonPrisonAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

    await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('Location of prison')
  })

  // IPB-2216:AC9.2
  test('Reschedule Ics view location - other location', async ({ page }) => {
    await seedAppointmentSession(page, otherLocationAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('123 Main Street')
    await expect(confirmIcsPage.locationRow).toContainText('Flat 4')
    await expect(confirmIcsPage.locationRow).toContainText('Leeds')
    await expect(confirmIcsPage.locationRow).toContainText('West Yorkshire')
    await expect(confirmIcsPage.locationRow).toContainText('LS1 1AA')
  })

  // IPB-2216:AC10.1
  test('Reschedule Ics - informed by other should show correct content on CYA page', async ({ page }) => {
    await seedAppointmentSession(page, informedOtherAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

    await expect(confirmIcsPage.sessionCommunicationRow).toBeVisible()
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Informed by other method')
  })

  // IPB-2216:AC13/AC14
  test.describe('change links should work correctly when rescheduling the appointment', () => {
    test('Ics Details summary change link', async ({ page }) => {
      await seedAppointmentSession(page, phoneAppointmentRequest)
      await seedChangeAppointmentDetails(page, changeAppointmentDetails)
      await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
      const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

      const [icsDetailsChangeLink, icsReasonChangeLink] = await confirmIcsPage.changeLinks.all()
      await expect(icsDetailsChangeLink).toBeVisible()
      await expect(icsReasonChangeLink).toBeVisible()
      await icsDetailsChangeLink.click()
      await expect(page).toHaveURL(ScheduleIcsPage.rescheduleUrl(REFERRAL_ID))
    })
    test('Reason for change summary change link', async ({ page }) => {
      await seedAppointmentSession(page, phoneAppointmentRequest)
      await seedChangeAppointmentDetails(page, changeAppointmentDetails)
      await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
      const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

      const [icsDetailsChangeLink, icsReasonChangeLink] = await confirmIcsPage.changeLinks.all()
      await expect(icsDetailsChangeLink).toBeVisible()
      await expect(icsReasonChangeLink).toBeVisible()
      await icsReasonChangeLink.click()
      await expect(page).toHaveURL(ChangeIcsDetailsReasonPage.url(REFERRAL_ID))
    })
  })

  // IPB-2216:AC15
  test('Reschedule Ics - submit updated details', async ({ page }) => {
    const referralProgressWithRescheduledAppointments: ReferralProgress = buildReferralProgress([
      { events: [{ status: 'SCHEDULED' }] },
      { events: [{ status: 'RESCHEDULED' }] },
    ])
    await communitySupport.stubGetReferralProgress(referralProgressWithRescheduledAppointments, REFERRAL_ID)
    await communitySupport.stubRescheduleICS(REFERRAL_ID, mockAppointmentIcsResponse, 200)
    await seedAppointmentSession(page, informedOtherAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(REFERRAL_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await confirmIcsPage.submitButton.click()

    await expect(page).toHaveURL(ReferralProgressPage.url(REFERRAL_ID))
    const progressPage = await ReferralProgressPage.verifyOnPage(page)

    expect(progressPage.table.body).toHaveLength(2)
  })
})

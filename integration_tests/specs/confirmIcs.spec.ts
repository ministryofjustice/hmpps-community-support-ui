import { expect, Page, test } from '@playwright/test'
import { ReferralProgress } from '@community-support-api'
import { format } from 'date-fns'
import {
  login,
  randomCaseReferenceId,
  resetStubs,
  seedAppointmentSession,
  seedChangeAppointmentDetails,
} from '../testUtils'
import ConfirmIcsPage from '../pages/confirmIcsPage'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import { probationOfficesData } from '../mockData/referenceData'
import ScheduleIcsPage from '../pages/scheduleIcsPage'
import ReferralProgressPage from '../pages/referralProgressPage'
import ChangeIcsDetailsReasonPage from '../pages/ChangeIcsDetailsReasonPage'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import ChangeIcsDetailsPage from '../pages/ChangeIcsDetailsPage'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'

const CASE_REF_ID = randomCaseReferenceId()
const REFERRAL_PROGRESS_URL = `/progress/${CASE_REF_ID}`
const RECORD_SESSION_ATTENDANCE_URL = `/ics-feedback/${CASE_REF_ID}/attendance`

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

const pastMeeting = {
  caseRefId: CASE_REF_ID,
  data: initialContactSessionDetailsPageData.virtual(pastDate),
}

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
  referralId: CASE_REF_ID,
  caseReference: CASE_REF_ID,
  appointmentType: 'ICS' as const,
  appointmentDate: '2026-05-15',
  appointmentTime: {
    hour: 2,
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
  changeRequestedBy: 'PROBATION_PRACTITIONER',
  reasonForChange: 'There were technical issues',
}

test.describe('Confirm ICS Page', () => {
  const referralProgressWithAppointments: ReferralProgress = buildReferralProgress([{ event: { status: 'SCHEDULED' } }])

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetReferralProgress(referralProgressWithAppointments, CASE_REF_ID)
    await communitySupport.stubGetReferralInformation(200, CASE_REF_ID)
    await communitySupport.stubGetICS(pastMeeting.caseRefId, pastMeeting.data)
    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)
  })

  test('should display the ICS details summary card details for a phone appointment', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
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
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.sessionCommunicationLabel).toContainText(
      `How ${referralInformationInCommunity.firstName} was informed about the session`,
    )
  })

  test('should display multiple session communication methods joined', async ({ page }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Phone call, Letter')
  })

  test('should display a Change link in the ICS details card', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.changeLinks).toBeVisible()
    await confirmIcsPage.changeLinks.click()
    await expect(page).toHaveURL(ScheduleIcsPage.url(CASE_REF_ID))
  })

  test('should display the Submit button', async ({ page }) => {
    await seedAppointmentSession(page, videoAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.submitButton).toBeVisible()
  })

  test('should redirect to schedule-ics when no session data is present', async ({ page }) => {
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    await prisonApi.stubGetPrisons()
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    await expect(page).toHaveURL(ScheduleIcsPage.url(CASE_REF_ID))
  })

  test('should display the notification banner when the appointment date and time is in the past', async ({ page }) => {
    await seedAppointmentSession(page, pastAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
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
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.notificationBanner).not.toBeVisible()
  })

  test('should display Location row with the correct location for IN_PERSON_PROBATION_OFFICE method', async ({
    page,
  }) => {
    await seedAppointmentSession(page, inPersonAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('Location of probation office')
  })

  test('should display Location row with address lines for IN_PERSON_OTHER_LOCATION method', async ({ page }) => {
    await seedAppointmentSession(page, otherLocationAppointmentRequest)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
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
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.locationRow).not.toBeVisible()
  })

  test('should submit the ics and navigate to the progress screen', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    const futureAppointmentResponse = {
      ...mockAppointmentIcsResponse,
      appointmentDate: format(futureDate, 'yyyy-MM-dd'),
    }
    await communitySupport.stubSubmitICS(CASE_REF_ID, futureAppointmentResponse, 200)
    await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await expect(confirmIcsPage.submitButton).toBeVisible()
    await confirmIcsPage.submitButton.click()
    await test.step('should navigate to the progress screen', async () => {
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
      await ReferralProgressPage.verifySuccessBanner(
        page,
        'ICS scheduled',
        `The ICS has been scheduled for ${toDisplayDate(futureDate)} at 2:30PM`,
      )
    })
    await test.step('should navigate to the progress screen again and the banner gone', async () => {
      await page.goto(ReferralProgressPage.url(CASE_REF_ID))
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
      await ReferralProgressPage.verifyNoBanner(page)
    })
  })

  test('should redirect to record session attendance page when appointment date was set retrospectively', async ({
    page,
  }) => {
    await test.step('Given a retrospective ICS appointment has been scheduled', async () => {
      await seedAppointmentSession(page, pastAppointmentRequest)
      await communitySupport.stubSubmitICS(CASE_REF_ID, mockAppointmentIcsResponse, 200)

      await page.goto(ConfirmIcsPage.url(CASE_REF_ID))
    })

    await test.step('When the user confirms the appointment', async () => {
      const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

      await expect(confirmIcsPage.notificationBanner).toBeVisible()
      await expect(confirmIcsPage.notificationBanner).toContainText("You've chosen a date and time in the past")
      await expect(confirmIcsPage.notificationBanner).toContainText('you must add the attendance feedback next')

      await confirmIcsPage.submitButton.click()
    })

    await test.step('Then the user is redirected to record session attendance', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)

      await expect(page).toHaveURL(RECORD_SESSION_ATTENDANCE_URL)
      await expect(recordSessionAttendancePage.header).toHaveText('Record session attendance')
      await expect(recordSessionAttendancePage.subheading).toContainText(
        'The date and time of the session are a permanent record of where this person was.',
      )
    })
  })

  // IPB-2216:AC2
  test('reschedule ics CYA page back link navigation', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await confirmIcsPage.backLink.click()
    await expect(page).toHaveURL(ChangeIcsDetailsReasonPage.url(CASE_REF_ID))
  })

  // IPB-2216:AC3/AC4/AC5/AC6/AC7/AC10/AC11/AC12
  test('should display the Reason for change summary card details when rescheduling', async ({ page }) => {
    await seedAppointmentSession(page, phoneAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
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
    await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

    await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
    await expect(confirmIcsPage.locationRow).toBeVisible()
    await expect(confirmIcsPage.locationRow).toContainText('Location of probation office')
  })

  // IPB-2216:AC9.2
  test('Reschedule Ics view location - other location', async ({ page }) => {
    await seedAppointmentSession(page, otherLocationAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
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
    await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

    await expect(confirmIcsPage.sessionCommunicationRow).toBeVisible()
    await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Informed by other method')
  })

  // IPB-2216:AC13/AC14
  test.describe('change links should work correctly when rescheduling the appointment', () => {
    test('Ics Details summary change link', async ({ page }) => {
      await seedAppointmentSession(page, phoneAppointmentRequest)
      await seedChangeAppointmentDetails(page, changeAppointmentDetails)
      await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
      const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

      const [icsDetailsChangeLink, icsReasonChangeLink] = await confirmIcsPage.changeLinks.all()
      await expect(icsDetailsChangeLink).toBeVisible()
      await expect(icsReasonChangeLink).toBeVisible()
      await icsDetailsChangeLink.click()
      await expect(page).toHaveURL(ScheduleIcsPage.rescheduleUrl(CASE_REF_ID))
    })
    test('Reason for change summary change link', async ({ page }) => {
      await seedAppointmentSession(page, phoneAppointmentRequest)
      await seedChangeAppointmentDetails(page, changeAppointmentDetails)
      await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
      const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)

      const [icsDetailsChangeLink, icsReasonChangeLink] = await confirmIcsPage.changeLinks.all()
      await expect(icsDetailsChangeLink).toBeVisible()
      await expect(icsReasonChangeLink).toBeVisible()
      await icsReasonChangeLink.click()
      await expect(page).toHaveURL(ChangeIcsDetailsReasonPage.url(CASE_REF_ID))
    })
  })

  // IPB-2216:AC15
  test('Reschedule Ics - submit updated details', async ({ page }) => {
    const referralProgressWithRescheduledAppointments: ReferralProgress = buildReferralProgress([
      { event: { status: 'SCHEDULED' } },
      { event: { status: 'CHANGED' } },
    ])
    const mockFutureAppointmentIcsResponse = {
      ...mockAppointmentIcsResponse,
      appointmentDate: futureDateStr,
      appointmentTime: {
        hour: 2,
        minute: 30,
        amPm: 'PM',
      },
    }
    await communitySupport.stubGetReferralProgress(referralProgressWithRescheduledAppointments, CASE_REF_ID)
    await communitySupport.stubRescheduleICS(CASE_REF_ID, mockFutureAppointmentIcsResponse, 200)
    await seedAppointmentSession(page, informedOtherAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await confirmIcsPage.submitButton.click()

    await expect(page).toHaveURL(ReferralProgressPage.url(CASE_REF_ID))
    const progressPage = await ReferralProgressPage.verifyOnPage(page)

    expect(progressPage.icsTable.body).toHaveLength(1)
    await expect(progressPage.icsTable.body[0].elements[1]).toContainText('Needs feedback')
    await progressPage.historyLink.click()
    expect(progressPage.historyTable.body).toHaveLength(1)
    await expect(progressPage.historyTable.body[0].elements[1]).toContainText('Changed')
  })

  test('Reschedule Ics - submit updated details when ICS appointment is retrospective', async ({ page }) => {
    const referralProgressWithRescheduledAppointments: ReferralProgress = buildReferralProgress([
      { event: { status: 'SCHEDULED' } },
      { event: { status: 'CHANGED' } },
    ])
    await communitySupport.stubGetReferralProgress(referralProgressWithRescheduledAppointments, CASE_REF_ID)
    await communitySupport.stubRescheduleICS(CASE_REF_ID, mockAppointmentIcsResponse, 200)
    await seedAppointmentSession(page, informedOtherAppointmentRequest)
    await seedChangeAppointmentDetails(page, changeAppointmentDetails)
    await page.goto(ConfirmIcsPage.rescheduleUrl(CASE_REF_ID))
    const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
    await confirmIcsPage.submitButton.click()

    await expect(page).toHaveURL(RecordSessionAttendancePage.url(CASE_REF_ID))
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)

    await expect(page).toHaveURL(RECORD_SESSION_ATTENDANCE_URL)
    await expect(recordSessionAttendancePage.header).toHaveText('Record session attendance')
    await expect(recordSessionAttendancePage.subheading).toContainText(
      'The date and time of the session are a permanent record of where this person was.',
    )
  })

  enum RequestedBy {
    DELIVERY_PARTNER,
    REFERRAL_USER,
    PROBATION_PRACTITIONER,
  }

  enum InformedMethod {
    PHONE,
    EMAIL,
    TEXT_MESSAGE,
    OTHER,
  }

  enum SessionMethod {
    PHONE,
    VIDEO,
    IN_PERSON_PROBATION_OFFICE,
    IN_PERSON_OTHER_LOCATION,
  }

  const fillRescheduleForm = async (
    page: Page,
    date: Date,
    hour: string,
    minute: string,
    amPm: string,
    method: SessionMethod,
    informedMethods: InformedMethod[],
    requestedBy: RequestedBy,
    reasonForChange: string,
    options: {
      probationOffice?: string
      prison?: string
      notInPersonReason?: string
      informedOther?: string
      addressLine1?: string
      addressLine2?: string
      town?: string
      county?: string
      postcode?: string
    },
  ) => {
    await test.step('Fill out reschedule form', async () => {
      await page.goto(ChangeIcsDetailsPage.url(CASE_REF_ID))
      const changeIcsDetailsPage = await ChangeIcsDetailsPage.verifyOnPage(page)
      await changeIcsDetailsPage.dateInput.fill(format(date, 'dd/MM/yyyy'))
      await changeIcsDetailsPage.timeHourInput.fill(hour)
      await changeIcsDetailsPage.timeMinuteInput.fill(minute)
      await changeIcsDetailsPage.timeMeridiemInput.selectOption(amPm)
      switch (method) {
        case SessionMethod.PHONE:
          await changeIcsDetailsPage.phoneCallRadioButton.check()
          await changeIcsDetailsPage.phoneCallReasonInput.fill(options.notInPersonReason ?? '')
          break
        case SessionMethod.VIDEO:
          await changeIcsDetailsPage.videoCallRadioButton.check()
          await changeIcsDetailsPage.videoCallReasonInput.fill(options.notInPersonReason ?? '')
          break
        case SessionMethod.IN_PERSON_PROBATION_OFFICE:
          await changeIcsDetailsPage.inProbationOfficeRadioButton.check()
          await changeIcsDetailsPage.probationOfficeSelect.selectOption(options.probationOffice ?? '')
          break
        case SessionMethod.IN_PERSON_OTHER_LOCATION:
          await changeIcsDetailsPage.inSomewhereElseRadioButton.check()
          await changeIcsDetailsPage.addressLine1Input.fill(options.addressLine1 ?? '')
          await changeIcsDetailsPage.addressLine2Input.fill(options.addressLine2 ?? '')
          await changeIcsDetailsPage.townInput.fill(options.town ?? '')
          await changeIcsDetailsPage.countyInput.fill(options.county ?? '')
          await changeIcsDetailsPage.postcodeInput.fill(options.postcode ?? '')
          break
        default:
          break
      }
      if (informedMethods.includes(InformedMethod.PHONE)) {
        await changeIcsDetailsPage.informedByPhoneCheckbox.check()
      }
      if (informedMethods.includes(InformedMethod.EMAIL)) {
        await changeIcsDetailsPage.informedByEmailCheckbox.check()
      }
      if (informedMethods.includes(InformedMethod.TEXT_MESSAGE)) {
        await changeIcsDetailsPage.informedByTextMessageCheckbox.check()
      }
      if (informedMethods.includes(InformedMethod.OTHER)) {
        await changeIcsDetailsPage.informedByOtherMethodCheckbox.check()
        await changeIcsDetailsPage.informedByOtherMethodInput.fill(options.informedOther ?? '')
      }
      await changeIcsDetailsPage.saveAndContinueButton.click()
    })
    await test.step('Fill out reason for change form', async () => {
      const changeIcsDetailsReasonPage = await ChangeIcsDetailsReasonPage.verifyOnPage(page)
      switch (requestedBy) {
        case RequestedBy.DELIVERY_PARTNER:
          await changeIcsDetailsReasonPage.whoRequestedRadios.items[0].input.check()
          break
        case RequestedBy.REFERRAL_USER:
          await changeIcsDetailsReasonPage.whoRequestedRadios.items[1].input.check()
          break
        case RequestedBy.PROBATION_PRACTITIONER:
          await changeIcsDetailsReasonPage.whoRequestedRadios.items[2].input.check()
          break
        default:
          break
      }
      await changeIcsDetailsReasonPage.reasonTextarea.input.fill(reasonForChange)
      await changeIcsDetailsReasonPage.continueButton.click()
    })
  }

  test.describe('Reschedule ICS - Full journey happy path', () => {
    test.beforeEach(async () => {
      const referralProgressWithRescheduledAppointments: ReferralProgress = buildReferralProgress([
        { event: { status: 'SCHEDULED' } },
        { event: { status: 'CHANGED' } },
      ])
      const mockFutureAppointmentIcsResponse = { ...mockAppointmentIcsResponse, appointmentDate: '2099-01-01' }
      await communitySupport.stubGetReferralProgress(referralProgressWithRescheduledAppointments, CASE_REF_ID)
      await communitySupport.stubRescheduleICS(CASE_REF_ID, mockFutureAppointmentIcsResponse, 200)
    })

    test('Phone Call', async ({ page }) => {
      await fillRescheduleForm(
        page,
        futureDate,
        '1',
        '0',
        'PM',
        SessionMethod.PHONE,
        [InformedMethod.PHONE],
        RequestedBy.DELIVERY_PARTNER,
        'There were technical issues',
        {
          notInPersonReason: 'The referral dont have a vehicle',
        },
      )
      await test.step('Check confirmIcs page', async () => {
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
        await expect(confirmIcsPage.requestedByRow).toContainText('Delivery partner')
        await expect(confirmIcsPage.reasonForChangeRow).toBeVisible()
        await expect(confirmIcsPage.reasonForChangeRow).toContainText('There were technical issues')
        await confirmIcsPage.submitButton.click()
        await expect(page).toHaveURL(ReferralProgressPage.url(CASE_REF_ID))
      })
    })

    test('Video Call', async ({ page }) => {
      await fillRescheduleForm(
        page,
        futureDate,
        '1',
        '0',
        'PM',
        SessionMethod.VIDEO,
        [InformedMethod.OTHER],
        RequestedBy.REFERRAL_USER,
        'car broke down',
        {
          notInPersonReason: 'The referral dont have a vehicle',
          informedOther: 'Face to face',
        },
      )
      await test.step('Check confirmIcs page', async () => {
        const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
        await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
        await expect(confirmIcsPage.dateRow).toContainText(futureDateDisplay)
        await expect(confirmIcsPage.startTimeRow).toContainText('1:00pm')
        await expect(confirmIcsPage.methodRow).toContainText('Video call')
        await expect(confirmIcsPage.notInPersonReasonRow).toBeVisible()
        await expect(confirmIcsPage.notInPersonReasonRow).toContainText('The referral dont have a vehicle')
        await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Face to face')
        await expect(confirmIcsPage.changeDetailsSummary).toBeVisible()
        await expect(confirmIcsPage.requestedByRow).toBeVisible()
        await expect(confirmIcsPage.requestedByRow).toContainText(`John Doe`)
        await expect(confirmIcsPage.reasonForChangeRow).toBeVisible()
        await expect(confirmIcsPage.reasonForChangeRow).toContainText('car broke down')
        await confirmIcsPage.submitButton.click()
        await expect(page).toHaveURL(ReferralProgressPage.url(CASE_REF_ID))
      })
    })

    test('In Person - probation office', async ({ page }) => {
      await fillRescheduleForm(
        page,
        futureDate,
        '1',
        '0',
        'PM',
        SessionMethod.IN_PERSON_PROBATION_OFFICE,
        [InformedMethod.TEXT_MESSAGE, InformedMethod.OTHER],
        RequestedBy.PROBATION_PRACTITIONER,
        'reasons',
        {
          probationOffice: 'Derby: Derwent Centre',
          informedOther: 'Face to face',
        },
      )
      await test.step('Check confirmIcs page', async () => {
        const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
        await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
        await expect(confirmIcsPage.dateRow).toContainText(futureDateDisplay)
        await expect(confirmIcsPage.startTimeRow).toContainText('1:00pm')
        await expect(confirmIcsPage.methodRow).toContainText('In person')
        await expect(confirmIcsPage.notInPersonReasonRow).not.toBeVisible()
        await expect(confirmIcsPage.locationRow).toContainText('Derby: Derwent Centre')
        await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Face to face')
        await expect(confirmIcsPage.sessionCommunicationRow).toContainText('Text message')
        await expect(confirmIcsPage.changeDetailsSummary).toBeVisible()
        await expect(confirmIcsPage.requestedByRow).toBeVisible()
        await expect(confirmIcsPage.requestedByRow).toContainText('Probation practitioner')
        await expect(confirmIcsPage.reasonForChangeRow).toBeVisible()
        await expect(confirmIcsPage.reasonForChangeRow).toContainText('reasons')
        await confirmIcsPage.submitButton.click()
        await expect(page).toHaveURL(ReferralProgressPage.url(CASE_REF_ID))
      })
    })

    test('In Person - other location', async ({ page }) => {
      await fillRescheduleForm(
        page,
        futureDate,
        '1',
        '0',
        'PM',
        SessionMethod.IN_PERSON_OTHER_LOCATION,
        [],
        RequestedBy.PROBATION_PRACTITIONER,
        'reasons',
        {
          addressLine1: '1 first street',
          town: 'townton',
          postcode: 'EC1A 1AA',
        },
      )
      await test.step('Check confirmIcs page', async () => {
        const confirmIcsPage = await ConfirmIcsPage.verifyOnPage(page)
        await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
        await expect(confirmIcsPage.dateRow).toContainText(futureDateDisplay)
        await expect(confirmIcsPage.startTimeRow).toContainText('1:00pm')
        await expect(confirmIcsPage.methodRow).toContainText('Other location')
        await expect(confirmIcsPage.notInPersonReasonRow).not.toBeVisible()
        await expect(confirmIcsPage.locationRow).toContainText('1 first street')
        await expect(confirmIcsPage.locationRow).toContainText('townton')
        await expect(confirmIcsPage.locationRow).toContainText('EC1A 1AA')
        await expect(confirmIcsPage.changeDetailsSummary).toBeVisible()
        await expect(confirmIcsPage.requestedByRow).toBeVisible()
        await expect(confirmIcsPage.requestedByRow).toContainText('Probation practitioner')
        await expect(confirmIcsPage.reasonForChangeRow).toBeVisible()
        await expect(confirmIcsPage.reasonForChangeRow).toContainText('reasons')
        await confirmIcsPage.submitButton.click()
        await expect(page).toHaveURL(ReferralProgressPage.url(CASE_REF_ID))
      })
    })
  })
})

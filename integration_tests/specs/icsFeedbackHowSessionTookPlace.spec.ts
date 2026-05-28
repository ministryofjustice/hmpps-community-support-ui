import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { AppointmentIcsResponse } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import IcsFeedbackPage from '../pages/icsFeedbackHowSessionTookPlacePage'
import { probationOfficesData } from '../mockData/referenceData'

const REFERRAL_ID = randomUUID()
const ICS_ID = randomUUID()

const phoneAppointment: AppointmentIcsResponse = {
  appointmentIcsId: ICS_ID,
  appointmentId: randomUUID(),
  referralId: REFERRAL_ID,
  appointmentType: 'ICS',
  appointmentDate: '2026-04-21',
  appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
  appointmentStatus: 'NEEDS_FEEDBACK',
  sessionMethod: { type: 'PHONE', appointmentCategory: 'VIRTUAL' },
  sessionCommunications: [],
  referralFirstName: 'John',
  referralLastName: 'Doe',
  createdAt: '2026-04-21T10:00:00Z',
}

const videoAppointment: AppointmentIcsResponse = {
  appointmentIcsId: ICS_ID,
  appointmentId: randomUUID(),
  referralId: REFERRAL_ID,
  appointmentType: 'ICS',
  appointmentDate: '2026-04-21',
  appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
  appointmentStatus: 'NEEDS_FEEDBACK',
  sessionMethod: { type: 'VIDEO', appointmentCategory: 'VIRTUAL' },
  sessionCommunications: [],
  referralFirstName: 'John',
  referralLastName: 'Doe',
  createdAt: '2026-04-21T10:00:00Z',
}

test.describe('ICS Feedback - Did session take place by phone call?', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    await communitySupport.stubGetICS(ICS_ID, phoneAppointment)
  })

  test('displays the page with phone call yes/no options', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    await IcsFeedbackPage.verifyOnPage(page)
  })

  test('selecting Yes shows no sub-questions', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedYesRadio.click()
    await expect(icsFeedbackPage.videoCallRadio).not.toBeVisible()
    await expect(icsFeedbackPage.probationOfficeRadio).not.toBeVisible()
    await expect(icsFeedbackPage.somewhereElseRadio).not.toBeVisible()
  })

  test('selecting No reveals the how-session sub-question', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await expect(icsFeedbackPage.videoCallRadio).toBeVisible()
    await expect(icsFeedbackPage.probationOfficeRadio).toBeVisible()
    await expect(icsFeedbackPage.somewhereElseRadio).toBeVisible()
  })

  test('selecting Video call reveals the reason input', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.videoCallRadio.click()
    await expect(icsFeedbackPage.videoCallReasonInput).toBeVisible()
  })

  test('selecting In person meeting - probation office reveals the PDU select', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.probationOfficeRadio.click()
    await expect(icsFeedbackPage.probationDeliveryUnitSelect).toBeVisible()
  })

  test('selecting Inperson meeting - somewhere else reveals address fields', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.somewhereElseRadio.click()
    await expect(icsFeedbackPage.addressLine1Input).toBeVisible()
    await expect(icsFeedbackPage.addressLine2Input).toBeVisible()
    await expect(icsFeedbackPage.townOrCityInput).toBeVisible()
    await expect(icsFeedbackPage.countyInput).toBeVisible()
    await expect(icsFeedbackPage.postcodeInput).toBeVisible()
  })

  test('shows validation error when submitting without selecting an option', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(
      page,
      'didSessionTakePlaceAsPlanned',
      'Select yes if the session took place by phone call',
    )
  })

  test('shows validation error when No selected but no sub-option chosen', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'howSessionTookPlace', 'Select how the session took place')
  })

  test('shows validation error when Video call selected without a reason', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.videoCallRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'videoCallReason', 'Enter why the session was not in person')
  })

  test('shows validation error when probation office selected without a PDU', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.probationOfficeRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'probationDeliveryUnit', 'Select a probation office')
  })

  test('shows address validation errors when somewhere else selected with missing required fields', async ({
    page,
  }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.somewhereElseRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'addressLine1', 'Enter an address line 1')
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'townOrCity', 'Enter a town or city')
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'postcode', 'Enter a postcode')
  })

  test('submits successfully when Yes (phone call) selected and redirects', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedYesRadio.click()
    await icsFeedbackPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackPage.sessionDetailsUrl(ICS_ID))
  })

  test('submits successfully when Video call selected with a reason', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.videoCallRadio.click()
    await icsFeedbackPage.videoCallReasonInput.fill('Remote access only')
    await icsFeedbackPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackPage.sessionDetailsUrl(ICS_ID))
  })

  test('submits successfully when somewhere else selected with full address', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.somewhereElseRadio.click()
    await icsFeedbackPage.addressLine1Input.fill('56 Carlisle Road')
    await icsFeedbackPage.townOrCityInput.fill('London')
    await icsFeedbackPage.postcodeInput.fill('N1 6XE')
    await icsFeedbackPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackPage.sessionDetailsUrl(ICS_ID))
  })

  test('does not show location block for PHONE appointment', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(ICS_ID))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)

    await expect(icsFeedbackPage.sessionLocation).not.toBeVisible()
  })
})

test.describe('ICS Feedback - Did session take place by video call?', () => {
  const videoReferralId = randomUUID()
  const videoIcsId = randomUUID()

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    await communitySupport.stubGetICS(videoIcsId, {
      ...videoAppointment,
      appointmentIcsId: videoIcsId,
      referralId: videoReferralId,
    })
  })

  test('selecting No reveals phone call option with reason input', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(videoIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await expect(icsFeedbackPage.phoneCallHowRadio).toBeVisible()
    await icsFeedbackPage.phoneCallHowRadio.click()
    await expect(icsFeedbackPage.phoneCallReasonInput).toBeVisible()
  })

  test('video call option is not shown when session method is VIDEO', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(videoIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await expect(icsFeedbackPage.videoCallRadio).not.toBeVisible()
  })

  test('shows validation error when phone call selected without a reason', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(videoIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.phoneCallHowRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'phoneCallReason', 'Enter why the session was not in person')
  })

  test('shows the correct error message for a VIDEO appointment when no option is selected', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(videoIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(
      page,
      'didSessionTakePlaceAsPlanned',
      'Select yes if the session took place by video call',
    )
  })

  test('submits successfully when phone call selected with a reason', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(videoIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.phoneCallHowRadio.click()
    await icsFeedbackPage.phoneCallReasonInput.fill('Video was not available')
    await icsFeedbackPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackPage.sessionDetailsUrl(videoIcsId))
  })
})

test.describe('ICS Feedback - In person appointment location display', () => {
  const inPersonReferralId = randomUUID()
  const inPersonIcsId = randomUUID()

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)
  })

  test('shows probation office name below heading for IN_PERSON_PROBATION_OFFICE appointment', async ({ page }) => {
    const appointment: AppointmentIcsResponse = {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: {
        type: 'IN_PERSON_PROBATION_OFFICE',
        appointmentCategory: 'IN_PERSON',
        probationOfficeName: 'Manchester Probation Office',
      },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    }
    await communitySupport.stubGetICS(inPersonIcsId, appointment)

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)

    await expect(icsFeedbackPage.header).toHaveText('Did the session take place in person at this location?')
    await expect(icsFeedbackPage.sessionLocation).toBeVisible()
    await expect(icsFeedbackPage.sessionLocation).toContainText('Manchester Probation Office')
  })

  test('shows address lines below heading for IN_PERSON_OTHER_LOCATION appointment', async ({ page }) => {
    const appointment: AppointmentIcsResponse = {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: {
        type: 'IN_PERSON_OTHER_LOCATION',
        appointmentCategory: 'IN_PERSON',
        addressLine1: '46 High St',
        townOrCity: 'St Neots',
        county: 'Cambridgeshire',
        postcode: 'PE19 1JG',
      },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    }
    await communitySupport.stubGetICS(inPersonIcsId, appointment)

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)

    await expect(icsFeedbackPage.header).toHaveText('Did the session take place in person at this location?')
    await expect(icsFeedbackPage.sessionLocation).toBeVisible()
    await expect(icsFeedbackPage.sessionLocation).toContainText('46 High St')
    await expect(icsFeedbackPage.sessionLocation).toContainText('St Neots')
    await expect(icsFeedbackPage.sessionLocation).toContainText('Cambridgeshire')
    await expect(icsFeedbackPage.sessionLocation).toContainText('PE19 1JG')
  })

  test('shows validation error for IN_PERSON_PROBATION_OFFICE appointment when no option is selected', async ({
    page,
  }) => {
    await communitySupport.stubGetICS(inPersonIcsId, {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: { type: 'IN_PERSON_PROBATION_OFFICE', appointmentCategory: 'IN_PERSON' },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    })

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(
      page,
      'didSessionTakePlaceAsPlanned',
      'Select yes if the session took place in person at this location',
    )
  })

  test('shows validation error for IN_PERSON_OTHER_LOCATION appointment when no option is selected', async ({
    page,
  }) => {
    await communitySupport.stubGetICS(inPersonIcsId, {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: { type: 'IN_PERSON_OTHER_LOCATION', appointmentCategory: 'IN_PERSON' },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    })

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(
      page,
      'didSessionTakePlaceAsPlanned',
      'Select yes if the session took place in person at this location',
    )
  })

  test('shows validation error when No selected and phone call chosen without a reason for IN_PERSON_PROBATION_OFFICE appointment', async ({
    page,
  }) => {
    await communitySupport.stubGetICS(inPersonIcsId, {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: { type: 'IN_PERSON_PROBATION_OFFICE', appointmentCategory: 'IN_PERSON' },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    })

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.phoneCallHowRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'phoneCallReason', 'Enter why the session was not in person')
  })

  test('shows validation error when No selected and video call chosen without a reason for IN_PERSON_PROBATION_OFFICE appointment', async ({
    page,
  }) => {
    await communitySupport.stubGetICS(inPersonIcsId, {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: { type: 'IN_PERSON_PROBATION_OFFICE', appointmentCategory: 'IN_PERSON' },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    })

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.videoCallRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'videoCallReason', 'Enter why the session was not in person')
  })

  test('submits successfully when No selected and phone call chosen with a reason for IN_PERSON_PROBATION_OFFICE appointment', async ({
    page,
  }) => {
    await communitySupport.stubGetICS(inPersonIcsId, {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: { type: 'IN_PERSON_PROBATION_OFFICE', appointmentCategory: 'IN_PERSON' },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    })

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.phoneCallHowRadio.click()
    await icsFeedbackPage.phoneCallReasonInput.fill('In-person was not possible')
    await icsFeedbackPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackPage.sessionDetailsUrl(inPersonIcsId))
  })

  test('submits successfully when No selected and video call chosen with a reason for IN_PERSON_PROBATION_OFFICE appointment', async ({
    page,
  }) => {
    await communitySupport.stubGetICS(inPersonIcsId, {
      appointmentIcsId: inPersonIcsId,
      appointmentId: randomUUID(),
      referralId: inPersonReferralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: { type: 'IN_PERSON_PROBATION_OFFICE', appointmentCategory: 'IN_PERSON' },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    })

    await page.goto(IcsFeedbackPage.url(inPersonIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.videoCallRadio.click()
    await icsFeedbackPage.videoCallReasonInput.fill('Office was unavailable')
    await icsFeedbackPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackPage.sessionDetailsUrl(inPersonIcsId))
  })
})

test.describe('ICS Feedback - Did session take place in person at this location (IN_PERSON_OTHER_LOCATION)?', () => {
  const otherLocationReferralId = randomUUID()
  const otherLocationIcsId = randomUUID()

  const otherLocationAppointment: AppointmentIcsResponse = {
    appointmentIcsId: otherLocationIcsId,
    appointmentId: randomUUID(),
    referralId: otherLocationReferralId,
    appointmentType: 'ICS',
    appointmentDate: '2026-04-21',
    appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
    appointmentStatus: 'NEEDS_FEEDBACK',
    sessionMethod: {
      type: 'IN_PERSON_OTHER_LOCATION',
      appointmentCategory: 'IN_PERSON',
      addressLine1: '56 Carlisle Road',
      townOrCity: 'London',
      postcode: 'N1 6XE',
    },
    sessionCommunications: [],
    referralFirstName: 'John',
    referralLastName: 'Doe',
    createdAt: '2026-04-21T10:00:00Z',
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    await communitySupport.stubGetICS(otherLocationIcsId, otherLocationAppointment)
  })

  test('selecting No reveals phone call, video call, probation office and somewhere else options', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(otherLocationIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await expect(icsFeedbackPage.phoneCallHowRadio).toBeVisible()
    await expect(icsFeedbackPage.videoCallRadio).toBeVisible()
    await expect(icsFeedbackPage.probationOfficeRadio).toBeVisible()
    await expect(icsFeedbackPage.somewhereElseRadio).toBeVisible()
  })

  test('selecting No and somewhere else reveals address fields for a different location', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(otherLocationIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.somewhereElseRadio.click()
    await expect(icsFeedbackPage.addressLine1Input).toBeVisible()
    await expect(icsFeedbackPage.addressLine2Input).toBeVisible()
    await expect(icsFeedbackPage.townOrCityInput).toBeVisible()
    await expect(icsFeedbackPage.countyInput).toBeVisible()
    await expect(icsFeedbackPage.postcodeInput).toBeVisible()
  })

  test('shows address validation errors when somewhere else selected with missing required fields', async ({
    page,
  }) => {
    await page.goto(IcsFeedbackPage.url(otherLocationIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.somewhereElseRadio.click()
    await icsFeedbackPage.continueButton.click()
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'addressLine1', 'Enter an address line 1')
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'townOrCity', 'Enter a town or city')
    await IcsFeedbackPage.verifyFieldErrorOnPage(page, 'postcode', 'Enter a postcode')
  })

  test('submits successfully when No and somewhere else selected with a different address', async ({ page }) => {
    await page.goto(IcsFeedbackPage.url(otherLocationIcsId))
    const icsFeedbackPage = await IcsFeedbackPage.verifyOnPage(page)
    await icsFeedbackPage.didSessionTakePlaceAsPlannedNoRadio.click()
    await icsFeedbackPage.somewhereElseRadio.click()
    await icsFeedbackPage.addressLine1Input.fill('12 New Street')
    await icsFeedbackPage.townOrCityInput.fill('Manchester')
    await icsFeedbackPage.postcodeInput.fill('M1 1AA')
    await icsFeedbackPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackPage.sessionDetailsUrl(otherLocationIcsId))
  })
})

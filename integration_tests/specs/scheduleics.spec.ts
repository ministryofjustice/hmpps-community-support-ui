import { test } from '@playwright/test'
import { format, addDays, addMonths } from 'date-fns'
import { login, resetStubs, seedReferralInformation } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import ScheduleIcsPage from '../pages/scheduleIcsPage'
import { referralInformationInCommunity, referralInformationInPrison } from '../mockData/referralInformationData'
import { probationOfficesData } from '../mockData/referenceData'

const REFERRAL_ID = 'b190ac1e-1e2a-41c2-a4ac-3ceb9d2dcb1e'
const SCHEDULE_ICS_URL = `/referral/${REFERRAL_ID}/appointment/schedule-ics`

test.describe('Schedule ICS Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)
  })

  test('AC1.1/AC3/AC12 should display the schedule ICS page - person in Prison', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    await ScheduleIcsPage.verifyInactionOnPage(page, false)
  })

  test('AC1.2/AC3/AC7/AC8/AC10/AC11 should display the schedule ICS page - person in Community', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    await ScheduleIcsPage.verifyInactionOnPage(page, true)
  })

  test.skip('AC2: Back navigation', async () => {
    /*
      pending for integration
      */
  })

  test('AC3.1 should return error if date is invalid', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill('30/2/2026')
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionDate',
      'Enter a date in the correct format, like 10/7/2025',
      false,
    )
  })

  test('AC3.2 should return error if date is before referral date', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), -1), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionDate',
      'The session date must be after the referral date',
      false,
    )
  })

  test('AC3.3 should return error if date is beyond today + 6 months', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addMonths(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'sessionDate', 'The session date must be before', false)
  })

  test('AC3.4 should return error if date left blank when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'sessionDate', 'Enter the date of the session', false)
  })

  test('AC4.1 should return error if invalid time format when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('13')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionTime',
      'Enter a session start time in the correct format',
      false,
    )
  })

  test('AC4.2 should return error if time left blank when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'sessionTime', 'Enter the start time of the session', false)
  })

  test('AC4.3.1 should return error if minute left blank when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionTime',
      'Session start time must include an hour and minute',
      false,
    )
  })

  test('AC4.3.2 should return error if hour left blank when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionTime',
      'Session start time must include an hour and minute',
      false,
    )
  })

  test('AC5.1 should return error if meridiem left blank when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionTime',
      'Select whether the session start time is AM or PM',
      false,
    )
  })

  test('AC6 should return error if session take place is not selected when submission (custody)', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionTakePlace',
      'Select how the session will take place',
      false,
    )
  })

  test('AC6.1.1 should return error if session taken by phone but reason is blank when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'ByPhone', 'Enter why the session is not in-person', false)
  })

  test('AC6.1.2 should return error if session taken by video but reason is blank when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.videoCallRadioButton.click()
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'ByVideo', 'Enter why the session is not in-person', false)
  })

  test('AC7.1 should return error if session take place is not selected when submission (community)', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionTakePlace',
      'Select how the session will take place',
      false,
    )
  })

  test('AC9.1.1 should return error if session taken at somewhere else but address line 1 is blank when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'addressLine1', 'Enter an address line 1', true)
  })

  test('AC9.1.2 should return error if session taken at somewhere else but town or city is blank when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'addressTown', 'Enter a town or city', true)
  })

  test('AC9.1.3 should return error if session taken at somewhere else but postcode is blank when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'addressPostcode', 'Enter a postcode', true)
  })

  test('AC9.2.1 should return error if session taken at somewhere else with address line 1 is more than maximum length when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill(
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
      )
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressLine1',
      'Address line 1 must be 100 characters or less',
      true,
    )
  })

  test('AC9.2.2 should return error if session taken at somewhere else with address line 1 with invalid characters when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1 with invalid character #')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressLine1',
      'Address line 1 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      true,
    )
  })

  test('AC9.2.3 should return error if session taken at somewhere else with address line 2 is more than maximum length when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill(
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
      )
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressLine2',
      'Address line 2 must be 100 characters or less',
      true,
    )
  })

  test('AC9.2.4 should return error if session taken at somewhere else with address line 2 with invalid characters when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2 with invalid character #')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressLine2',
      'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      true,
    )
  })

  test('AC9.2.5 should return error if session taken at somewhere else with town or city is more than maximum length when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill(
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
      )
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressTown',
      'Town or city must be 100 characters or less',
      true,
    )
  })

  test('AC9.2.6 should return error if session taken at somewhere else with town or city with invalid characters when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city with invalid character #')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressTown',
      'Town or city must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      true,
    )
  })

  test('AC9.2.7 should return error if session taken at somewhere else with county is more than maximum length when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill(
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
      )
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'addressCounty', 'County must be 100 characters or less', true)
  })

  test('AC9.2.8 should return error if session taken at somewhere else with county with invalid characters when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County with invalid character #')
      await scheduleIcsPage.postcodeInput.fill('Post code')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressCounty',
      'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      true,
    )
  })

  test('AC9.2.10 should return error if session taken at somewhere else with postcode is more than maximum length when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill(
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
      )
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressPostcode',
      'Postcode must be 100 characters or less',
      true,
    )
  })

  test('AC9.2.11 should return error if session taken at somewhere else with postcode with invalid characters when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inSomewhereElseRadioButton.click()
      await scheduleIcsPage.addressLine1Input.fill('Address 1')
      await scheduleIcsPage.addressLine2Input.fill('Address 2')
      await scheduleIcsPage.townInput.fill('Town or city')
      await scheduleIcsPage.countyInput.fill('County')
      await scheduleIcsPage.postcodeInput.fill('County with invalid character -')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'addressPostcode',
      'Postcode must only include letters a to z, numbers 0 to 9 or spaces',
      true,
    )
  })

  test('AC10.1 should return error if nothing was selected the method to inform the user when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'informedMethod',
      `Select how ${referralInformationInCommunity.firstName} was informed about the session`,
      true,
    )
  })

  test('AC11.1 should return error if selected other method of contact with no details when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'otherMethodOfContact',
      'Enter the other method of contact',
      true,
    )
  })

  test('AC11.2 should return error if other method of contact with details exceed maximum length when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('012345678901234567890123456789012345678901234567890')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'otherMethodOfContact',
      'Other method of contact must be 50 characters or less',
      true,
    )
  })

  test('AC11.3 should return error if other method of contact with invalid characters when submission', async ({
    page,
  }) => {
    await seedReferralInformation(page, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.phoneCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('With invalid character !')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'otherMethodOfContact',
      'Other method of contact must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
      true,
    )
  })

  test('AC12 should return error if session take place is not selected when submission (custody)', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(
      page,
      'sessionTakePlace',
      'Select how the session will take place',
      false,
    )
  })

  test('AC12.1 should return error if session taken by phone but reason is blank when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.phoneCallRadioButton.click()
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'ByPhone', 'Enter why the session is not in-person', false)
  })

  test('AC12.2 should return error if session taken by video but reason is blank when submission', async ({ page }) => {
    await seedReferralInformation(page, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, false)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.videoCallRadioButton.click()
      await scheduleIcsPage.saveAndContinueButton.click()
    })
    await ScheduleIcsPage.verifyFieldErrorOnPage(page, 'ByVideo', 'Enter why the session is not in-person', false)
  })

  test.skip('AC13: Navigation to review screen when ll mandatory fields are complete', async () => {
    /*
      pending for integration
      */
  })
})

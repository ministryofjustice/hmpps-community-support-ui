import { test, expect } from '@playwright/test'
import { ReferralProgress } from '@community-support-api'
import { format, addDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import prisonApi from '../mockApis/prisonApi'
import ScheduleIcsPage from '../pages/scheduleIcsPage'
import { referralInformationInCommunity, referralInformationInPrison } from '../mockData/referralInformationData'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import { probationOfficesData } from '../mockData/referenceData'
import ReferralProgressPage from '../pages/referralProgressPage'
import ConfirmIcsPage from '../pages/confirmIcsPage'

const CASE_REFERENCE = 'AB1234CD'
const SCHEDULE_ICS_URL = ScheduleIcsPage.url(CASE_REFERENCE)
const REFERRAL_PROGRESS_URL = ReferralProgressPage.url(CASE_REFERENCE)
const CHECK_ICS_URL = ConfirmIcsPage.url(CASE_REFERENCE)

test.describe('Schedule ICS Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)

    await Promise.all([
      communitySupport.stubGetICSNotFound(CASE_REFERENCE),
      prisonApi.stubGetPrisons(),
      communitySupport.stubGetProbationOffices(probationOfficesData),
      communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity),
    ])
  })

  test('AC0 should display the correct schedule ICS title', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    await expect(page).toHaveTitle('Schedule the ICS - Community Support Provider')
  })

  test('AC1.1/AC3/AC12 should display the schedule ICS page - person in Prison', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInPrison)
    await page.goto(SCHEDULE_ICS_URL)
    await ScheduleIcsPage.verifyInactionOnPage(page, false)
  })

  test('AC1.2/AC3/AC7/AC8/AC10/AC11 should display the schedule ICS page - person in Community', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    await ScheduleIcsPage.verifyInactionOnPage(page, true)
  })

  test('AC2: Back navigation', async ({ page }) => {
    const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([], CASE_REFERENCE)

    await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity)
    await communitySupport.stubGetReferralProgress(referralProgressNoAppointments, CASE_REFERENCE)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('click back link', async () => {
      await scheduleIcsPage.backLink.click()
    })
    await test.step('should be on referral progress screen', async () => {
      await expect(page).toHaveURL(REFERRAL_PROGRESS_URL)
    })
  })

  test('AC13.1: Navigation to review screen when all mandatory fields are complete - case 1', async ({ page }) => {
    await communitySupport.stubGetReferralInformation(200, CASE_REFERENCE, referralInformationInCommunity)
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.videoCallRadioButton.click()
      await scheduleIcsPage.videoCallReasonInput.fill('Some reasons')
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
      await test.step('should be on check ics screen', async () => {
        await expect(page).toHaveURL(CHECK_ICS_URL)
      })
    })
  })

  test('AC13.2: Navigation to review screen when all mandatory fields are complete - case 2', async ({ page }) => {
    await page.goto(SCHEDULE_ICS_URL)
    const scheduleIcsPage = await ScheduleIcsPage.verifyOnPage(page, true)
    await test.step('submit', async () => {
      await scheduleIcsPage.dateInput.fill(format(addDays(new Date(), 7), 'd/M/yyyy'))
      await scheduleIcsPage.timeHourInput.fill('10')
      await scheduleIcsPage.timeMinuteInput.fill('11')
      await scheduleIcsPage.timeMeridiemInput.selectOption('PM')
      await scheduleIcsPage.inProbationOfficeRadioButton.click()
      await scheduleIcsPage.probationOfficeSelect.waitFor({ state: 'visible' })
      await scheduleIcsPage.probationOfficeSelect.selectOption({ index: 4 })
      await scheduleIcsPage.informedByOtherMethodCheckbox.check()
      await scheduleIcsPage.informedByOtherMethodInput.fill('Some other method')
      await scheduleIcsPage.saveAndContinueButton.click()
      await test.step('should be on check ics screen', async () => {
        await expect(page).toHaveURL(CHECK_ICS_URL)
      })
    })
  })
})

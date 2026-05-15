import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { format, subDays } from 'date-fns'
import { login, resetStubs, seedSessionFeedbackSession } from '../testUtils'
import SessionDetailsPage from '../pages/SessionDetailsPage'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import communitySupport from '../mockApis/communitySupport'
import IcsFeedbackSessionFeedbackPage from '../pages/IcsFeedbackSessionFeedbackPage'
import IcsFeedbackHowSessionTookPlacePage from '../pages/icsFeedbackHowSessionTookPlacePage'

test.describe('Session Details Page', () => {
  const date = new Date()
  const pastDate = subDays(date, 12)

  const EMPTY_RADIO_ERROR_MESSAGE = 'Select yes if Alice was late'
  const EMPTY_LATE_REASON_ERROR_MESSAGE = 'Enter why Alice was late'
  const EMPTY_DURATION_ERROR_MESSAGE = 'Enter how long the session lasted'
  const INVALID_HOURS_ERROR_MESSAGE = 'Hours must only include numbers 0 to 9'
  const INVALID_MINUTES_ERROR_MESSAGE = 'Minutes must only include numbers 0 to 9'
  const MINUTES_OOB_ERROR_MESSAGE = 'Minutes must be between 0 and 60'
  const HOURS_TOO_MANY_CHAR_ERROR_MESSAGE = 'Hours must be 2 characters or less'
  const MINUTES_TOO_MANY_CHAR_ERROR_MESSAGE = 'Minutes must be 2 characters or less'

  const pastMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(pastDate),
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(pastMeeting.caseRefId, pastMeeting.data)

    await page.goto('/')
    await login(page)

    await seedSessionFeedbackSession(page, pastMeeting.caseRefId, {
      record: {
        didSessionHappen: true,
      },
    })
    await test.step('go to initial contact session details page', async () => {
      await page.goto(SessionDetailsPage.url(pastMeeting.caseRefId))
    })
  })

  // IPB-2253:AC1/AC2
  test('Session Details page should display correct content', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await test.step('check summary content', async () => {
      const { summary } = sessionDetailsPage
      expect(summary.rows).toHaveLength(2)
      await expect(summary.rows[0].key).toHaveText('Date')
      await expect(summary.rows[0].value).toHaveText(format(pastDate, 'd MMMM uuuu'))
      await expect(summary.rows[1].key).toHaveText('Start time')
      await expect(summary.rows[1].value).toHaveText(format(pastDate, 'h:mmaaa'))
    })
    await test.step('check was person late radios content', async () => {
      await expect(sessionDetailsPage.wasPersonLateRadios.fieldset.legend).toHaveText('Was Alice late?')
      await expect(sessionDetailsPage.lateReason.label!).not.toBeVisible()
      await expect(sessionDetailsPage.lateReason.input!).not.toBeVisible()
      expect(sessionDetailsPage.wasPersonLateRadios.items).toHaveLength(2)
      const [item1, item2] = sessionDetailsPage.wasPersonLateRadios.items
      await expect(item1.label).toHaveText('Yes')
      await expect(item2.label).toHaveText('No')
    })
    await test.step('check session duration content', async () => {
      await expect(sessionDetailsPage.duration.fieldset.legend).toHaveText('How long did the session last?')
      expect(sessionDetailsPage.duration.items).toHaveLength(2)
      const [item1, item2] = sessionDetailsPage.duration.items
      await expect(item1.label).toHaveText('Hour')
      await expect(item2.label).toHaveText('Minute')
    })
  })

  // IPB-2253:AC3
  test('Clicking Yes to "Was Person Late?" should display correct content', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await test.step('check was person late content after clicking Yes', async () => {
      const [wasLateYes] = sessionDetailsPage.wasPersonLateRadios.items
      await wasLateYes.input.click()
      await expect(sessionDetailsPage.lateReason.label!).toBeVisible()
      await expect(sessionDetailsPage.lateReason.label!).toHaveText('Why was Alice late?')
      await expect(sessionDetailsPage.lateReason.input).toBeVisible()
    })
  })

  // IPB-2253:AC4.1
  test('Successful submission not late', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await sessionDetailsPage.wasPersonLateRadios.items[1].input.click()
    await sessionDetailsPage.duration.items[0].input.fill('1')
    await sessionDetailsPage.duration.items[1].input.fill('15')
    await sessionDetailsPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackSessionFeedbackPage.url(pastMeeting.caseRefId))
  })

  // IPB-2253:AC4.2
  test('Successful submission late', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await sessionDetailsPage.wasPersonLateRadios.items[0].input.click()
    await sessionDetailsPage.lateReason.input.fill('Missed the bus')
    await sessionDetailsPage.duration.items[0].input.fill('1')
    await sessionDetailsPage.duration.items[1].input.fill('15')
    await sessionDetailsPage.continueButton.click()
    await expect(page).toHaveURL(IcsFeedbackSessionFeedbackPage.url(pastMeeting.caseRefId))
  })

  // IPB-2253:AC5/AC6
  test('Error messages should show correct content', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await test.step('click continue without filling out the form', async () => {
      await sessionDetailsPage.continueButton.click()
      await expect(page).toHaveURL(SessionDetailsPage.url(pastMeeting.caseRefId))
    })
    await test.step('check error summary content', async () => {
      await expect(sessionDetailsPage.errorSummary.locator).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.title).toHaveText('There is a problem')
      await expect(sessionDetailsPage.errorSummary.list).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.items).toHaveCount(2)
      const errorMessages = await sessionDetailsPage.errorSummary.items.all()
      await expect(errorMessages[0]).toHaveText(EMPTY_RADIO_ERROR_MESSAGE)
      await expect(errorMessages[1]).toHaveText(EMPTY_DURATION_ERROR_MESSAGE)
    })
    await test.step('check error messages content on components', async () => {
      await expect(sessionDetailsPage.wasPersonLateRadios.errorText).toBeVisible()
      await expect(sessionDetailsPage.wasPersonLateRadios.errorText).toContainText(EMPTY_RADIO_ERROR_MESSAGE)
      const [errorDuration] = await sessionDetailsPage.duration.errorText.all()
      await expect(errorDuration).toBeVisible()
      await expect(errorDuration).toContainText(EMPTY_DURATION_ERROR_MESSAGE)
    })
  })

  test('Empty late reason should show correct error', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await test.step('fill out form without a late reason', async () => {
      await sessionDetailsPage.wasPersonLateRadios.items[0].input.click()
      await sessionDetailsPage.duration.items[0].input.fill('1')
      await sessionDetailsPage.duration.items[1].input.fill('15')
      await sessionDetailsPage.continueButton.click()
      await expect(page).toHaveURL(SessionDetailsPage.url(pastMeeting.caseRefId))
    })
    await test.step('check error summary content', async () => {
      await expect(sessionDetailsPage.errorSummary.locator).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.title).toHaveText('There is a problem')
      await expect(sessionDetailsPage.errorSummary.list).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.items).toHaveCount(1)
      const [errorMessage] = await sessionDetailsPage.errorSummary.items.all()
      await expect(errorMessage).toHaveText(EMPTY_LATE_REASON_ERROR_MESSAGE)
    })
    await test.step('check error messages content on components', async () => {
      await expect(sessionDetailsPage.lateReason.errorText).toBeVisible()
      await expect(sessionDetailsPage.lateReason.errorText).toContainText(EMPTY_LATE_REASON_ERROR_MESSAGE)
    })
  })

  // IPB-2253:AC7
  test('Invalid minutes should show correct error', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await test.step('fill form with invalid minutes', async () => {
      await sessionDetailsPage.wasPersonLateRadios.items[1].input.click()
      await sessionDetailsPage.duration.items[0].input.fill('1')
      await sessionDetailsPage.duration.items[1].input.fill('60')
      await sessionDetailsPage.continueButton.click()
      await expect(page).toHaveURL(SessionDetailsPage.url(pastMeeting.caseRefId))
    })
    await test.step('check correct error message is shown', async () => {
      await expect(sessionDetailsPage.errorSummary.locator).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.title).toHaveText('There is a problem')
      await expect(sessionDetailsPage.errorSummary.list).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.items).toHaveCount(1)
      const [errorMessage] = await sessionDetailsPage.errorSummary.items.all()
      await expect(errorMessage).toHaveText(MINUTES_OOB_ERROR_MESSAGE)
      await expect(sessionDetailsPage.duration.errorText).toBeVisible()
      await expect(sessionDetailsPage.duration.errorText).toContainText(MINUTES_OOB_ERROR_MESSAGE)
    })
  })

  // IPB-2253:AC8
  test('Non numerical duration should show correct errors', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await test.step('fill form with non numerical duration', async () => {
      await sessionDetailsPage.wasPersonLateRadios.items[1].input.click()
      await sessionDetailsPage.duration.items[0].input.fill('cat')
      await sessionDetailsPage.duration.items[1].input.fill('3.14159')
      await sessionDetailsPage.continueButton.click()
      await expect(page).toHaveURL(SessionDetailsPage.url(pastMeeting.caseRefId))
    })
    await test.step('check correct error messages are shown', async () => {
      await expect(sessionDetailsPage.errorSummary.locator).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.title).toHaveText('There is a problem')
      await expect(sessionDetailsPage.errorSummary.list).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.items).toHaveCount(2)
      const errorMessages = await sessionDetailsPage.errorSummary.items.all()
      await expect(errorMessages[0]).toHaveText(INVALID_HOURS_ERROR_MESSAGE)
      await expect(errorMessages[1]).toHaveText(INVALID_MINUTES_ERROR_MESSAGE)
      const [errorHours, errorMinutes] = await sessionDetailsPage.duration.errorText.all()
      await expect(errorHours).toBeVisible()
      await expect(errorHours).toContainText(INVALID_HOURS_ERROR_MESSAGE)
      await expect(errorMinutes).toBeVisible()
      await expect(errorMinutes).toContainText(INVALID_MINUTES_ERROR_MESSAGE)
    })
  })

  // IPB-2253:AC9
  test('Too big duration input should show correct errors', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await test.step('fill form with too big duration', async () => {
      await sessionDetailsPage.wasPersonLateRadios.items[1].input.click()
      await sessionDetailsPage.duration.items[0].input.fill('100')
      await sessionDetailsPage.duration.items[1].input.fill('100')
      await sessionDetailsPage.continueButton.click()
      await expect(page).toHaveURL(SessionDetailsPage.url(pastMeeting.caseRefId))
    })
    await test.step('check correct error messages are shown', async () => {
      await expect(sessionDetailsPage.errorSummary.locator).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.title).toHaveText('There is a problem')
      await expect(sessionDetailsPage.errorSummary.list).toBeVisible()
      await expect(sessionDetailsPage.errorSummary.items).toHaveCount(2)
      const errorMessages = await sessionDetailsPage.errorSummary.items.all()
      await expect(errorMessages[0]).toHaveText(HOURS_TOO_MANY_CHAR_ERROR_MESSAGE)
      await expect(errorMessages[1]).toHaveText(MINUTES_TOO_MANY_CHAR_ERROR_MESSAGE)
      const [errorHours, errorMinutes] = await sessionDetailsPage.duration.errorText.all()
      await expect(errorHours).toBeVisible()
      await expect(errorHours).toContainText(HOURS_TOO_MANY_CHAR_ERROR_MESSAGE)
      await expect(errorMinutes).toBeVisible()
      await expect(errorMinutes).toContainText(MINUTES_TOO_MANY_CHAR_ERROR_MESSAGE)
    })
  })

  // IPB-2253:AC10
  test('Back link navigation', async ({ page }) => {
    const sessionDetailsPage = await SessionDetailsPage.verifyOnPage(page)
    await sessionDetailsPage.backLink.click()
    await expect(page).toHaveURL(IcsFeedbackHowSessionTookPlacePage.url(pastMeeting.caseRefId))
  })
})

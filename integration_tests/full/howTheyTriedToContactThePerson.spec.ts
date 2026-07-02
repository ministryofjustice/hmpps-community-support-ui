import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'
import IcsFeedbackHowTheyTriedToContactThePersionPage from '../pages/icsFeedbackHowTheyTriedToContactThePersionPage'

test.describe('HowTheyTriedToContactThePersion', () => {
  const date = new Date()
  const pastDate = subDays(date, 12)

  const pastMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(pastDate),
  } as const

  const differentMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.inPerson(subDays(pastDate, 1)),
  } as const

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(pastMeeting.caseRefId, pastMeeting.data)
    await communitySupport.stubGetICS(differentMeeting.caseRefId, differentMeeting.data)
    await page.goto('/')
    await login(page)
  })

  // IPB-2210:AC1
  test('Navigation to non-attendance screen', async ({ page }) => {
    await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.selectHappened('No')
    await recordSessionAttendancePage.selectAttended('No')
    await recordSessionAttendancePage.clickContinue()
    await expect(page).toHaveURL(IcsFeedbackHowTheyTriedToContactThePersionPage.url(pastMeeting.caseRefId))
  })

  // IPB-2210:AC9
  test('Reroute if off screen - no session setup', async ({ page }) => {
    await page.goto(IcsFeedbackHowTheyTriedToContactThePersionPage.url(pastMeeting.caseRefId))
    await expect(page).toHaveURL(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
  })

  test('Reroute if off screen - going to different case id', async ({ page }) => {
    await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.selectHappened('No')
    await recordSessionAttendancePage.selectAttended('No')
    await recordSessionAttendancePage.clickContinue()

    await page.goto(IcsFeedbackHowTheyTriedToContactThePersionPage.url(differentMeeting.caseRefId))
    await expect(page).toHaveURL(RecordSessionAttendancePage.url(differentMeeting.caseRefId))
  })

  // IPB-2210:AC10
  test('Back Link Navigation', async ({ page }) => {
    await test.step('go to page via journey', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await recordSessionAttendancePage.selectHappened('No')
      await recordSessionAttendancePage.selectAttended('No')
      await recordSessionAttendancePage.clickContinue()
    })
    await test.step('click backLink', async () => {
      const feedbackPage = await IcsFeedbackHowTheyTriedToContactThePersionPage.create(page)
      await feedbackPage.clickBackLink()
    })
    await test.step('check record session attendance page has correct content', async () => {
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      const sessionDidNotHappenOption = recordSessionAttendancePage.sessionHappenedRadios.getItem('No')
      expect(sessionDidNotHappenOption).toBeDefined()
      await expect(sessionDidNotHappenOption!.input).toBeChecked()
      const sessionNotAttendedOption = recordSessionAttendancePage.sessionAttendedRadios.getItem('No')
      expect(sessionNotAttendedOption).toBeDefined()
      await expect(sessionNotAttendedOption!.input).toBeChecked()
    })
  })
})

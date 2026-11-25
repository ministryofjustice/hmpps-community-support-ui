import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'
import DidAttendPage from '../pages/DidAttendPage'
import IcsFeedbackHowTheyTriedToContactThePersionPage from '../pages/icsFeedbackHowTheyTriedToContactThePersionPage'

test.describe('HowTheyTriedToContactThePerson', () => {
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
    await communitySupport.stubGetIcsFeedbackAttendance(pastMeeting.caseRefId, pastMeeting.data)
    await communitySupport.stubGetIcsFeedbackAttendance(differentMeeting.caseRefId, differentMeeting.data)
    await communitySupport.stubGetIcsFeedbackPage(pastMeeting.caseRefId, 'how-they-tried-to-contact-the-person', {
      referralFirstName: pastMeeting.data.referralFirstName,
    })
    await page.goto('/')
    await login(page)
  })

  // IPB-2210:AC1
  test('Navigation to non-attendance screen', async ({ page }) => {
    await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.selectHappened('No')
    await recordSessionAttendancePage.clickContinue()
    await (await DidAttendPage.verifyOnPage(page)).selectDidAttendAndContinue('No')
    await expect(page).toHaveURL(IcsFeedbackHowTheyTriedToContactThePersionPage.url(pastMeeting.caseRefId))
    await expect(page.getByRole('heading', { name: 'Non-attendance details', level: 1 })).toBeVisible()
    await expect(page.getByLabel(`How did you try to contact ${pastMeeting.data.referralFirstName}?`)).toBeVisible()
    await expect(page.getByLabel('Reason they did not attend')).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveCount(2)
  })

  test('shows validation errors when both answers are missing', async ({ page }) => {
    await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.selectHappened('No')
    await recordSessionAttendancePage.clickContinue()
    await (await DidAttendPage.verifyOnPage(page)).selectDidAttendAndContinue('No')

    await page.getByRole('button', { name: 'Continue' }).click()

    const errorSummary = page.locator('[data-testid="error-messages"]')
    await expect(errorSummary.locator('a[href="#howTheyTriedToContactThePerson"]')).toHaveText(
      'Enter how you tried to contact them',
    )
    await expect(errorSummary.locator('a[href="#reasonsTheyDidNotAttend"]')).toHaveText(
      'Enter a reason they did not attend',
    )
  })

  test('restores saved answers from CYA and preserves edited answers after validation fails', async ({ page }) => {
    await communitySupport.stubGetIcsFeedbackPage(pastMeeting.caseRefId, 'check-answers', {
      referralFirstName: pastMeeting.data.referralFirstName,
      appointmentIcsId: pastMeeting.data.appointmentIcsId,
    })
    await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.selectHappened('No')
    await recordSessionAttendancePage.clickContinue()
    await (await DidAttendPage.verifyOnPage(page)).selectDidAttendAndContinue('No')

    const contactAttempts = page.getByLabel(`How did you try to contact ${pastMeeting.data.referralFirstName}?`)
    const reason = page.getByLabel('Reason they did not attend')
    await contactAttempts.fill('Called twice and left a voicemail')
    await reason.fill('They were unwell')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(`/ics-feedback/${pastMeeting.caseRefId}/check-answers`)

    await page
      .getByRole('link', { name: 'Change details about why they did not attend (ICS attendance)', exact: true })
      .click()
    await expect(contactAttempts).toHaveValue('Called twice and left a voicemail')
    await expect(reason).toHaveValue('They were unwell')

    await contactAttempts.fill('Sent a text message')
    await reason.fill('')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('[data-testid="error-messages"] a[href="#reasonsTheyDidNotAttend"]')).toHaveText(
      'Enter a reason they did not attend',
    )
    await expect(contactAttempts).toHaveValue('Sent a text message')
    await expect(reason).toHaveValue('')
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
    await recordSessionAttendancePage.clickContinue()
    await (await DidAttendPage.verifyOnPage(page)).selectDidAttendAndContinue('No')

    await page.goto(IcsFeedbackHowTheyTriedToContactThePersionPage.url(differentMeeting.caseRefId))
    await expect(page).toHaveURL(RecordSessionAttendancePage.url(differentMeeting.caseRefId))
  })

  // IPB-2210:AC10
  test('Back Link Navigation', async ({ page }) => {
    await test.step('go to page via journey', async () => {
      await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
      const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
      await recordSessionAttendancePage.selectHappened('No')
      await recordSessionAttendancePage.clickContinue()
      await (await DidAttendPage.verifyOnPage(page)).selectDidAttendAndContinue('No')
      await (await DidAttendPage.verifyOnPage(page)).selectDidAttendAndContinue('No')
    })
    await test.step('click backLink', async () => {
      const feedbackPage = await IcsFeedbackHowTheyTriedToContactThePersionPage.create(page)
      await feedbackPage.clickBackLink()
    })
    await test.step('check record session attendance page has correct content', async () => {
      const didAttendPage = await DidAttendPage.verifyOnPage(page)
      const didNotAttendOption = didAttendPage.didAttendRadios.getItem('No')
      expect(didNotAttendOption).toBeDefined()
      await expect(didNotAttendOption!.input).toBeChecked()
    })
  })
})

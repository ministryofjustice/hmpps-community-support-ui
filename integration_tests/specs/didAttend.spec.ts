import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'
import DidAttendPage from '../pages/DidAttendPage'
import IcsFeedbackWhyDidTheSessionNotHappenPage from '../pages/IcsFeedbackWhyDidTheSessionNotHappenPage'
import IcsFeedbackHowTheyTriedToContactThePersonPage from '../pages/IcsFeedbackHowTheyTriedToContactThePersonPage'
import { probationOfficesData } from '../mockData/referenceData'

test.describe('DidAttendPage', () => {
  const pastMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(subDays(new Date(), 12)),
  } as const

  const goToDidAttend = async (page: Parameters<typeof RecordSessionAttendancePage.verifyOnPage>[0]) => {
    await page.goto(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
    const recordSessionAttendancePage = await RecordSessionAttendancePage.verifyOnPage(page)
    await recordSessionAttendancePage.selectHappened('No')
    await recordSessionAttendancePage.clickContinue()
    await expect(page).toHaveURL(DidAttendPage.url(pastMeeting.caseRefId))
    return DidAttendPage.verifyOnPage(page)
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetIcsFeedbackAttendance(pastMeeting.caseRefId, pastMeeting.data)
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    await communitySupport.stubGetIcsFeedbackPage(pastMeeting.caseRefId, 'why-did-the-session-not-happen', {
      referralFirstName: pastMeeting.data.referralFirstName,
    })
    await communitySupport.stubGetIcsFeedbackPage(pastMeeting.caseRefId, 'how-they-tried-to-contact-the-person', {
      referralFirstName: pastMeeting.data.referralFirstName,
    })
    await page.goto('/')
    await login(page)
  })

  test('Displaying the heading and radios', async ({ page }) => {
    const didAttendPage = await goToDidAttend(page)

    await expect(didAttendPage.didAttendRadios.fieldset.legend).toContainText(
      `Did ${pastMeeting.data.referralFirstName} come to the ICS?`,
    )
    expect(didAttendPage.didAttendRadios.items).toHaveLength(2)
    const [yes, no] = didAttendPage.didAttendRadios.items
    await expect(yes.label).toHaveText('Yes')
    await expect(no.label).toHaveText('No')
    await expect(didAttendPage.continueButton).toHaveText('Continue')
  })

  test('Error when no option is selected', async ({ page }) => {
    const didAttendPage = await goToDidAttend(page)
    await didAttendPage.clickContinue()

    const pageWithErrors = await DidAttendPage.verifyOnPage(page)
    await expect(pageWithErrors.errorSummary.locator).toBeVisible()
    await expect(pageWithErrors.errorSummary.title).toHaveText('There is a problem')
    await expect(pageWithErrors.errorSummary.items).toHaveCount(1)
    await expect(pageWithErrors.errorSummary.items.first()).toHaveText('Select yes if they came to the appointment')
    await expect(pageWithErrors.didAttendRadios.errorText).toHaveText(
      'Error: Select yes if they came to the appointment',
    )
  })

  test('Person attended but session did not happen', async ({ page }) => {
    const didAttendPage = await goToDidAttend(page)
    await didAttendPage.selectDidAttend('Yes')
    await didAttendPage.clickContinue()

    await expect(page).toHaveURL(IcsFeedbackWhyDidTheSessionNotHappenPage.url(pastMeeting.caseRefId))
    await IcsFeedbackWhyDidTheSessionNotHappenPage.verifyOnPage(page)
  })

  test('Person did not attend', async ({ page }) => {
    const didAttendPage = await goToDidAttend(page)
    await didAttendPage.selectDidAttend('No')
    await didAttendPage.clickContinue()

    await expect(page).toHaveURL(IcsFeedbackHowTheyTriedToContactThePersonPage.url(pastMeeting.caseRefId))
  })

  test('Back link returns to the attendance page', async ({ page }) => {
    const didAttendPage = await goToDidAttend(page)
    await didAttendPage.backLink.click()

    await expect(page).toHaveURL(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
  })

  test('Selection is preserved when returning from the next page', async ({ page }) => {
    const didAttendPage = await goToDidAttend(page)
    await didAttendPage.selectDidAttendAndContinue('Yes')
    await page.goBack()

    const returned = await DidAttendPage.verifyOnPage(page)
    await expect(returned.didAttendRadios.getItem('Yes')!.input).toBeChecked()
  })
})

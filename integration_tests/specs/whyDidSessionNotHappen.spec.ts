import { expect, test } from '@playwright/test'
import { subDays } from 'date-fns'
import { randomUUID } from 'node:crypto'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import { login, resetStubs, seedSessionFeedbackSession } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import IcsFeedbackWhyDidTheSessionNotHappenPage from '../pages/IcsFeedbackWhyDidTheSessionNotHappenPage'
import RecordSessionAttendancePage from '../pages/RecordSessionAttendancePage'

const NOTHING_SELECTED_ERROR_MESSAGE = 'Select why the session did not happen'
const SERVICE_PROVIDER_ISSUE_DETAILS_EMPTY_ERROR_MESSAGE =
  'Give details of any issues that meant the session could not happen'
const REFERRAL_COULD_NOT_TAKE_PART_DETAILS_EMPTY_ERROR_MESSAGE = 'Give details about why they were unable to take part'
const REFERRAL_DID_NOT_COMPLY_DETAILS_EMPTY_ERROR_MESSAGE =
  'Give details about their behaviour and how they were unable to take part'

test.describe('Why Did The Session Not Happen Page', () => {
  const date = new Date()
  const pastDate = subDays(date, 12)

  const pastMeeting = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(pastDate),
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(pastMeeting.caseRefId, pastMeeting.data)

    await page.goto('/')
    await login(page)

    await seedSessionFeedbackSession(page, {
      record: {
        didSessionHappen: false,
        didPersonAttend: true,
      },
      caseReferenceId: pastMeeting.caseRefId,
    })
    await test.step('go to why did the session not happen page', async () => {
      await page.goto(IcsFeedbackWhyDidTheSessionNotHappenPage.url(pastMeeting.caseRefId))
    })
  })

  // IPB-2209:AC1
  test('Why Did Session Not Happen page should display correct content', async ({ page }) => {
    const whyDidSessionNotHappenPage = await IcsFeedbackWhyDidTheSessionNotHappenPage.verifyOnPage(page)
    await test.step('check radios content', async () => {
      expect(whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items).toHaveLength(3)
      const [item1, item2, item3] = whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items
      await expect(item1.label).toHaveText(
        'There was an issue with the service provider or logistics, for example a problem with a room booking or a fire alarm',
      )
      await expect(item2.label).toHaveText('Alice could not take part, for example because of illness or a crisis')
      await expect(item3.label).toHaveText('Alice did not comply, for example they were disruptive or disengaged')
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.input).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.input).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.input).not.toBeVisible()
    })
    await expect(whyDidSessionNotHappenPage.continueButton).toBeVisible()
  })

  // IPB-2209:AC2/AC3/AC4
  test('Clicking options shows the correct text area input', async ({ page }) => {
    const whyDidSessionNotHappenPage = await IcsFeedbackWhyDidTheSessionNotHappenPage.verifyOnPage(page)
    await test.step('check content after clicking option 1', async () => {
      await whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items[0].input.click()
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.hint).toBeVisible()
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.hint).toHaveText(
        'Give details of any issues that meant the session could not happen.',
      )
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.input).toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.input).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.input).not.toBeVisible()
    })
    await test.step('check content after clicking option 2', async () => {
      await whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items[1].input.click()
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.input).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.hint).toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.hint).toHaveText(
        'Give details about why they were unable to take part, such as what happened and who was involved.',
      )
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.input).toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.input).not.toBeVisible()
    })
    await test.step('check content after clicking option 3', async () => {
      await whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items[2].input.click()
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.input).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.hint).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.input).not.toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.hint).toBeVisible()
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.hint).toHaveText(
        'Give details about their behaviour and how they were unable to take part.',
      )
      await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.input).toBeVisible()
    })
    await expect(whyDidSessionNotHappenPage.continueButton).toBeVisible()
  })

  // IPB-2209:AC5.1
  test('Clicking Continue without selecting an option should show correct error', async ({ page }) => {
    const whyDidSessionNotHappenPage = await IcsFeedbackWhyDidTheSessionNotHappenPage.verifyOnPage(page)
    await whyDidSessionNotHappenPage.continueButton.click()
    await test.step('check error summary content', async () => {
      await expect(whyDidSessionNotHappenPage.errorSummary.locator).toBeVisible()
      await expect(whyDidSessionNotHappenPage.errorSummary.title).toHaveText('There is a problem')
      await expect(whyDidSessionNotHappenPage.errorSummary.list).toBeVisible()
      await expect(whyDidSessionNotHappenPage.errorSummary.items).toHaveCount(1)
      const [errorMessage] = await whyDidSessionNotHappenPage.errorSummary.items.all()
      await expect(errorMessage).toHaveText(NOTHING_SELECTED_ERROR_MESSAGE)
    })
    await test.step('check field error content', async () => {
      await expect(whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.errorText).toBeVisible()
      await expect(whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.errorText).toContainText(
        NOTHING_SELECTED_ERROR_MESSAGE,
      )
    })
  })

  // IPB-2209:AC5.2
  test('Clicking Continue without entering details should show correct error', async ({ page }) => {
    const whyDidSessionNotHappenPage = await IcsFeedbackWhyDidTheSessionNotHappenPage.verifyOnPage(page)
    await test.step('check first option', async () => {
      await whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items[0].input.click()
      await whyDidSessionNotHappenPage.continueButton.click()
      await test.step('check error summary content', async () => {
        await expect(whyDidSessionNotHappenPage.errorSummary.locator).toBeVisible()
        await expect(whyDidSessionNotHappenPage.errorSummary.title).toHaveText('There is a problem')
        await expect(whyDidSessionNotHappenPage.errorSummary.list).toBeVisible()
        await expect(whyDidSessionNotHappenPage.errorSummary.items).toHaveCount(1)
        const [errorMessage] = await whyDidSessionNotHappenPage.errorSummary.items.all()
        await expect(errorMessage).toHaveText(SERVICE_PROVIDER_ISSUE_DETAILS_EMPTY_ERROR_MESSAGE)
      })
      await test.step('check field error content', async () => {
        await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.errorText).toBeVisible()
        await expect(whyDidSessionNotHappenPage.serviceProviderIssueTextArea.errorText).toContainText(
          SERVICE_PROVIDER_ISSUE_DETAILS_EMPTY_ERROR_MESSAGE,
        )
      })
    })
    await test.step('check second option', async () => {
      await whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items[1].input.click()
      await whyDidSessionNotHappenPage.continueButton.click()
      await test.step('check error summary content', async () => {
        await expect(whyDidSessionNotHappenPage.errorSummary.locator).toBeVisible()
        await expect(whyDidSessionNotHappenPage.errorSummary.title).toHaveText('There is a problem')
        await expect(whyDidSessionNotHappenPage.errorSummary.list).toBeVisible()
        await expect(whyDidSessionNotHappenPage.errorSummary.items).toHaveCount(1)
        const [errorMessage] = await whyDidSessionNotHappenPage.errorSummary.items.all()
        await expect(errorMessage).toHaveText(REFERRAL_COULD_NOT_TAKE_PART_DETAILS_EMPTY_ERROR_MESSAGE)
      })
      await test.step('check field error content', async () => {
        await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.errorText).toBeVisible()
        await expect(whyDidSessionNotHappenPage.referralCouldNotTakePartTextArea.errorText).toContainText(
          REFERRAL_COULD_NOT_TAKE_PART_DETAILS_EMPTY_ERROR_MESSAGE,
        )
      })
    })
    await test.step('check third option', async () => {
      await whyDidSessionNotHappenPage.whyDidSessionNotHappenRadios.items[2].input.click()
      await whyDidSessionNotHappenPage.continueButton.click()
      await test.step('check error summary content', async () => {
        await expect(whyDidSessionNotHappenPage.errorSummary.locator).toBeVisible()
        await expect(whyDidSessionNotHappenPage.errorSummary.title).toHaveText('There is a problem')
        await expect(whyDidSessionNotHappenPage.errorSummary.list).toBeVisible()
        await expect(whyDidSessionNotHappenPage.errorSummary.items).toHaveCount(1)
        const [errorMessage] = await whyDidSessionNotHappenPage.errorSummary.items.all()
        await expect(errorMessage).toHaveText(REFERRAL_DID_NOT_COMPLY_DETAILS_EMPTY_ERROR_MESSAGE)
      })
      await test.step('check field error content', async () => {
        await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.errorText).toBeVisible()
        await expect(whyDidSessionNotHappenPage.referralDidNotComplyTextArea.errorText).toContainText(
          REFERRAL_DID_NOT_COMPLY_DETAILS_EMPTY_ERROR_MESSAGE,
        )
      })
    })
  })

  // IPB-2209:AC6
  test('Back link navigation', async ({ page }) => {
    const whyDidSessionNotHappenPage = await IcsFeedbackWhyDidTheSessionNotHappenPage.verifyOnPage(page)
    await whyDidSessionNotHappenPage.backLink.click()
    await expect(page).toHaveURL(RecordSessionAttendancePage.url(pastMeeting.caseRefId))
  })
})

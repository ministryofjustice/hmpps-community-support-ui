import { test, expect } from '@playwright/test'
import { IcsFeedbackSubmission } from '@community-support-api'
import { login, resetStubs, seedSessionWithIcsFeedback } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { stubFor } from '../mockApis/wiremock'
import IcsFeedbackIssuesOrConcernsPage from '../pages/IcsFeedbackIssuesOrConcernsPage'

const CASE_REFERENCE = 'AB1234CD'
const ISSUES_OR_CONCERNS_URL = IcsFeedbackIssuesOrConcernsPage.url(CASE_REFERENCE)
const IDENTIFIED_ADDITIONAL_NEEDS_URL = `/ics-feedback/${CASE_REFERENCE}/identified-additional-needs`

const mockIcsFeedbackSubmission: IcsFeedbackSubmission = { record: { didSessionHappen: true } }

test.describe('ICS feedback issues or concerns page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetIcsFeedbackPage(CASE_REFERENCE, 'issues-or-concerns', {
      referralFirstName: 'John',
    })
    await communitySupport.stubGetIcsFeedbackPage(CASE_REFERENCE, 'identified-additional-needs', {
      referralFirstName: 'John',
    })
    await stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral/${CASE_REFERENCE}/existing-support-needs`,
      },
      response: { status: 404 },
    })
  })

  test('shows the issues text area and required notification choice', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(ISSUES_OR_CONCERNS_URL)

    await IcsFeedbackIssuesOrConcernsPage.verifyOnPage(page)
    await expect(page.getByText('What issues or concerns did you identify in the ICS?', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Do you want us to send an email to the probation practitioner about the issues or concerns?', {
        exact: true,
      }),
    ).toBeVisible()
  })

  test('shows both required field errors even without a feedback draft', async ({ page }) => {
    await page.goto(ISSUES_OR_CONCERNS_URL)
    const issuesOrConcernsPage = await IcsFeedbackIssuesOrConcernsPage.verifyOnPage(page)

    await issuesOrConcernsPage.continueButton.click()

    await expect(page).toHaveURL(ISSUES_OR_CONCERNS_URL)
    const summary = page.locator('.govuk-error-summary')
    await expect(summary.getByRole('heading', { name: 'There is a problem' })).toBeVisible()
    await expect(summary.getByRole('link', { name: 'Enter issues or concerns you identified' })).toBeVisible()
    const notificationError = 'Select yes if the probation practitioner needs to know about these issues or concerns'
    await expect(page.locator('#issuesOrConcerns-error')).toContainText('Enter issues or concerns you identified')
    await expect(page.locator('#notifyProbationPractitioner-error')).toContainText(notificationError)
    await summary.getByRole('link', { name: notificationError }).click()
    await expect(issuesOrConcernsPage.notifyProbationPractitionerYes).toBeFocused()
  })

  test('keeps entered details when the notification choice is missing', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(ISSUES_OR_CONCERNS_URL)
    const issuesOrConcernsPage = await IcsFeedbackIssuesOrConcernsPage.verifyOnPage(page)

    await issuesOrConcernsPage.issuesOrConcernsInput.fill('Discussed housing concerns')
    await issuesOrConcernsPage.continueButton.click()

    await expect(page.locator('#notifyProbationPractitioner-error')).toBeVisible()
    await expect(issuesOrConcernsPage.issuesOrConcernsInput).toHaveValue('Discussed housing concerns')
  })

  for (const selection of ['Yes', 'No'] as const) {
    test(`saves the ${selection} notification choice and issues details`, async ({ page }) => {
      await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
      await page.goto(ISSUES_OR_CONCERNS_URL)
      const issuesOrConcernsPage = await IcsFeedbackIssuesOrConcernsPage.verifyOnPage(page)

      await issuesOrConcernsPage.issuesOrConcernsInput.fill('Discussed housing concerns')
      const notificationRadio = page.getByRole('radio', { name: selection, exact: true })
      await notificationRadio.check()
      await issuesOrConcernsPage.continueButton.click()
      await expect(page).toHaveURL(IDENTIFIED_ADDITIONAL_NEEDS_URL)

      await page.goto(ISSUES_OR_CONCERNS_URL)
      const savedPage = await IcsFeedbackIssuesOrConcernsPage.verifyOnPage(page)
      await expect(savedPage.issuesOrConcernsInput).toHaveValue('Discussed housing concerns')
      await expect(page.getByRole('radio', { name: selection, exact: true })).toBeChecked()
    })
  }
})

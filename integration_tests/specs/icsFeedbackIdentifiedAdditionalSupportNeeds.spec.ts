import { test, expect } from '@playwright/test'
import { IcsFeedbackIdentifiedAdditionalNeedsBffDto, IcsFeedbackSubmission } from '@community-support-api'
import { login, resetStubs, seedSessionWithIcsFeedback } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { stubFor } from '../mockApis/wiremock'
import IcsFeedbackIdentifiedAdditionalSupportNeedsPage from '../pages/IcsFeedbackIdentifiedAdditionalSupportNeedsPage'

const CASE_REFERENCE = 'AB1234CD'

const IDENTIFIED_ADDITIONAL_NEEDS_URL = `/ics-feedback/${CASE_REFERENCE}/identified-additional-needs`
const ISSUE_OR_CONCERN_PAGE_URL = `/ics-feedback/${CASE_REFERENCE}/issues-or-concerns`

const mockIcsFeedbackSubmission: IcsFeedbackSubmission = { record: { didSessionHappen: true } }
const mockIdentifiedAdditionalNeeds: IcsFeedbackIdentifiedAdditionalNeedsBffDto = {
  referralFirstName: 'John',
}

test.describe('Identified Additional Support Needs Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetIcsFeedbackPage(
      CASE_REFERENCE,
      'identified-additional-needs',
      mockIdentifiedAdditionalNeeds,
    )
    await stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/community-support/bff/referral/${CASE_REFERENCE}/existing-support-needs`,
      },
      response: { status: 404 },
    })
  })

  test('AC1 Page displays inputs and labels', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await page.goto(IDENTIFIED_ADDITIONAL_NEEDS_URL)
    await IcsFeedbackIdentifiedAdditionalSupportNeedsPage.verifyOnPage(page)
  })

  test('AC2 Back link navigates to issues or concerns page', async ({ page }) => {
    await seedSessionWithIcsFeedback(page, mockIcsFeedbackSubmission)
    await communitySupport.stubGetIcsFeedbackPage(CASE_REFERENCE, 'issues-or-concerns', {
      referralFirstName: mockIdentifiedAdditionalNeeds.referralFirstName,
    })
    await page.goto(IDENTIFIED_ADDITIONAL_NEEDS_URL)
    const identifiedAdditionalSupportNeedsPage =
      await IcsFeedbackIdentifiedAdditionalSupportNeedsPage.verifyOnPage(page)
    await identifiedAdditionalSupportNeedsPage.backLink.click()
    await expect(page).toHaveURL(ISSUE_OR_CONCERN_PAGE_URL)
  })
})

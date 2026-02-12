import { expect, test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ReferralConfirmationPage from '../pages/referralConfirmationPage'

test.describe('ConfirmationPage', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferral()
    await page.goto('/')
    await login(page)
  })

  test('should display the confirmation message with reference number', async ({ page }) => {
    await page.goto('/referral/b190ac1e-1e2a-41c2-a4ac-3ceb9d2dcb1e/confirmation')
    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })
})

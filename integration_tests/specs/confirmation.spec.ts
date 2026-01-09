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
    await page.goto('/referral/referral123/confirmation')
    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })
})

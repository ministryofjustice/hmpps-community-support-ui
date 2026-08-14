import { expect, test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import FindPersonPage from '../pages/findPersonPage'
import HomePage from '../pages/homePage'
import ReferralConfirmationPage from '../pages/referralConfirmationPage'

test.describe('ConfirmationPage', () => {
  const referralConfirmationUrl = '/referral/b190ac1e-1e2a-41c2-a4ac-3ceb9d2dcb1e/confirmation'
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferral()
    await page.goto('/')
    await login(page)
  })

  test('should display the confirmation message with reference number', async ({ page }) => {
    await page.goto(referralConfirmationUrl)
    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)
    expect(referralConfirmationPage.header).toBeVisible()
  })

  test('should navigate to find a person when Start a new referral is clicked', async ({ page }) => {
    await page.goto(referralConfirmationUrl)
    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)

    await referralConfirmationPage.startNewReferralButton.click()

    await expect(page).toHaveURL(FindPersonPage.url())
    await FindPersonPage.verifyOnPage(page)
  })

  test('should navigate to the home page when Back to Community Support Homepage is clicked', async ({ page }) => {
    await page.goto(referralConfirmationUrl)
    const referralConfirmationPage = await ReferralConfirmationPage.verifyOnPage(page)

    await referralConfirmationPage.backToCommunityHomeLink.click()

    await expect(page).toHaveURL(HomePage.url())
    await HomePage.verifyOnPage(page)
  })
})

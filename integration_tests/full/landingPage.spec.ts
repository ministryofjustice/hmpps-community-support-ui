import { expect, test } from '@playwright/test'

import { loginDeliusUser, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'
import communitySupport from '../mockApis/communitySupport'
import FindPersonPage from '../pages/findPersonPage'

test.describe('Landing page as a Delius user', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await loginDeliusUser(page)
  })

  test('AC1 to AC5 - Heading and simplified tiles are visible in the right order', async ({ page }) => {
    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.header).toHaveText('Community Support')
    await expect(homePage.makeAReferralTile).toBeVisible()
    await expect(homePage.viewCasesTile).toBeVisible()
    await homePage.expectTileOrder(['Make a referral', 'View cases'])

    await expect(page.getByRole('link', { name: 'Unassigned Cases' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Cases In Progress' })).toHaveCount(0)
  })

  test('AC6 - View cases tile navigates to the cases screen for Delius users', async ({ page }) => {
    await communitySupport.stubGetInProgressCase()

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.clickViewCasesTile()

    await expect(page).toHaveURL('/cases-in-progress')
  })

  test('AC7 - Make a referral tile navigates to Enter CRN or prison number for Delius users', async ({ page }) => {
    const homePage = await HomePage.verifyOnPage(page)
    await homePage.clickMakeAReferralTile()

    await expect(page).toHaveURL(FindPersonPage.url())
    await FindPersonPage.verifyOnPage(page)
  })
})

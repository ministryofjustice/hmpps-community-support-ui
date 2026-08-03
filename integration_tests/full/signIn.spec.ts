import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'
import communitySupport from '../mockApis/communitySupport'
import FindPersonPage from '../pages/findPersonPage'

test.describe('SignIn', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User name visible in header', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.usersName).toHaveText('A. Testuser')
  })

  test('Phase banner visible in header', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.phaseBanner).toHaveText('dev')
  })

  test('User can sign out', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.signOut()

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User can manage their details', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    await hmppsAuth.stubManageDetailsPage()

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.clickManageUserDetails()

    await expect(page.getByRole('heading')).toHaveText('Your account details')
  })

  test('AC1 to AC5 - Landing page heading and simplified tiles are visible in the right order', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.header).toHaveText('Community Support')
    await expect(homePage.makeAReferralTile).toBeVisible()
    await expect(homePage.viewCasesTile).toBeVisible()
    await homePage.expectTileOrder(['Make a referral', 'View cases'])

    await expect(page.getByRole('link', { name: 'Unassigned Cases' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Cases In Progress' })).toHaveCount(0)
  })

  test('AC6 - View cases tile navigates to the cases screen', async ({ page }) => {
    await login(page)
    await communitySupport.stubGetInProgressCase()

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.clickViewCasesTile()

    await expect(page).toHaveURL('/cases-in-progress')
  })

  test('AC7 - Make a referral tile navigates to Enter CRN or prison number', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.clickMakeAReferralTile()

    await expect(page).toHaveURL(FindPersonPage.url())
    await FindPersonPage.verifyOnPage(page)
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await login(page, { active: false })

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Token verification failure clears user session', async ({ page }) => {
    await login(page, { name: 'A TestUser', active: false })

    await expect(page.getByRole('heading')).toHaveText('Sign in')

    await login(page, { name: 'Some OtherTestUser', active: true })

    const homePage = await HomePage.verifyOnPage(page)
    await expect(homePage.usersName).toHaveText('S. Othertestuser')
  })
})

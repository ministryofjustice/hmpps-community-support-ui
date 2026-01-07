import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import FindPersonPage from '../pages/findPersonPage'
import FoundPersonPage from '../pages/foundPersonPage'
import communitySupport from '../mockApis/communitySupport'

test.describe('FindPerson', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetPerson()
    await page.goto('/')
    await login(page)
  })

  test('should display the find person page', async ({ page }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    expect(findPersonPage.header).toBeVisible()
  })

  test('should display the found details page when a person is found', async ({ page }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.identifierInput.fill('person123')
    await findPersonPage.submitButton.click()
    const foundPersonPage = await FoundPersonPage.verifyOnPage(page)
    expect(foundPersonPage.personDetails).toHaveText('person123')
  })
})

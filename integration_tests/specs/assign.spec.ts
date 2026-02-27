import test, { expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AssignPage from '../pages/AssignPage'

test.describe('AssignPage', () => {
  const id = randomUUID()
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferralUserAssignments()
    await page.goto('/')
    await login(page)
    await test.step('go to assign page', async () => {
      await page.goto(`/referral/${id}/assign`)
    })
  })

  test('should display the page', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    expect(assignPage.header).toBeVisible()
  })
  // IPB-2010:AC1
  test('Assigning cases headers', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('check content', async () => {
      await expect(assignPage.header).toHaveText('Who do you want to assign this case to?')
      await expect(assignPage.subheader).toHaveText('Caseworker')
    })
  })
})

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
  })

  test('should display the page', async ({ page }) => {
    await page.goto(`/referral/${id}/assign`)
    const assignPage = await AssignPage.verifyOnPage(page)
    expect(assignPage.header).toBeVisible()
  })
})

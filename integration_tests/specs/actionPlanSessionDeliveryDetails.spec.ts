import { test, expect } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import sessionDeliveryDetails from '../mockData/actionPlanData'
import ActionPlanSessionDeliveryDetailsPage from '../pages/actionPlanSessionDeliveryDetailsPage'

test.describe('Action Plan Session Delivery Details Page', () => {
  const caseReference = 'AB1234CD'

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays session delivery questions, hints and saved answers', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, sessionDeliveryDetails)

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))

    const sessionDeliveryDetailsPage = await ActionPlanSessionDeliveryDetailsPage.verifyOnPage(page)

    await expect(sessionDeliveryDetailsPage.header).toHaveText('Session details')
    await expect(page.getByLabel('How often will sessions take place?')).toHaveValue('Every week')
    await expect(page.getByText('For example, every week, every 2 weeks, every month.')).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Video call' })).toBeChecked()
    await expect(page.locator('#VIDEO_CALL')).toHaveValue('Travel restrictions')
    await expect(page.getByRole('checkbox', { name: 'Group session' })).toBeChecked()
  })
})

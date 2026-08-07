import { test, expect } from '@playwright/test'
import { ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ActionPlanPage from '../pages/actionPlanPage'
import ReferralProgressPage from '../pages/referralProgressPage'

test.describe('Action Plan Page', () => {
  const caseReference = 'AB1234CD'

  const actionPlanSummary: ActionPlanSummaryDto = {
    personDetails: {
      fullName: 'Alex River',
    },
    needs: [],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays action plan header and links back to progress', async ({ page }) => {
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)
    await communitySupport.stubGetReferralProgress(buildReferralProgress([]), caseReference)

    await page.goto(ActionPlanPage.url(caseReference))

    const actionPlanPage = await ActionPlanPage.verifyOnPage(page)

    await expect(actionPlanPage.header).toHaveText('Action plan for Alex River')
    await expect(actionPlanPage.backLink).toHaveAttribute('href', `/progress/${caseReference}`)

    await actionPlanPage.backLink.click()

    await ReferralProgressPage.verifyOnPage(page)
    await expect(page).toHaveURL(ReferralProgressPage.url(caseReference))
  })
})

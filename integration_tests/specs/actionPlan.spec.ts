import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import sessionDeliveryDetails from '../mockData/actionPlanData'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ActionPlanPage from '../pages/actionPlanPage'
import ReferralProgressPage from '../pages/referralProgressPage'
import ActionPlanSessionDeliveryDetailsPage from '../pages/actionPlanSessionDeliveryDetailsPage'

test.describe('Action Plan Page', () => {
  const caseReference = 'AB1234CD'

  const actionPlanSummary: ActionPlanSummaryDto = {
    lastUpdatedAt: '2026-10-12T09:00:00Z',
    personDetails: {
      firstName: 'Alex',
      lastName: 'River',
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

    await expect(actionPlanPage.header).toHaveText('Action plan')
    await expect(actionPlanPage.backLink).toHaveAttribute('href', `/progress/${caseReference}`)

    await actionPlanPage.backLink.click()

    await ReferralProgressPage.verifyOnPage(page)
    await expect(page).toHaveURL(ReferralProgressPage.url(caseReference))
  })

  test.describe('Submit Action plan', () => {
    const actionPlanSummaryWithOutcomes: ActionPlanSummaryDto = {
      lastUpdatedAt: '2026-10-12T09:00:00Z',
      personDetails: {
        firstName: 'Alex',
        lastName: 'River',
      },
      needs: [
        {
          id: randomUUID(),
          label: 'Accommodation',
          orderNumber: 1,
          outcomes: [
            {
              id: randomUUID(),
              label: 'I want to secure and maintain settled and suitable accommodation.',
              activities: [{ id: randomUUID(), who: 'Delivery practitioner', details: 'Find suitable housing' }],
            },
          ],
        },
      ],
    }

    const icsFeedbackSubmittedProgress = buildReferralProgress([
      { event: { status: 'COMPLETED', icsFeedbackId: randomUUID() } },
    ])

    test('displays an enabled Submit Action plan button when all outcomes are added and ICS feedback is submitted', async ({
      page,
    }) => {
      await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummaryWithOutcomes)
      await communitySupport.stubGetReferralProgress(icsFeedbackSubmittedProgress, caseReference)

      await page.goto(ActionPlanPage.url(caseReference))

      const actionPlanPage = await ActionPlanPage.verifyOnPage(page)

      await expect(actionPlanPage.submitActionPlanButton).toBeVisible()
      await expect(actionPlanPage.submitActionPlanButton).toBeEnabled()
    })

    test('does not display the Submit Action plan button when ICS feedback has not been submitted', async ({
      page,
    }) => {
      await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummaryWithOutcomes)
      await communitySupport.stubGetReferralProgress(
        buildReferralProgress([{ event: { status: 'NEEDS_FEEDBACK' } }]),
        caseReference,
      )

      await page.goto(ActionPlanPage.url(caseReference))

      const actionPlanPage = await ActionPlanPage.verifyOnPage(page)

      await expect(actionPlanPage.submitActionPlanButton).toHaveCount(0)
    })

    test('does not display the Submit Action plan button when not all outcomes have been added', async ({ page }) => {
      await communitySupport.stubGetActionPlanSummary(caseReference, {
        ...actionPlanSummaryWithOutcomes,
        needs: [
          ...actionPlanSummaryWithOutcomes.needs,
          { id: randomUUID(), label: 'Finances', orderNumber: 2, outcomes: [] },
        ],
      })
      await communitySupport.stubGetReferralProgress(icsFeedbackSubmittedProgress, caseReference)

      await page.goto(ActionPlanPage.url(caseReference))

      const actionPlanPage = await ActionPlanPage.verifyOnPage(page)

      await expect(actionPlanPage.submitActionPlanButton).toHaveCount(0)
    })

    test('navigates to the Session details page when Submit Action plan is selected', async ({ page }) => {
      await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummaryWithOutcomes)
      await communitySupport.stubGetReferralProgress(icsFeedbackSubmittedProgress, caseReference)
      await communitySupport.stubGetSessionDeliveryDetails(caseReference, sessionDeliveryDetails)

      await page.goto(ActionPlanPage.url(caseReference))

      const actionPlanPage = await ActionPlanPage.verifyOnPage(page)
      await actionPlanPage.submitActionPlanButton.click()

      const sessionDeliveryDetailsPage = await ActionPlanSessionDeliveryDetailsPage.verifyOnPage(page)
      await expect(page).toHaveURL(ActionPlanSessionDeliveryDetailsPage.url(caseReference))
      await expect(sessionDeliveryDetailsPage.header).toHaveText('Session details')
    })
  })
})

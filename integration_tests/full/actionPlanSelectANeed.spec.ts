import { test, expect } from '@playwright/test'
import { ActionPlanSelectANeedResponse, ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanSelectANeedPage from '../pages/actionPlanSelectANeedPage'

test.describe('Select an action plan need', () => {
  const caseReference = 'AB1234CD'

  const needsAndOutcomes: ActionPlanSelectANeedResponse = {
    needs: [
      {
        id: 'need-one-outcome',
        label: 'Accommodation',
        outcomes: [{ id: 'outcome-one', text: 'Improve accommodation' }],
      },
      {
        id: 'need-multiple-outcomes',
        label: 'Employment',
        outcomes: [
          { id: 'outcome-one', text: 'Find employment' },
          { id: 'outcome-two', text: 'Keep employment' },
        ],
      },
      {
        id: 'need-no-outcomes',
        label: 'Education',
        outcomes: [],
      },
    ],
  }

  const actionPlanSummary: ActionPlanSummaryDto = {
    personDetails: { firstName: 'Alex', lastName: 'River' },
    needs: [],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('shows only needs that have outcomes', async ({ page }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)

    await page.goto(ActionPlanSelectANeedPage.url(caseReference))

    const selectANeedPage = await ActionPlanSelectANeedPage.verifyOnPage(page)

    expect(selectANeedPage.needs.labels()).toEqual(['Accommodation', 'Employment'])
  })

  test('shows an error when no need is selected', async ({ page }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)

    await page.goto(ActionPlanSelectANeedPage.url(caseReference))
    const selectANeedPage = await ActionPlanSelectANeedPage.verifyOnPage(page)

    await selectANeedPage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanSelectANeedPage.url(caseReference))
    await expect(page.getByText('Select which need you are creating an action for', { exact: true })).toHaveCount(2)
  })

  test('redirects to select an outcome for a need with multiple outcomes', async ({ page }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    const selectANeedPage = await page.goto(ActionPlanSelectANeedPage.url(caseReference))
    expect(selectANeedPage).toBeTruthy()
    const pageObject = await ActionPlanSelectANeedPage.verifyOnPage(page)

    await pageObject.needs.select('Employment')
    await pageObject.continueButton.click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/select-an-outcome`)
  })

  test('redirects to activities for a need with one outcome', async ({ page }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)

    await page.goto(ActionPlanSelectANeedPage.url(caseReference))
    const selectANeedPage = await ActionPlanSelectANeedPage.verifyOnPage(page)

    await selectANeedPage.needs.select('Accommodation')
    await selectANeedPage.continueButton.click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/add-activities`)
  })
})

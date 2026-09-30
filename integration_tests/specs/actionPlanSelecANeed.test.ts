import { test, expect } from '@playwright/test'
import { ActionPlanSelectANeedResponse, ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanAddActivityPage from '../pages/actionPlanAddActivityPage'
import ActionPlanViewActivitiesPage from '../pages/actionPlanViewActivitiesPage'

test.describe('Select an action plan need', () => {
  const caseReference = 'AB1234CD'

  const needsAndOutcomes: ActionPlanSelectANeedResponse = {
    needs: [
      {
        id: 'need-multiple-outcomes',
        label: 'Employment',
        outcomes: [
          { id: 'outcome-one', text: 'Find employment' },
          { id: 'outcome-two', text: 'Keep employment' },
        ],
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

  test('adds first activity, then returns to activities for later outcomes', async ({ page }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(`/referral/${caseReference}/action-plan/select-a-need`)
    await page.getByLabel('Employment').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/select-an-outcome`)
    await page.getByLabel('Find employment').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    const addActivityPage = await ActionPlanAddActivityPage.verifyOnPage(page)
    await expect(page).toHaveURL(ActionPlanAddActivityPage.url(caseReference))
    await expect(addActivityPage.insetText).toContainText('Area of need: Employment')
    await expect(addActivityPage.insetText).toContainText('Outcome: Find employment')
    await expect(addActivityPage.activityProvider).toBeVisible()
    await expect(addActivityPage.activityDescription).toBeVisible()

    await addActivityPage.activityProvider.fill('Local support organisation')
    await addActivityPage.activityDescription.fill('Weekly employment support sessions')
    await addActivityPage.saveAndContinueButton.click()

    const viewActivitiesPage = await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(page).toHaveURL(ActionPlanViewActivitiesPage.url(caseReference))
    await expect(page.getByText('Do you want to add another activity?', { exact: true })).toBeVisible()
    await expect(viewActivitiesPage.addAnotherActivityRadios.getByLabel('Yes')).toBeVisible()
    await expect(viewActivitiesPage.addAnotherActivityRadios.getByLabel('No')).toBeVisible()
    await expect(viewActivitiesPage.activitiesTable.locator('thead')).toContainText('Who will deliver this')
    await expect(viewActivitiesPage.activitiesTable.locator('thead')).toContainText('Activity details')
    await expect(viewActivitiesPage.activitiesTable.locator('thead')).toContainText('Actions')
    await expect(viewActivitiesPage.activityRows).toHaveCount(1)
    await expect(viewActivitiesPage.activityRows.first()).toContainText('Local support organisation')
    await expect(viewActivitiesPage.activityRows.first()).toContainText('Weekly employment support sessions')
    await expect(viewActivitiesPage.activityRows.first().getByRole('link', { name: 'Change' })).toBeVisible()
    await expect(viewActivitiesPage.activityRows.first().getByRole('link', { name: 'Remove' })).toBeVisible()

    await viewActivitiesPage.addAnotherActivityRadios.getByLabel('Yes').check()
    await viewActivitiesPage.saveAndContinueButton.click()
    await ActionPlanAddActivityPage.verifyOnPage(page)

    await page.goto(ActionPlanViewActivitiesPage.url(caseReference))
    await viewActivitiesPage.activityRows.first().getByRole('link', { name: 'Change' }).click()
    const editActivityPage = await ActionPlanAddActivityPage.verifyOnPage(page)
    await expect(editActivityPage.activityProvider).toHaveValue('Local support organisation')
    await expect(editActivityPage.activityDescription).toHaveValue('Weekly employment support sessions')
    await editActivityPage.activityProvider.fill('Updated support organisation')
    await editActivityPage.saveAndContinueButton.click()

    await page.goto(`/referral/${caseReference}/action-plan/select-an-outcome`)
    await page.getByLabel('Find employment').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(page).toHaveURL(ActionPlanViewActivitiesPage.url(caseReference))

    const populatedActivitiesPage = await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await populatedActivitiesPage.removeLinks.first().click()
    await expect(page.getByRole('heading', { name: 'Are you sure you want to remove this activity?' })).toBeVisible()
    await expect(page.getByText('Updated support organisation')).toBeVisible()
    await page.getByRole('button', { name: 'Remove activity', exact: true }).click()
    await expect(populatedActivitiesPage.activityRows).toHaveCount(0)

    await populatedActivitiesPage.addAnotherActivityRadios.getByLabel('No').check()
    await populatedActivitiesPage.saveAndContinueButton.click()
    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan`)
  })
})

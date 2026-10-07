import { test, expect } from '@playwright/test'
import { ActionPlanSelectANeedResponse, ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanAddActivityPage from '../pages/actionPlanAddActivityPage'
import ActionPlanViewActivitiesPage from '../pages/actionPlanViewActivitiesPage'
import ActionPlanRemoveActivityPage from '../pages/actionPlanRemoveActivityPage'

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
    const removeActivityPage = await ActionPlanRemoveActivityPage.verifyOnPage(page)
    await expect(removeActivityPage.hint).toHaveText(
      'This is the only activity in the action plan. If you remove it, you will need to start the action plan again.',
    )

    await removeActivityPage.saveAndContinueButton.click()
    await expect(page.locator('[data-testid="error-messages"]')).toContainText(
      'Select yes if you want to remove this activity',
    )
    await expect(page.locator('.govuk-error-message')).toContainText('Select yes if you want to remove this activity')

    await removeActivityPage.yesOption.check()
    await removeActivityPage.saveAndContinueButton.click()
    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/select-a-need`)
  })

  test('keeps an activity when no is selected and removes one of several when yes is selected', async ({ page }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(`/referral/${caseReference}/action-plan/select-a-need`)
    await page.getByLabel('Employment').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByLabel('Find employment').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    const firstActivityPage = await ActionPlanAddActivityPage.verifyOnPage(page)
    await firstActivityPage.activityProvider.fill('First provider')
    await firstActivityPage.activityDescription.fill('First activity')
    await firstActivityPage.saveAndContinueButton.click()

    const viewActivitiesPage = await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await viewActivitiesPage.addAnotherActivityRadios.getByLabel('Yes').check()
    await viewActivitiesPage.saveAndContinueButton.click()

    const secondActivityPage = await ActionPlanAddActivityPage.verifyOnPage(page)
    await secondActivityPage.activityProvider.fill('Second provider')
    await secondActivityPage.activityDescription.fill('Second activity')
    await secondActivityPage.saveAndContinueButton.click()

    await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(viewActivitiesPage.activityRows).toHaveCount(2)

    await viewActivitiesPage.removeLinks.first().click()
    const removeActivityPage = await ActionPlanRemoveActivityPage.verifyOnPage(page)
    await expect(removeActivityPage.hint).toHaveCount(0)
    await removeActivityPage.noOption.check()
    await removeActivityPage.saveAndContinueButton.click()

    await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(viewActivitiesPage.activityRows).toHaveCount(2)

    await viewActivitiesPage.removeLinks.first().click()
    await ActionPlanRemoveActivityPage.verifyOnPage(page)
    await removeActivityPage.yesOption.check()
    await removeActivityPage.saveAndContinueButton.click()

    await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(page).toHaveURL(ActionPlanViewActivitiesPage.url(caseReference))
    await expect(viewActivitiesPage.activityRows).toHaveCount(1)
    await expect(viewActivitiesPage.activityRows.first()).toContainText('Second provider')
  })
})

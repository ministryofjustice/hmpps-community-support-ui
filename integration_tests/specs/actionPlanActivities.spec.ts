import { test, expect } from '@playwright/test'
import { ActionPlanSelectANeedResponse, ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import { getMatchingRequests, stubFor } from '../mockApis/wiremock'
import communitySupport from '../mockApis/communitySupport'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'
import ActionPlanPage from '../pages/actionPlanPage'
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
    selectedNeeds: [{ id: 'selected-need-1', label: 'Accommodation' }],
  }

  const actionPlanSummary: ActionPlanSummaryDto = {
    lastUpdatedAt: '2026-10-12T09:00:00Z',
    personDetails: { firstName: 'Alex', lastName: 'River' },
    needs: [],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('hides needs with saved outcomes and offers them again once removed', async ({ page }) => {
    const accommodationNeed = {
      id: 'need-accommodation',
      label: 'Accommodation',
      outcomes: [{ id: 'outcome-housing', text: 'Find housing' }],
    }
    await communitySupport.stubGetActionPlanNeedsAndOutcomes({
      ...needsAndOutcomes,
      needs: [...needsAndOutcomes.needs, accommodationNeed],
    })
    await communitySupport.stubGetActionPlanSummary(caseReference, {
      ...actionPlanSummary,
      needs: [
        {
          id: 'need-multiple-outcomes',
          label: 'Employment',
          orderNumber: 1,
          outcomes: [{ id: 'saved-outcome-one', label: 'Find employment', activities: [] }],
        },
      ],
    })

    await page.goto(`/referral/${caseReference}/action-plan/select-a-need`)
    await expect(page.getByRole('radio', { name: 'Employment', exact: true })).toHaveCount(0)
    await expect(page.getByRole('radio', { name: 'Accommodation', exact: true })).toBeVisible()
    await page.getByText('Show the needs identified in the referral').click()
    await expect(page.locator('.govuk-details__text')).toContainText('Accommodation')
    await page.getByRole('radio', { name: 'Accommodation', exact: true }).check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await ActionPlanAddActivityPage.verifyOnPage(page)

    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)
    await page.goto(`/referral/${caseReference}/action-plan/select-a-need`)
    await expect(page.getByRole('radio', { name: 'Employment', exact: true })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Accommodation', exact: true })).toBeChecked()
  })

  test('adds, edits, and removes the last activity from an action plan and returns user back to start of add need and outcome process', async ({
    page,
  }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(`/referral/${caseReference}/action-plan/select-a-need`)
    await page.getByText('Show the needs identified in the referral').click()
    await expect(page.locator('.govuk-details__text')).toContainText('Accommodation')
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
    await expect(page.locator('[data-testid="action-plan-activities-alert"]')).toContainText(
      "You added an activity to Alex's plan",
    )
    await expect(page.getByText('Do you want to add another activity?', { exact: true })).toBeVisible()
    await expect(viewActivitiesPage.addAnotherActivityRadios.getByLabel('Yes')).toBeVisible()
    await expect(viewActivitiesPage.addAnotherActivityRadios.getByLabel('No')).toBeVisible()
    await expect(viewActivitiesPage.activitiesTable.locator('thead')).toContainText('Who will deliver this')
    await expect(viewActivitiesPage.activitiesTable.locator('thead')).toContainText('Activity details')
    await expect(viewActivitiesPage.activitiesTable.locator('thead')).toContainText('Action')
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

  test('keeps an activity when the no do not remove radio option is selected', async ({ page }) => {
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
    await viewActivitiesPage.removeLinks.first().click()
    const removeActivityPage = await ActionPlanRemoveActivityPage.verifyOnPage(page)
    await expect(removeActivityPage.hint).toHaveText(
      'This is the only activity in the action plan. If you remove it, you will need to start the action plan again.',
    )
    await removeActivityPage.noOption.check()
    await removeActivityPage.saveAndContinueButton.click()

    await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(viewActivitiesPage.activityRows).toHaveCount(1)
    await expect(viewActivitiesPage.activityRows.first()).toContainText('First provider')
  })

  test('removes the selected activity when several are present', async ({ page }) => {
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
    await removeActivityPage.yesOption.check()
    await removeActivityPage.saveAndContinueButton.click()

    await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(page).toHaveURL(ActionPlanViewActivitiesPage.url(caseReference))
    await expect(page.locator('[data-testid="action-plan-activities-alert"]')).toContainText(
      "You removed an activity from Alex's plan",
    )
    await expect(viewActivitiesPage.activityRows).toHaveCount(1)
    await expect(viewActivitiesPage.activityRows.first()).toContainText('Second provider')
    await expect(viewActivitiesPage.activityRows.first()).not.toContainText('First provider')
  })

  test('submits the selected need, outcome and activities when no more activities are added', async ({ page }) => {
    await communitySupport.stubGetActionPlanNeedsAndOutcomes(needsAndOutcomes)
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)
    await communitySupport.stubSubmitAction(caseReference, {
      success: true,
      message: 'Action submitted successfully',
    })
    await communitySupport.stubGetReferralProgress(buildReferralProgress([]), caseReference)

    await page.goto(`/referral/${caseReference}/action-plan/select-a-need`)
    await page.getByLabel('Employment').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByLabel('Find employment').check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    const addActivityPage = await ActionPlanAddActivityPage.verifyOnPage(page)
    await addActivityPage.activityProvider.fill('Local support organisation')
    await addActivityPage.activityDescription.fill('Weekly employment support sessions')
    await addActivityPage.saveAndContinueButton.click()

    const viewActivitiesPage = await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await viewActivitiesPage.addAnotherActivityRadios.getByLabel('No').check()
    await viewActivitiesPage.saveAndContinueButton.click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Action plan')

    const matchingRequests = await getMatchingRequests({
      method: 'POST',
      urlPath: `/community-support/referral/${caseReference}/action-plan/action`,
    })
    const [submittedAction] = matchingRequests.body.requests
    expect(JSON.parse(submittedAction.body)).toEqual({
      needId: 'need-multiple-outcomes',
      outcomeId: 'outcome-one',
      activities: [
        {
          who: 'Local support organisation',
          activityDetails: 'Weekly employment support sessions',
          status: 'Active',
        },
      ],
    })
  })

  test('opens existing activities from the action plan summary for the selected need and outcome', async ({ page }) => {
    const referenceNeedId = '00000000-0000-4000-8000-000000000001'
    const referenceOutcomeId = '00000000-0000-4000-8000-000000000002'
    const outcomeAnswerId = '00000000-0000-4000-8000-000000000003'
    const populatedActionPlanSummary: ActionPlanSummaryDto = {
      lastUpdatedAt: '2026-10-12T09:00:00Z',
      personDetails: { firstName: 'Alex', lastName: 'River' },
      needs: [
        {
          id: referenceNeedId,
          label: 'Accommodation',
          orderNumber: 1,
          outcomes: [
            {
              id: outcomeAnswerId,
              label: referenceOutcomeId,
              activities: [
                { id: 'activity-existing', who: 'Local housing service', details: 'Attend weekly appointments' },
              ],
            },
          ],
        },
      ],
    }
    await communitySupport.stubGetActionPlanSummary(caseReference, populatedActionPlanSummary)
    await communitySupport.stubGetActionPlanNeedsAndOutcomes({
      needs: [
        {
          id: referenceNeedId,
          label: 'Accommodation',
          outcomes: [{ id: referenceOutcomeId, text: 'Find suitable housing' }],
        },
      ],
      selectedNeeds: [{ id: 'selected-need-1', label: 'Accommodation' }],
    })
    await communitySupport.stubGetReferralProgress(buildReferralProgress([]), caseReference)

    await page.goto(`/referral/${caseReference}/action-plan`)
    await page.getByRole('link', { name: 'Add or change activities' }).click()

    await expect(page).toHaveURL(
      `/referral/${caseReference}/action-plan/activities?needId=${referenceNeedId}&outcomeAnswerId=${outcomeAnswerId}`,
    )
    await expect(page.locator('.govuk-inset-text')).toContainText('Area of need: Accommodation')
    await expect(page.locator('.govuk-inset-text')).toContainText('Outcome: Find suitable housing')

    const viewActivitiesPage = await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await expect(viewActivitiesPage.activityRows).toHaveCount(1)
    await expect(viewActivitiesPage.activityRows.first()).toContainText('Local housing service')
    await expect(viewActivitiesPage.activityRows.first()).toContainText('Attend weekly appointments')

    await viewActivitiesPage.activityRows.first().getByRole('link', { name: 'Change' }).click()
    const editActivityPage = await ActionPlanAddActivityPage.verifyOnPage(page)
    await expect(editActivityPage.activityProvider).toHaveValue('Local housing service')
    await expect(editActivityPage.activityDescription).toHaveValue('Attend weekly appointments')
  })

  test('deletes a saved outcome when its last activity is removed', async ({ page }) => {
    const needId = '00000000-0000-4000-8000-000000000021'
    const outcomeId = '00000000-0000-4000-8000-000000000022'
    const outcomeAnswerId = '00000000-0000-4000-8000-000000000023'
    const summaryWithOutcome: ActionPlanSummaryDto = {
      lastUpdatedAt: '2026-10-12T09:00:00Z',
      personDetails: { firstName: 'Alex', lastName: 'River' },
      needs: [
        {
          id: needId,
          label: 'Accommodation',
          orderNumber: 1,
          outcomes: [
            {
              id: outcomeAnswerId,
              label: 'Find suitable housing',
              activities: [{ id: 'activity-1', who: 'Housing service', details: 'Attend weekly appointments' }],
            },
          ],
        },
      ],
    }
    await communitySupport.stubGetActionPlanSummary(caseReference, summaryWithOutcome)
    await communitySupport.stubGetActionPlanNeedsAndOutcomes({
      needs: [{ id: needId, label: 'Accommodation', outcomes: [{ id: outcomeId, text: 'Find suitable housing' }] }],
      selectedNeeds: [{ id: needId, label: 'Accommodation' }],
    })
    await stubFor({
      request: {
        method: 'DELETE',
        urlPath: `/community-support/referral/${caseReference}/action-plan/action/${outcomeAnswerId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { success: true, message: 'Action deleted successfully' },
      },
    })

    await page.goto(
      `/referral/${caseReference}/action-plan/activities?needId=${needId}&outcomeAnswerId=${outcomeAnswerId}`,
    )
    const activitiesPage = await ActionPlanViewActivitiesPage.verifyOnPage(page)
    await activitiesPage.removeLinks.first().click()
    const removeActivityPage = await ActionPlanRemoveActivityPage.verifyOnPage(page)
    await removeActivityPage.yesOption.check()
    await removeActivityPage.saveAndContinueButton.click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/select-a-need`)
    const deletionRequests = await getMatchingRequests({
      method: 'DELETE',
      urlPath: `/community-support/referral/${caseReference}/action-plan/action/${outcomeAnswerId}`,
    })
    expect(deletionRequests.body.requests).toHaveLength(1)
  })

  test('removes an outcome and its activities from the action plan', async ({ page }) => {
    const needId = '00000000-0000-4000-8000-000000000011'
    const outcomeId = '00000000-0000-4000-8000-000000000012'
    const outcomeAnswerId = '00000000-0000-4000-8000-000000000013'
    const summaryWithOutcome: ActionPlanSummaryDto = {
      lastUpdatedAt: '2026-10-12T09:00:00Z',
      personDetails: { firstName: 'Alex', lastName: 'River' },
      needs: [
        {
          id: needId,
          label: 'Accommodation',
          orderNumber: 1,
          outcomes: [
            {
              id: outcomeAnswerId,
              label: 'Find suitable housing',
              activities: [{ id: 'activity-1', who: 'Housing service', details: 'Attend weekly appointments' }],
            },
          ],
        },
      ],
    }
    await communitySupport.stubGetActionPlanSummary(caseReference, summaryWithOutcome)
    await communitySupport.stubGetActionPlanNeedsAndOutcomes({
      needs: [{ id: needId, label: 'Accommodation', outcomes: [{ id: outcomeId, text: 'Find suitable housing' }] }],
      selectedNeeds: [{ id: needId, label: 'Accommodation' }],
    })
    await communitySupport.stubGetReferralProgress(buildReferralProgress([]), caseReference)
    await stubFor({
      request: {
        method: 'DELETE',
        urlPath: `/community-support/referral/${caseReference}/action-plan/action/${outcomeAnswerId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { success: true, message: 'Action deleted successfully' },
      },
    })

    await page.goto(ActionPlanPage.url(caseReference))
    await page.getByRole('link', { name: /^Remove/ }).click()

    await expect(page).toHaveURL(
      `/referral/${caseReference}/action-plan/remove-outcome?needId=${needId}&outcomeAnswerId=${outcomeAnswerId}`,
    )
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      "Confirm you want to remove this outcome from Alex's plan",
    )
    await expect(page.locator('.govuk-summary-card')).toContainText('Accommodation')
    await expect(page.locator('.govuk-summary-card')).toContainText('Find suitable housing')
    await expect(page.locator('.govuk-summary-card')).toContainText('Housing service')
    await expect(page.locator('.govuk-summary-card')).toContainText('Attend weekly appointments')
    await expect(page.locator('.govuk-summary-card').getByRole('link')).toHaveCount(0)
    await expect(page.locator('.govuk-inset-text')).toHaveText(
      'If you remove this outcome from the plan, all activities added to this outcome will also be removed.',
    )
    await expect(page.getByRole('button', { name: 'Remove this outcome', exact: true })).toHaveClass(
      /govuk-button--warning/,
    )

    await page.getByRole('link', { name: 'Cancel', exact: true }).click()
    await expect(page).toHaveURL(ActionPlanPage.url(caseReference))
    const requestsAfterCancel = await getMatchingRequests({
      method: 'DELETE',
      urlPath: `/community-support/referral/${caseReference}/action-plan/action/${outcomeAnswerId}`,
    })
    expect(requestsAfterCancel.body.requests).toHaveLength(0)

    await page.getByRole('link', { name: /^Remove/ }).click()
    await page.getByRole('button', { name: 'Remove this outcome', exact: true }).click()
    await expect(page).toHaveURL(ActionPlanPage.url(caseReference))

    const matchingRequests = await getMatchingRequests({
      method: 'DELETE',
      urlPath: `/community-support/referral/${caseReference}/action-plan/action/${outcomeAnswerId}`,
    })
    expect(matchingRequests.body.requests).toHaveLength(1)
  })
})

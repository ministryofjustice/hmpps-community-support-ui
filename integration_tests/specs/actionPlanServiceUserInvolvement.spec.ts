import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { ActionPlanSessionDeliveryDetailsResponse, ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanServiceUserInvolvementPage from '../pages/actionPlanServiceUserInvolvementPage'

test.describe('Action Plan Service User Involvement Page', () => {
  const caseReference = 'AB1234CD'

  const actionPlanSummary: ActionPlanSummaryDto = {
    lastUpdatedAt: '2026-10-12T09:00:00Z',
    personDetails: {
      firstName: 'Alex',
      lastName: 'River',
    },
    needs: [],
  }

  const buildPersonInvolvement = (
    savedResponses: Array<{ value: string; additionalDetails: string | null }> = [],
  ): ActionPlanSessionDeliveryDetailsResponse => ({
    questions: [
      {
        id: randomUUID(),
        displayOrder: 1,
        label: 'Was Alex involved in creating the action plan?',
        key: 'USER_INVOLVEMENT_IN_ACTION_PLAN',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Why was Alex not involved?',
            additionalDetailsHint: null,
          },
        ],
        savedResponses,
      },
    ],
  })

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays the question and choices with nothing selected', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(caseReference, buildPersonInvolvement())

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await expect(involvementPage.header).toHaveText('Was Alex involved in creating the action plan?')
    await expect(page.getByText('Select one option.')).toBeVisible()
    await expect(involvementPage.yesRadio).not.toBeChecked()
    await expect(involvementPage.noRadio).not.toBeChecked()
  })

  test('displays the saved NO answer with the saved details', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(
      caseReference,
      buildPersonInvolvement([{ value: 'NO', additionalDetails: 'They were unavailable' }]),
    )

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await expect(involvementPage.noRadio).toBeChecked()
    await expect(involvementPage.whyNotInvolvedTextBox).toBeVisible()
    await expect(involvementPage.whyNotInvolvedTextBox).toHaveValue('They were unavailable')
  })

  test('displays the saved YES answer', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(
      caseReference,
      buildPersonInvolvement([{ value: 'YES', additionalDetails: null }]),
    )

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await expect(involvementPage.yesRadio).toBeChecked()
    await expect(involvementPage.whyNotInvolvedTextBox).toBeHidden()
  })

  test('reveals the why not involved textarea when NO is selected', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(caseReference, buildPersonInvolvement())

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await expect(involvementPage.whyNotInvolvedTextBox).toBeHidden()
    await involvementPage.noRadio.check()
    await expect(involvementPage.whyNotInvolvedTextBox).toBeVisible()
    await expect(page.getByText('Why was Alex not involved?')).toBeVisible()
  })

  test('accepts YES without showing a validation error', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(caseReference, buildPersonInvolvement())
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await involvementPage.yesRadio.check()
    await involvementPage.continueButton.click()

    await expect(page.locator('.govuk-error-summary')).toHaveCount(0)
  })

  test('accepts NO with details without showing a validation error', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(caseReference, buildPersonInvolvement())
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await involvementPage.noRadio.check()
    await involvementPage.whyNotInvolvedTextBox.fill('They were unavailable')
    await involvementPage.continueButton.click()

    await expect(page.locator('.govuk-error-summary')).toHaveCount(0)
  })

  test('shows a validation error when no option is selected', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(caseReference, buildPersonInvolvement())
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await involvementPage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanServiceUserInvolvementPage.url(caseReference))
    await expect(page.locator('#USER_INVOLVEMENT_IN_ACTION_PLAN-error')).toContainText(
      'Select yes if Alex was involved in creating the action plan',
    )
  })

  test('shows a validation error when NO is selected without details and keeps the selection', async ({ page }) => {
    await communitySupport.stubGetPersonInvolvement(caseReference, buildPersonInvolvement())
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(ActionPlanServiceUserInvolvementPage.url(caseReference))
    const involvementPage = await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await involvementPage.noRadio.check()
    await involvementPage.continueButton.click()

    await expect(page.locator('#WHY_NOT_INVOLVED-error')).toContainText(
      'Enter details about why Alex was not involved in creating the action plan',
    )
    await expect(involvementPage.noRadio).toBeChecked()
  })
})

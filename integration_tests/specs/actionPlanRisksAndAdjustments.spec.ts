import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { ActionPlanSessionDeliveryDetailsResponse, ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanRisksAndAdjustmentsPage from '../pages/actionPlanRisksAndAdjustmentsPage'
import ActionPlanPage from '../pages/actionPlanPage'

test.describe('Action Plan Risks and Adjustments Page', () => {
  const caseReference = 'AB1234CD'

  const actionPlanSummary: ActionPlanSummaryDto = {
    personDetails: {
      firstName: 'Alex',
      lastName: 'River',
    },
    needs: [],
  }

  const risksAndAdjustments: ActionPlanSessionDeliveryDetailsResponse = {
    questions: [
      {
        id: randomUUID(),
        displayOrder: 1,
        label: 'Is there a risk associated with the planned activities?',
        key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Give details of the risk',
            additionalDetailsHint: null,
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [{ value: 'YES', additionalDetails: 'Risk of harm to staff' }],
      },
      {
        id: randomUUID(),
        displayOrder: 2,
        label: 'Will you put reasonable adjustments in place?',
        key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Give details of the adjustments',
            additionalDetailsHint: null,
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [{ value: 'NO', additionalDetails: null }],
      },
    ],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays risk and adjustment questions with saved answers', async ({ page }) => {
    await communitySupport.stubGetRisksAndAdjustments(caseReference, risksAndAdjustments)

    await page.goto(ActionPlanRisksAndAdjustmentsPage.url(caseReference))

    const risksAndAdjustmentsPage = await ActionPlanRisksAndAdjustmentsPage.verifyOnPage(page)

    await expect(risksAndAdjustmentsPage.header).toHaveText('Risks and adjustments')
    await expect(page.getByRole('radio', { name: 'Yes', exact: true }).first()).toBeChecked()
    await expect(page.locator('#RISK_INFO')).toHaveValue('Risk of harm to staff')
    await expect(page.getByRole('radio', { name: 'No', exact: true }).last()).toBeChecked()
  })

  test('submits answers and redirects to the action plan page', async ({ page }) => {
    await communitySupport.stubGetRisksAndAdjustments(caseReference, risksAndAdjustments)
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)

    await page.goto(ActionPlanRisksAndAdjustmentsPage.url(caseReference))
    const risksAndAdjustmentsPage = await ActionPlanRisksAndAdjustmentsPage.verifyOnPage(page)

    await page.getByRole('radio', { name: 'Yes', exact: true }).first().check()
    await page.locator('#RISK_INFO').fill('Risk of harm to staff')
    await page.getByRole('radio', { name: 'No', exact: true }).last().check()

    await risksAndAdjustmentsPage.continueButton.click()

    await ActionPlanPage.verifyOnPage(page)
    await expect(page).toHaveURL(ActionPlanPage.url(caseReference))
  })
})

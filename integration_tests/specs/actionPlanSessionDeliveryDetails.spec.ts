import { test, expect } from '@playwright/test'
import { ActionPlanSessionDeliveryDetailsResponse, ActionPlanSummaryDto } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { actionPlanSessionDeliveryDetailsFactory } from '../../server/testutils/factories/ActionPlanSessionDeliveryDetailsResponse'
import ActionPlanSessionDeliveryDetailsPage from '../pages/actionPlanSessionDeliveryDetailsPage'
import ActionPlanPage from '../pages/actionPlanPage'
import buildReferralProgress from '../../server/testutils/buildReferralProgress'

test.describe('Action Plan Session Delivery Details Page', () => {
  const caseReference = 'AB1234CD'
  const emptySessionDeliveryDetails = {
    ...sessionDeliveryDetails,
    questions: sessionDeliveryDetails.questions.map(question => ({ ...question, savedResponses: [] })),
  }
  const actionPlanSummary: ActionPlanSummaryDto = {
    lastUpdatedAt: '2026-10-12T09:00:00Z',
    personDetails: { firstName: 'Alex', lastName: 'River' },
    needs: [],
  }
  const risksAndAdjustments: ActionPlanSessionDeliveryDetailsResponse = {
    questions: [
      {
        id: '44444444-4444-4444-4444-444444444444',
        displayOrder: 1,
        label: 'Is there a risk associated with the planned activities?',
        key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
        hint: null,
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
        savedResponses: [],
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        displayOrder: 2,
        label: 'Will you put reasonable adjustments in place?',
        key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
        hint: null,
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
        savedResponses: [],
      },
    ],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays session delivery questions, hints and saved answers', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, actionPlanSessionDeliveryDetailsFactory.build())

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))

    const sessionDeliveryDetailsPage = await ActionPlanSessionDeliveryDetailsPage.verifyOnPage(page)

    await expect(sessionDeliveryDetailsPage.header).toHaveText('Session details')
    await expect(page.getByLabel('How often will sessions take place?')).toHaveValue('Every week')
    await expect(page.getByLabel('How often will sessions take place?')).toHaveJSProperty('tagName', 'TEXTAREA')
    await expect(page.getByText('For example, every week, every 2 weeks, every month.')).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Video call' })).toBeChecked()
    await expect(page.locator('#VIDEO_CALL')).toHaveValue('Travel restrictions')
    await expect(page.getByRole('checkbox', { name: 'Group session' })).toBeChecked()
  })

  test('returns to the Action plan page when Back is selected', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, sessionDeliveryDetails)
    await communitySupport.stubGetActionPlanSummary(caseReference, actionPlanSummary)
    await communitySupport.stubGetReferralProgress(buildReferralProgress([]), caseReference)

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))
    await page.getByRole('link', { name: 'Back', exact: true }).click()

    const actionPlanPage = await ActionPlanPage.verifyOnPage(page)
    await expect(actionPlanPage.header).toHaveText('Action plan')
    await expect(page).toHaveURL(ActionPlanPage.url(caseReference))
  })

  test('offers the delivery methods as exclusive radios and allows both session formats', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, emptySessionDeliveryDetails)

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))

    const inPerson = page.getByRole('radio', { name: 'In person' })
    const phoneCall = page.getByRole('radio', { name: 'Phone call' })
    const videoCall = page.getByRole('radio', { name: 'Video call' })
    await expect(inPerson).toBeVisible()
    await expect(phoneCall).toBeVisible()
    await expect(videoCall).toBeVisible()
    await inPerson.check()
    await phoneCall.check()
    await expect(phoneCall).toBeChecked()
    await expect(inPerson).not.toBeChecked()
    await expect(videoCall).not.toBeChecked()

    const oneToOne = page.getByRole('checkbox', { name: 'One-to-one session' })
    const group = page.getByRole('checkbox', { name: 'Group session' })
    await oneToOne.check()
    await group.check()
    await expect(oneToOne).toBeChecked()
    await expect(group).toBeChecked()
  })

  test('shows required errors when frequency, delivery method and format are missing', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, emptySessionDeliveryDetails)

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Enter how often sessions will take place').first()).toBeVisible()
    await expect(page.getByText('Select how the sessions will take place').first()).toBeVisible()
    await expect(page.getByText('Select what format you will use for the sessions').first()).toBeVisible()
  })

  ;['Phone call', 'Video call'].forEach(method => {
    test(`requires a reason for ${method} delivery`, async ({ page }) => {
      await communitySupport.stubGetSessionDeliveryDetails(caseReference, emptySessionDeliveryDetails)

      await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))
      await page.getByLabel('How often will sessions take place?').fill('Every week')
      await page.getByRole('radio', { name: method }).check()
      await page.getByRole('checkbox', { name: 'One-to-one session' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(page.getByText('Enter why the sessions are not in person').first()).toBeVisible()
    })
  })

  test('rejects session frequency longer than 65000 characters', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, emptySessionDeliveryDetails)

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))
    await page.getByLabel('How often will sessions take place?').fill('x'.repeat(65001))
    await page.getByRole('radio', { name: 'In person' }).check()
    await page.getByRole('checkbox', { name: 'One-to-one session' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#SESSION_FREQUENCY-error')).toContainText(
      'Details about session frequency must be 65000 characters or less',
    )
  })

  test('continues to Risks and adjustments when all required answers are valid', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, emptySessionDeliveryDetails)
    await communitySupport.stubGetRisksAndAdjustments(caseReference, risksAndAdjustments)

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))
    await page.getByLabel('How often will sessions take place?').fill('Every week')
    await page.getByRole('radio', { name: 'In person' }).check()
    await page.getByRole('checkbox', { name: 'One-to-one session' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/risks-and-adjustments`)
    await expect(page.getByRole('heading', { name: 'Risks and adjustments' })).toBeVisible()
  })
})

import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanSessionDeliveryDetailsPage from '../pages/actionPlanSessionDeliveryDetailsPage'

import { sessionDeliveryAdditionalDetailsFieldName } from '../../server/referral/actionPlan/sessionDeliveryDetails/fieldNames'

test.describe('Action Plan Session Delivery Details Page', () => {
  const caseReference = 'AB1234CD'

  const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
    questions: [
      {
        id: randomUUID(),
        displayOrder: 1,
        label: 'How often will sessions take place?',
        hint: 'For example, every week, every 2 weeks, every month.',
        answerType: 'TEXTAREA',
        maximumNumberOfResponses: 1,
        choices: null,
        savedResponses: [{ value: 'Every week', additionalDetails: null }],
      },
      {
        id: randomUUID(),
        displayOrder: 2,
        label: 'How will the sessions take place?',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'IN_PERSON',
            label: 'In person',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Reason for not being in person',
            additionalDetailsHint: 'Why are the sessions not in person?',
          },
          {
            value: 'VIDEO_CALL',
            label: 'Video call',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Reason for not being in person',
            additionalDetailsHint: 'Why are the sessions not in person?',
          },
          {
            value: 'PHONE_CALL',
            label: 'Phone call',
            displayOrder: 3,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Reason for not being in person',
            additionalDetailsHint: 'Why are the sessions not in person?',
          },
        ],
        savedResponses: [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
      },
      {
        id: randomUUID(),
        displayOrder: 3,
        label: 'What format will you use for the sessions?',
        hint: 'Select all that apply.',
        answerType: 'CHECKBOX',
        maximumNumberOfResponses: 2,
        choices: [
          {
            value: 'ONE_TO_ONE_SESSION',
            label: 'One-to-one session',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
          {
            value: 'GROUP_SESSION',
            label: 'Group session',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [{ value: 'GROUP_SESSION', additionalDetails: null }],
      },
    ],
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays session delivery questions, hints and saved answers', async ({ page }) => {
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, sessionDeliveryDetails)

    await page.goto(ActionPlanSessionDeliveryDetailsPage.url(caseReference))

    const sessionDeliveryDetailsPage = await ActionPlanSessionDeliveryDetailsPage.verifyOnPage(page)

    await expect(sessionDeliveryDetailsPage.header).toHaveText('Session delivery details')
    await expect(page.getByLabel('How often will sessions take place?')).toHaveValue('Every week')
    await expect(page.getByText('For example, every week, every 2 weeks, every month.')).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Video call' })).toBeChecked()
    await expect(
      page.locator(`#${sessionDeliveryAdditionalDetailsFieldName(sessionDeliveryDetails.questions[1].id, 2)}`),
    ).toHaveValue('Travel restrictions')
    await expect(page.getByRole('checkbox', { name: 'Group session' })).toBeChecked()
  })
})

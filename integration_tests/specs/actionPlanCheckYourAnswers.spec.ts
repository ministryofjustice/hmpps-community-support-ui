import { test, expect } from '@playwright/test'
import { addDays, format } from 'date-fns'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanCheckYourAnswersPage from '../pages/actionPlanCheckYourAnswersPage'
import ActionPlanCheckServiceEndDatePage from '../pages/actionPlanCheckServiceEndDatePage'
import ActionPlanChangeServiceEndDatePage from '../pages/actionPlanChangeServiceEndDatePage'
import ActionPlanServiceUserInvolvementPage from '../pages/actionPlanServiceUserInvolvementPage'
import {
  actionPlanSessionDeliveryDetailsFactory,
  actionPlanRisksAndAdjustmentsFactory,
  actionPlanPersonInvolvementFactory,
  actionPlanCheckServiceEndDateFactory,
  actionPlanUpdateServiceEndDateFactory,
} from '../../server/testutils/factories/ActionPlanSessionDeliveryDetailsResponse'

test.describe('Action Plan Check Your Answers Page', () => {
  const caseReference = 'AB1234CD'

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays answers in all sections with all available information', async ({ page }) => {
    const serviceEndDateCheck = actionPlanCheckServiceEndDateFactory.build({}, { transient: { savedAnswer: 'NO' } })
    const updatedServiceEndDate = actionPlanUpdateServiceEndDateFactory.build(
      {},
      { transient: { serviceEndDateChangeReason: 'User requested a change' } },
    )
    const sessionDeliveryCheckYourAnswers: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        ...actionPlanSessionDeliveryDetailsFactory.build().questions,
        ...actionPlanRisksAndAdjustmentsFactory.build().questions,
        ...serviceEndDateCheck.questions,
        ...updatedServiceEndDate.questions,
        ...actionPlanPersonInvolvementFactory.build().questions,
      ],
    }

    await communitySupport.stubGetSessionDeliveryCheckYourAnswers(caseReference, sessionDeliveryCheckYourAnswers, true)
    await communitySupport.stubGetCheckServiceEndDate(caseReference, serviceEndDateCheck)
    await communitySupport.stubGetUpdateServiceEndDate(caseReference, updatedServiceEndDate)

    await page.goto(ActionPlanCheckServiceEndDatePage.url(caseReference))
    const checkServiceEndDatePage = await ActionPlanCheckServiceEndDatePage.verifyOnPage(page)
    await page.getByRole('radio', { name: 'No', exact: true }).check()
    await checkServiceEndDatePage.continueButton.click()
    await expect(page).toHaveURL(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)

    await page.goto(ActionPlanCheckYourAnswersPage.url(caseReference))
    const checkYourAnswersPage = await ActionPlanCheckYourAnswersPage.verifyOnPage(page)

    await expect(checkYourAnswersPage.header).toHaveText('Check service delivery details')
    await expect(checkYourAnswersPage.backLink).toHaveAttribute(
      'href',
      `/referral/${caseReference}/action-plan/person-involvement`,
    )

    await expect(checkYourAnswersPage.summaryCard('Session details')).toBeVisible()
    await expect(checkYourAnswersPage.summaryRow('How often will sessions take place?')).toContainText('Every week')
    await expect(checkYourAnswersPage.summaryRow('How will the sessions take place?')).toContainText('Video call')
    await expect(checkYourAnswersPage.summaryRow('Why are the sessions not in person?')).toContainText(
      'Travel restrictions',
    )
    await expect(checkYourAnswersPage.summaryRow('What format will you use for the sessions?')).toContainText(
      'Group session',
    )

    await expect(checkYourAnswersPage.summaryCard('Risks and adjustments')).toBeVisible()
    await expect(
      checkYourAnswersPage.summaryRow('Are there any risks associated with the planned activities?'),
    ).toContainText('Yes')
    await expect(
      checkYourAnswersPage.summaryRow('Details about the risks and what you will put in place to reduce them'),
    ).toContainText('Risk of harm to staff')
    await expect(
      checkYourAnswersPage.summaryRow(
        'Will you put any reasonable adjustments in place to help Alex take part in the planned activities?',
      ),
    ).toContainText('Yes')
    await expect(
      checkYourAnswersPage.summaryRow('Details about the risks and what you will put in place to reduce them'),
    ).toContainText('Risk of harm to staff')
    await expect(
      checkYourAnswersPage.summaryRow(
        'Details about what reasonable adjustments you will make and how this will support Alex',
      ),
    ).toContainText('Step-free access')

    await expect(checkYourAnswersPage.summaryCard('Service end date')).toBeVisible()
    await expect(checkYourAnswersPage.summaryRow('Is the service end date still 24 May 2026?')).toContainText('No')
    await expect(checkYourAnswersPage.summaryRow('What is the new service end date?')).toContainText(
      format(addDays(new Date(), 10), 'd MMMM yyyy'),
    )
    await expect(checkYourAnswersPage.summaryRow('Why are you changing the service end date?')).toContainText(
      'User requested a change',
    )

    await expect(checkYourAnswersPage.summaryCard('Involvement in creating action plan')).toBeVisible()
    await expect(checkYourAnswersPage.summaryRow('Was Alex involved in creating the action plan?')).toContainText('No')
    await expect(checkYourAnswersPage.summaryRow('Why was Alex not involved?')).toContainText('User was sick')

    await expect(
      checkYourAnswersPage.summaryCard('Session details').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/session-delivery-details`)
    await expect(
      checkYourAnswersPage.summaryCard('Risks and adjustments').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/risks-and-adjustments`)
    await expect(
      checkYourAnswersPage.summaryCard('Service end date').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/service-end-date-check`)
    await expect(
      checkYourAnswersPage.summaryCard('Involvement in creating action plan').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/person-involvement`)
    await expect(checkYourAnswersPage.submitButton).toBeVisible()
  })

  test('displays answers in all sections with most optional information being hidden', async ({ page }) => {
    const serviceEndDateCheck = actionPlanCheckServiceEndDateFactory.build({}, { transient: { savedAnswer: 'YES' } })
    const sessionDeliveryDetails = actionPlanSessionDeliveryDetailsFactory.build(
      {},
      { transient: { sessionDeliveryMethod: [{ value: 'IN_PERSON', additionalDetails: null }] } },
    )
    const risksAndAdjustments = actionPlanRisksAndAdjustmentsFactory.build(
      {},
      {
        transient: {
          risks: [{ value: 'NO', additionalDetails: null }],
          reasonableAdjustments: [{ value: 'NO', additionalDetails: null }],
        },
      },
    )
    const personInvolvement = actionPlanPersonInvolvementFactory.build(
      {},
      { transient: { savedResponses: [{ value: 'YES', additionalDetails: null }] } },
    )
    const sessionDeliveryCheckYourAnswers: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        ...sessionDeliveryDetails.questions,
        ...risksAndAdjustments.questions,
        ...serviceEndDateCheck.questions,
        ...personInvolvement.questions,
      ],
    }

    await communitySupport.stubGetSessionDeliveryCheckYourAnswers(caseReference, sessionDeliveryCheckYourAnswers, false)
    await communitySupport.stubGetCheckServiceEndDate(caseReference, serviceEndDateCheck)
    await communitySupport.stubGetPersonInvolvement(caseReference, personInvolvement)

    await page.goto(ActionPlanCheckServiceEndDatePage.url(caseReference))
    const checkServiceEndDatePage = await ActionPlanCheckServiceEndDatePage.verifyOnPage(page)
    await page.getByRole('radio', { name: 'Yes', exact: true }).check()
    await checkServiceEndDatePage.continueButton.click()
    await expect(page).toHaveURL(ActionPlanServiceUserInvolvementPage.url(caseReference))
    await ActionPlanServiceUserInvolvementPage.verifyOnPage(page)

    await page.goto(ActionPlanCheckYourAnswersPage.url(caseReference))
    const checkYourAnswersPage = await ActionPlanCheckYourAnswersPage.verifyOnPage(page)

    await expect(checkYourAnswersPage.header).toHaveText('Check service delivery details')
    await expect(checkYourAnswersPage.backLink).toHaveAttribute(
      'href',
      `/referral/${caseReference}/action-plan/person-involvement`,
    )

    await expect(checkYourAnswersPage.summaryCard('Session details')).toBeVisible()
    await expect(checkYourAnswersPage.summaryRow('How often will sessions take place?')).toContainText('Every week')
    await expect(checkYourAnswersPage.summaryRow('How will the sessions take place?')).toContainText('In person')
    await expect(checkYourAnswersPage.summaryRow('Why are the sessions not in person?')).toHaveCount(0)
    await expect(checkYourAnswersPage.summaryRow('What format will you use for the sessions?')).toContainText(
      'Group session',
    )

    await expect(checkYourAnswersPage.summaryCard('Risks and adjustments')).toBeVisible()
    await expect(
      checkYourAnswersPage.summaryRow('Are there any risks associated with the planned activities?'),
    ).toContainText('No')
    await expect(
      checkYourAnswersPage.summaryRow('Details about the risks and what you will put in place to reduce them'),
    ).toHaveCount(0)
    await expect(
      checkYourAnswersPage.summaryRow(
        'Will you put any reasonable adjustments in place to help Alex take part in the planned activities?',
      ),
    ).toContainText('No')
    await expect(
      checkYourAnswersPage.summaryRow(
        'Details about what reasonable adjustments you will make and how this will support Alex',
      ),
    ).toHaveCount(0)

    await expect(checkYourAnswersPage.summaryCard('Service end date')).toBeVisible()
    await expect(checkYourAnswersPage.summaryRow('Is the service end date still 24 May 2026?')).toContainText('Yes')
    await expect(checkYourAnswersPage.summaryRow('What is the new service end date?')).toHaveCount(0)
    await expect(checkYourAnswersPage.summaryRow('Why are you changing the service end date?')).toHaveCount(0)

    await expect(checkYourAnswersPage.summaryCard('Involvement in creating action plan')).toBeVisible()
    await expect(checkYourAnswersPage.summaryRow('Was Alex involved in creating the action plan?')).toContainText('Yes')
    await expect(checkYourAnswersPage.summaryRow('Why was Alex not involved?')).toHaveCount(0)

    await expect(
      checkYourAnswersPage.summaryCard('Session details').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/session-delivery-details`)
    await expect(
      checkYourAnswersPage.summaryCard('Risks and adjustments').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/risks-and-adjustments`)
    await expect(
      checkYourAnswersPage.summaryCard('Service end date').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/service-end-date-check`)
    await expect(
      checkYourAnswersPage.summaryCard('Involvement in creating action plan').getByRole('link', { name: /Change/ }),
    ).toHaveAttribute('href', `/referral/${caseReference}/action-plan/person-involvement`)
    await expect(checkYourAnswersPage.submitButton).toBeVisible()
  })
})

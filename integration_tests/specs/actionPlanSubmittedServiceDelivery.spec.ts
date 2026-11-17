import { test, expect } from '@playwright/test'
import { addDays, format } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { getMatchingRequests } from '../mockApis/wiremock'
import {
  actionPlanCheckServiceEndDateFactory,
  actionPlanUpdateServiceEndDateFactory,
  actionPlanSessionDeliveryDetailsFactory,
} from '../../server/testutils/factories/ActionPlanSessionDeliveryDetailsResponse'

test.describe('Submitted action plan service delivery edits', () => {
  const caseReference = 'AB1234CD'
  const serviceDeliveryUrl = `/referral/${caseReference}/service-delivery`
  const patchUrl = `/community-support/referral/${caseReference}/action-plan/session-delivery-details`

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetActionPlanSummary(caseReference, {
      personDetails: { firstName: 'Alex', lastName: 'River' },
      needs: [],
      lastUpdatedAt: '',
      isSubmitted: true,
    })
    await communitySupport.stubGetSessionDeliveryCheckYourAnswers(caseReference, { questions: [] }, false)
    await communitySupport.stubGetSessionDeliveryCheckYourAnswers(caseReference, { questions: [] }, true)
    await communitySupport.stubSubmitServiceDelivery(caseReference, { questions: [] })
    await page.goto('/')
    await login(page)
  })

  test.afterEach(async () => {
    const submissions = await getMatchingRequests({
      method: 'POST',
      url: `/community-support/referral/${caseReference}/action-plan`,
    })
    expect(submissions.body.requests).toHaveLength(0)
  })

  test('saves session details directly and returns to service details', async ({ page }) => {
    const details = actionPlanSessionDeliveryDetailsFactory.build()
    await communitySupport.stubGetSessionDeliveryDetails(caseReference, details)
    await page.goto(`/referral/${caseReference}/action-plan/change-session-delivery-details`)

    await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', serviceDeliveryUrl)
    await page.getByLabel('How often will sessions take place?').fill('Every fortnight')
    await page.getByRole('button', { name: 'Save and continue', exact: true }).click()

    await expect(page).toHaveURL(serviceDeliveryUrl)
    const requests = await getMatchingRequests({ method: 'PATCH', url: patchUrl })
    expect(requests.body.requests).toHaveLength(1)
    const request = JSON.parse(requests.body.requests[0].body)
    expect(request.answers).toHaveLength(details.questions.length)
    expect(request.answers).toContainEqual({
      questionId: details.questions[0].id,
      incomingAnswerDetails: [{ value: 'Every fortnight' }],
    })
  })

  test('saves only the confirmation when keeping the current service end date', async ({ page }) => {
    const check = actionPlanCheckServiceEndDateFactory.build()
    await communitySupport.stubGetCheckServiceEndDate(caseReference, check)
    await page.goto(`/referral/${caseReference}/action-plan/change-service-end-date-check`)
    await page.getByRole('radio', { name: 'Yes', exact: true }).check()
    await page.getByRole('button', { name: 'Save and continue', exact: true }).click()

    await expect(page).toHaveURL(serviceDeliveryUrl)
    const requests = await getMatchingRequests({ method: 'PATCH', url: patchUrl })
    expect(requests.body.requests).toHaveLength(1)
    expect(JSON.parse(requests.body.requests[0].body)).toEqual({
      answers: [{ questionId: check.questions[0].id, incomingAnswerDetails: [{ value: 'YES' }] }],
    })
  })

  test('saves the confirmation, new date and reason together after completing both pages', async ({ page }) => {
    const check = actionPlanCheckServiceEndDateFactory.build()
    const update = actionPlanUpdateServiceEndDateFactory.build()
    const newDate = addDays(new Date(), 10)
    await communitySupport.stubGetCheckServiceEndDate(caseReference, check)
    await communitySupport.stubGetUpdateServiceEndDate(caseReference, update)
    const checkUrl = `/referral/${caseReference}/action-plan/change-service-end-date-check`
    await page.goto(checkUrl)
    await page.getByRole('radio', { name: 'No', exact: true }).check()
    await page.getByRole('button', { name: /Continue/i }).click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/change-update-service-end-date`)
    const beforeSave = await getMatchingRequests({ method: 'PATCH', url: patchUrl })
    expect(beforeSave.body.requests).toHaveLength(0)
    await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', checkUrl)
    await page.getByLabel('Day', { exact: true }).fill(format(newDate, 'd'))
    await page.getByLabel('Month', { exact: true }).fill(format(newDate, 'M'))
    await page.getByLabel('Year', { exact: true }).fill(format(newDate, 'yyyy'))
    await page.getByLabel('Why are you changing the service end date?').fill('More time needed')
    await page.getByRole('button', { name: 'Save and continue', exact: true }).click()

    await expect(page).toHaveURL(serviceDeliveryUrl)
    const requests = await getMatchingRequests({ method: 'PATCH', url: patchUrl })
    expect(requests.body.requests).toHaveLength(1)
    expect(JSON.parse(requests.body.requests[0].body)).toEqual({
      answers: [
        { questionId: check.questions[0].id, incomingAnswerDetails: [{ value: 'NO' }] },
        { questionId: update.questions[0].id, incomingAnswerDetails: [{ value: format(newDate, 'yyyy-MM-dd') }] },
        { questionId: update.questions[1].id, incomingAnswerDetails: [{ value: 'More time needed' }] },
      ],
    })
  })
})

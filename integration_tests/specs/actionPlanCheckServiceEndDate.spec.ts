import { test, expect } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanCheckServiceEndDatePage from '../pages/actionPlanCheckServiceEndDatePage'
import {
  serviceEndDateUnchangedResponse,
  serviceEndDateChangedResponse,
  serviceEndDateEmptyResponse,
} from '../../server/testutils/factories/ActionPlanSessionDeliveryDetailsResponse'

test.describe('Action Plan Check Service End Date Page', () => {
  const caseReference = 'AB1234CD'

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays the service end date check page with the saved unchanged answer', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, serviceEndDateUnchangedResponse)

    await page.goto(ActionPlanCheckServiceEndDatePage.url(caseReference))

    const checkServiceEndDatePage = await ActionPlanCheckServiceEndDatePage.verifyOnPage(page)

    await expect(checkServiceEndDatePage.header).toHaveText('Service end date')
    await expect(page.getByText('This referral states the service should be completed by 24 May 2026')).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Yes', exact: true })).toBeChecked()
  })

  test('submits when the service end date is unchanged and redirects to person involvement', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, serviceEndDateUnchangedResponse)

    await page.goto(ActionPlanCheckServiceEndDatePage.url(caseReference))
    await ActionPlanCheckServiceEndDatePage.verifyOnPage(page)

    await page.getByRole('radio', { name: 'Yes', exact: true }).check()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/person-involvement`)
  })

  test('displays the service end date check page with the saved changed answer', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, serviceEndDateChangedResponse)

    await page.goto(ActionPlanCheckServiceEndDatePage.url(caseReference))

    const checkServiceEndDatePage = await ActionPlanCheckServiceEndDatePage.verifyOnPage(page)

    await expect(checkServiceEndDatePage.header).toHaveText('Service end date')
    await expect(page.getByRole('radio', { name: 'No, I need to change the date', exact: true })).toBeChecked()
  })

  test('submits when the service end date has changed and redirects to update service end date', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, serviceEndDateChangedResponse)

    await page.goto(ActionPlanCheckServiceEndDatePage.url(caseReference))
    await ActionPlanCheckServiceEndDatePage.verifyOnPage(page)

    await page.getByRole('radio', { name: 'No, I need to change the date', exact: true }).check()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/update-service-end-date`)
  })

  test('shows a validation error when no radio option is selected', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, serviceEndDateEmptyResponse)

    await page.goto(ActionPlanCheckServiceEndDatePage.url(caseReference))
    await ActionPlanCheckServiceEndDatePage.verifyOnPage(page)

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/service-end-date-check`)
    await expect(page.locator('#SERVICE_END_DATE_CHECK-error')).toContainText(
      'Select yes if the service end date is still 24 May 2026',
    )
  })
})

import { test, expect } from '@playwright/test'
import { addDays, addYears, subDays } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ActionPlanChangeServiceEndDatePage from '../pages/actionPlanChangeServiceEndDatePage'
import {
  updateServiceEndDateResponse,
  updateServiceEndDateEmptyResponse,
} from '../../server/testutils/factories/ActionPlanSessionDeliveryDetailsResponse'
import dateFormat from '../../server/utils/dateFormat'

test.describe('Action Plan Change Service End Date Page', () => {
  const caseReference = 'AB1234CD'

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('displays the split date inputs and saved values', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))

    const actionPlanChangeServiceEndDatePage = await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)

    await expect(actionPlanChangeServiceEndDatePage.header).toHaveText('Change the service end date')
    await expect(actionPlanChangeServiceEndDatePage.dayInput).toHaveValue('24')
    await expect(actionPlanChangeServiceEndDatePage.monthInput).toHaveValue('06')
    await expect(actionPlanChangeServiceEndDatePage.yearInput).toHaveValue('2026')
    await expect(actionPlanChangeServiceEndDatePage.reasonInput).toHaveValue('Some reasons')
  })

  test('submits a valid split-date and reason and redirects to person involvement', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)

    const today = new Date()
    const inputDate = addDays(today, 10)

    await page.getByLabel('Day').fill(String(inputDate.getDate()))
    await page.getByLabel('Month').fill(String(inputDate.getMonth() + 1))
    await page.getByLabel('Year').fill(String(inputDate.getFullYear()))
    await page.getByLabel('Why are you changing the service end date?').fill('Updated to match the new plan')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(`/referral/${caseReference}/action-plan/person-involvement`)
  })

  test('shows an error when no date is entered', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateEmptyResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))
    const actionPlanChangeServiceEndDatePage = await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)

    await actionPlanChangeServiceEndDatePage.reasonInput.fill('Updated to match the new plan')
    await actionPlanChangeServiceEndDatePage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await expect(actionPlanChangeServiceEndDatePage.errorMessages).toContainText('Enter the new service end date')
  })

  test('shows an error when the date is invalid', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))
    const actionPlanChangeServiceEndDatePage = await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)

    await actionPlanChangeServiceEndDatePage.dayInput.fill('31')
    await actionPlanChangeServiceEndDatePage.monthInput.fill('2')
    await actionPlanChangeServiceEndDatePage.yearInput.fill('2027')
    await actionPlanChangeServiceEndDatePage.reasonInput.fill('Updated to match the new plan')
    await actionPlanChangeServiceEndDatePage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await expect(actionPlanChangeServiceEndDatePage.errorMessages).toContainText('Enter a date in the correct format')
  })

  test('shows an error when one date field is missing', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))
    const actionPlanChangeServiceEndDatePage = await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)

    await actionPlanChangeServiceEndDatePage.dayInput.fill('19')
    await actionPlanChangeServiceEndDatePage.monthInput.fill('')
    await actionPlanChangeServiceEndDatePage.reasonInput.fill('Updated to match the new plan')
    await actionPlanChangeServiceEndDatePage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await expect(actionPlanChangeServiceEndDatePage.errorMessages).toContainText(
      'The new service end date must include month',
    )
  })

  test('shows an error when two date fields are missing', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))
    const actionPlanChangeServiceEndDatePage = await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)

    await actionPlanChangeServiceEndDatePage.dayInput.fill('19')
    await actionPlanChangeServiceEndDatePage.monthInput.fill('')
    await actionPlanChangeServiceEndDatePage.yearInput.fill('')
    await actionPlanChangeServiceEndDatePage.reasonInput.fill('Updated reasons')
    await actionPlanChangeServiceEndDatePage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await expect(actionPlanChangeServiceEndDatePage.errorMessages).toContainText(
      'The new service end date must include month and year',
    )
  })

  test('shows an error when a past date is entered', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))
    const actionPlanChangeServiceEndDatePage = await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)
    const yesterday = subDays(new Date(), 1)

    await actionPlanChangeServiceEndDatePage.dayInput.fill(String(yesterday.getDate()))
    await actionPlanChangeServiceEndDatePage.monthInput.fill(String(yesterday.getMonth() + 1))
    await actionPlanChangeServiceEndDatePage.yearInput.fill(String(yesterday.getFullYear()))
    await actionPlanChangeServiceEndDatePage.reasonInput.fill('Updated reasons')
    await actionPlanChangeServiceEndDatePage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await expect(actionPlanChangeServiceEndDatePage.errorMessages).toContainText(
      'The new service end date must be in the future',
    )
  })

  test('shows an error when the date is more than 10 years in the future', async ({ page }) => {
    await communitySupport.stubGetCheckServiceEndDate(caseReference, updateServiceEndDateResponse)

    await page.goto(ActionPlanChangeServiceEndDatePage.url(caseReference))
    const actionPlanChangeServiceEndDatePage = await ActionPlanChangeServiceEndDatePage.verifyOnPage(page)
    const tooFarInFuture = addDays(addYears(new Date(), 10), 1)
    const maxDate = addYears(addDays(new Date(), -1), 10)

    await actionPlanChangeServiceEndDatePage.dayInput.fill(String(tooFarInFuture.getDate()))
    await actionPlanChangeServiceEndDatePage.monthInput.fill(String(tooFarInFuture.getMonth() + 1))
    await actionPlanChangeServiceEndDatePage.yearInput.fill(String(tooFarInFuture.getFullYear()))
    await actionPlanChangeServiceEndDatePage.reasonInput.fill('Updated reasons')
    await actionPlanChangeServiceEndDatePage.continueButton.click()

    await expect(page).toHaveURL(ActionPlanChangeServiceEndDatePage.url(caseReference))
    await expect(actionPlanChangeServiceEndDatePage.errorMessages).toContainText(
      `The new service end date must be before ${dateFormat(maxDate)}`,
    )
  })
})

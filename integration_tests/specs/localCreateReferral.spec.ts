import { test, expect } from '@playwright/test'
import ServiceDaysPage from '../pages/ServiceDaysPage'
import OffenceSentencePage from '../pages/OffenceSentencePage'
import AdditionalInformationForTheDeliveryPartnerPage from '../pages/AdditionalInformationForTheDeliveryPartnerPage'
import AddContactDetailsPage from '../pages/AddContactDetailsPage'

/**
 * Local-only automation that creates a referral through the real UI against a locally running app (port 3000)
 * and the real local APIs. Run with:
 *
 *   LOCAL_USERNAME=<user> LOCAL_PASSWORD=<password> npx playwright test --project=local
 *
 * Optional: LOCAL_CRN (default X320741), LOCAL_UI_URL (default http://localhost:3000).
 */

const username = process.env.LOCAL_USERNAME
const password = process.env.LOCAL_PASSWORD
const crn = process.env.LOCAL_CRN ?? 'X320741'

const futureDate = () => {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return { day: String(d.getDate()), month: String(d.getMonth() + 1), year: String(d.getFullYear()) }
}

test.describe('Create a referral locally', () => {
  test.skip(!username || !password, 'Set LOCAL_USERNAME and LOCAL_PASSWORD to run this automation')

  test('creates and submits a referral', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000)

    await test.step('sign in via local auth', async () => {
      await page.goto('/')
      await page.locator('#username').fill(username!)
      await page.locator('#password').fill(password!)
      await page.getByRole('button', { name: 'Sign in' }).click()
      await expect(page.getByRole('link', { name: 'Make a referral' })).toBeVisible()
    })

    await test.step('find person and confirm details', async () => {
      await page.getByRole('link', { name: 'Make a referral' }).click()
      await page.locator('#personIdentifier').fill(crn)
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page.getByRole('heading', { name: 'Check and confirm personal details' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
    })

    await test.step('check risk information', async () => {
      await page.getByRole('link', { name: 'Check risk information' }).click()
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
    })

    await test.step('additional support needs: none', async () => {
      await page.getByRole('link', { name: 'Add details of any additional support needs' }).click()
      await page.locator('#AdditionalNeeds-10').check()
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list\/needs-an-interpreter$/)
      await page.locator('[data-testid="needs-interpreter"]').getByLabel('No', { exact: true }).check()
      await page.getByRole('button', { name: 'Save and Continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
    })

    await test.step("select the person's needs", async () => {
      await page.getByRole('link', { name: "Select the person's needs" }).click()
      await page.locator('#personNeedsCheckboxes').check()
      await page.locator('#accommodationInput').fill('Automated test: accommodation need')
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
    })

    await test.step('select the area for the referral', async () => {
      await page.getByRole('link', { name: 'Select the area for the referral' }).click()
      await page.locator('#selectArea-37').check()
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list\/confirm-an-area-for-referral$/)
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
    })

    await test.step('additional referral information: service end date', async () => {
      await page.getByRole('link', { name: 'Additional referral information' }).click()
      const date = futureDate()
      await page.locator('#target_service_completion_date-day').fill(date.day)
      await page.locator('#target_service_completion_date-month').fill(date.month)
      await page.locator('#target_service_completion_date-year').fill(date.year)
      await page.locator('#target_service_completion_reason').fill('Automated test: service completion reason')
      await page.getByRole('button', { name: 'Save and continue' }).click()
      const serviceDays = await ServiceDaysPage.verifyOnPage(page)
      await serviceDays.fillServiceDays('30')
      await serviceDays.clickSaveAndContinue()
      const offence = await OffenceSentencePage.verifyOnPage(page)
      await offence.selectNo()
      await offence.clickSaveAndContinue()
      await expect(page).toHaveURL(/\/referral\/task-list\/additional-information-for-the-delivery-partner$/)
      const deliveryPartner = await AdditionalInformationForTheDeliveryPartnerPage.verifyOnPage(page, 'Alex')
      await deliveryPartner.select('No')
      await deliveryPartner.clickSaveAndContinue()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
      await page.getByRole('link', { name: "Check probation practitioner's details" }).click()
      await page.locator('#detailsCorrect').check()
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
    })

    await test.step('add main point of contact', async () => {
      await page.goto(AddContactDetailsPage.url())
      const contact = await AddContactDetailsPage.verifyOnPage(page)
      await contact.fillForm({
        name: 'Automated Contact',
        emailAddress: 'automated.contact@example.com',
        jobRole: 'Automation tester',
        phoneNumber: '07700900000',
        teamPhoneNumber: '07700900001',
      })
      await page.locator('#pdu-select').selectOption({ index: 1 }, { force: true })
      await page.locator('#probationOffice-select').selectOption({ index: 1 }, { force: true })
      await contact.submit()
      await expect(page).toHaveURL(/\/referral\/new\/confirm-contact-details/)
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await expect(page).toHaveURL(/\/referral\/task-list$/)
    })

    await test.step('check answers and submit', async () => {
      await page.getByRole('link', { name: 'Check answers and submit' }).click()
      await expect(page).toHaveURL(/\/referral\/check-referral-information/)
      await page.getByRole('button', { name: 'Submit referral' }).click()
    })

    await test.step('confirmation', async () => {
      await expect(page.getByRole('heading', { name: 'The referral has been sent' })).toBeVisible()
      const panel = await page.getByText('Your reference number').locator('..').innerText()
      const referenceNumber = panel.replace(/\s+/g, ' ').trim().split(' ').pop() ?? ''
      test.info().annotations.push({ type: 'reference-number', description: referenceNumber })
      // eslint-disable-next-line no-console
      console.log(`\nReferral submitted. Reference number: ${referenceNumber}\n`)
    })
  })
})

import test, { expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AssignPage from '../pages/AssignPage'

/*
  Test log
  - what happen if we fill the first input in the second again and then do the assignment
*/

test.describe('AssignPage', () => {
  const id = randomUUID()
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferralUserAssignments()
    await page.goto('/')
    await login(page)
    await test.step('go to assign page', async () => {
      await page.goto(`/referral/${id}/assign`)
    })
  })

  test('should display the page', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    expect(assignPage.header).toBeVisible()
  })
  // IPB-2010:AC1
  test('Assigning cases headers', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('check content', async () => {
      await expect(assignPage.header).toHaveText('Who do you want to assign this case to?')
      await expect(assignPage.subheader).toHaveText('Caseworker')
    })
  })
  // IPB-2010:AC2 - !!! No back link yet!!!
  test.skip('Back navigation', async () => {
    /*
      Given I’m assigning a specific case to caseworker(s)
      When I select the Back option
      Then I am taken back to the specific case’s referral details screen
      */
  })
  // IPB-2010:AC3
  test('Adding Multiple Caseworkers', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('assign case worker 1', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('test1@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
    })
    await test.step('assign case worker 2', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await assignPage.emailAddressInputs[1].fill('test2@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
    })
    await test.step('assign case worker 3', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
      await assignPage.emailAddressInputs[2].fill('test3@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(4)
    })
    await test.step('assign case worker 4', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(4)
      await assignPage.emailAddressInputs[3].fill('test4@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(5)
    })
    await test.step('assign the last case worker', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(5)
      await assignPage.emailAddressInputs[4].fill('test5@email.com')
      await expect(assignPage.addAnotherCaseWorkerButton).toContainClass('govuk-visually-hidden')
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(5)
    })
  })
  // IPB-2010: what happen if we fill the first input in the second again and then do the assignment
  test('Adding two case workers in the same input', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('assign a case worker', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('test1@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
    })
    await test.step('assign another case worker', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await assignPage.emailAddressInputs[0].fill('test2@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
    })
  })
})

import { expect, test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import FindPersonPage from '../pages/findPersonPage'
import FoundPersonPage from '../pages/foundPersonPage'
import HomePage from '../pages/homePage'
import TaskListPage from '../pages/TaskListPage'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationInCommunity } from '../mockData/referralInformationData'

test.describe('FindPerson', () => {
  const incompleteStatus = { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' }
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetPerson()
    await communitySupport.stubGetCommunitySupportServices()
    await page.goto('/')
    await login(page)
  })

  test('AC1 - Page heading matches content document', async ({ page }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    const expectedHeader = FindPersonPage.content().pageHeader
    const expectedTitle = FindPersonPage.content().pageTitle
    await test.step('header matches content', async () => {
      await expect(findPersonPage.header).toHaveText(expectedHeader)
    })
    await test.step('title matches content', async () => {
      await expect(page).toHaveTitle(expectedTitle)
    })
  })

  test('AC2 - Updated page controls (replaces search behaviour) -should display the find person page heading and continue control only', async ({
    page,
  }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await expect(findPersonPage.continueButton).toHaveText('Continue')
    await expect(page.getByRole('button', { name: 'Search' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Cancel' })).toHaveCount(0)
  })

  test('AC3-E2E Journey - should display the found details page when a person is found by CRN', async ({ page }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.identifierInput.fill('X320741')
    await page.getByRole('button', { name: 'Continue' }).click()
    const foundPersonPage = await FoundPersonPage.verifyOnPage(page)
    expect(foundPersonPage.personSummary.rows).toHaveLength(4)
    await expect(foundPersonPage.personSummary.rows[0].key).toHaveText('Name')
    await expect(foundPersonPage.personSummary.rows[0].value).toHaveText('Alex River')
    await expect(foundPersonPage.personSummary.rows[1].key).toHaveText('CRN')
    await expect(foundPersonPage.personSummary.rows[1].value).toHaveText('X320741')
    await expect(foundPersonPage.personSummary.rows[2].key).toHaveText('Date of birth')
    await expect(foundPersonPage.personSummary.rows[2].value).toHaveText('20 Feb 1975 (51 years old)')
    await expect(foundPersonPage.personSummary.rows[3].key).toHaveText('Sex')
    await expect(foundPersonPage.personSummary.rows[3].value).toHaveText('Male')
  })

  test('AC4 - Error message - nothing entered should show an error when no identifier is entered and continue is clicked', async ({
    page,
  }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await page.getByRole('button', { name: 'Continue' }).click()
    const expectedErrorNothing =
      FindPersonPage.content().errorMessages?.nothingEntered ?? 'Enter a CRN or prison number'
    await expect(findPersonPage.personIdentifierErrorMessage).toContainText(expectedErrorNothing)
    await test.step('should be on find person screen', async () => {
      await expect(page).toHaveURL(FindPersonPage.url())
    })
  })

  test('AC5  Error message - incorrect format- Incorrect Value entered should show an error is entered and continue is clicked', async ({
    page,
  }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.identifierInput.fill('123')
    await page.getByRole('button', { name: 'Continue' }).click()
    const expectedErrorFormat =
      FindPersonPage.content().errorMessages.incorrectFormat ??
      'Enter a CRN or prison number in the correct format, like X123456 for a CRN or D0168GH for a prison number'
    await expect(findPersonPage.personIdentifierErrorMessage).toContainText(expectedErrorFormat)
    await test.step('should be on find person screen', async () => {
      await expect(page).toHaveURL(FindPersonPage.url())
    })
  })

  test('AC6 - Error message - no record - should show a no record error when valid identifier is entered with no matching person', async ({
    page,
  }) => {
    await communitySupport.stubGetPerson(404)

    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.identifierInput.fill('X320741')
    await page.getByRole('button', { name: 'Continue' }).click()
    const expectedErrorNoRecord =
      FindPersonPage.content().errorMessages.noRecord ?? 'No person with that CRN or prison number found'
    await expect(findPersonPage.personIdentifierErrorMessage).toContainText(expectedErrorNoRecord)
    await test.step('should be on find person screen', async () => {
      await expect(page).toHaveURL(FindPersonPage.url())
    })
  })

  test('should navigate to home page when clicking back link on find person page', async ({ page }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.backLink.click()
    await HomePage.verifyOnPage(page)
  })

  test('should navigate to the confirm person screen when Continue is clicked', async ({ page }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.identifierInput.fill('X320741')
    await findPersonPage.continueButton.click()

    await FoundPersonPage.verifyOnPage(page)
  })

  test('should navigate to the task list page when continue is clicked from found person page', async ({ page }) => {
    await communitySupport.stubCreateReferral(referralInformationInCommunity)
    await communitySupport.stubGetTaskListStatus(referralInformationInCommunity.referralId, {
      fullName: 'Alex River',
      confirmPersonalDetailsCompleted: incompleteStatus,
      checkRiskInformationCompleted: incompleteStatus,
      selectThePersonsNeedsCompleted: incompleteStatus,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
      addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    })

    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.identifierInput.fill('X320741')
    await page.getByRole('button', { name: 'Continue' }).click()

    await FoundPersonPage.verifyOnPage(page)
    await page.getByRole('button', { name: 'Continue' }).click()
    await TaskListPage.verifyOnPage(page)
  })

  test('should display the found details page when a person is found by prison number', async ({ page }) => {
    await page.goto('/referral/new/find-a-person')
    const findPersonPage = await FindPersonPage.verifyOnPage(page)
    await findPersonPage.identifierInput.fill('A1234BC')
    await findPersonPage.submitButton.click()

    const foundPersonPage = await FoundPersonPage.verifyOnPage(page)

    expect(foundPersonPage.personSummary.rows).toHaveLength(4)
    await expect(foundPersonPage.personSummary.rows[0].key).toHaveText('Name')
    await expect(foundPersonPage.personSummary.rows[0].value).toHaveText('Alex River')
    await expect(foundPersonPage.personSummary.rows[1].key).toHaveText('Prison number')
    await expect(foundPersonPage.personSummary.rows[1].value).toHaveText('A1234BC, B1234CD, C1234DE')
    await expect(foundPersonPage.personSummary.rows[2].key).toHaveText('Date of birth')
    await expect(foundPersonPage.personSummary.rows[2].value).toHaveText('20 Feb 1975 (51 years old)')
    await expect(foundPersonPage.personSummary.rows[3].key).toHaveText('Sex')
    await expect(foundPersonPage.personSummary.rows[3].value).toHaveText('Male')
  })
})

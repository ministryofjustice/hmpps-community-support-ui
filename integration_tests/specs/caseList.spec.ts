import { expect, test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import CaseListPage from '../pages/caseListPage'

test.describe('Case List Pages with no cases', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetUnassignedNoCases()
  })

  test('should display the unassigned case list with no cases', async ({ page }) => {
    await page.goto('/unassigned-cases')
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(caseListPage.noCasesMessage).toBeVisible()
    expect(caseListPage.noCasesTitle).toBeVisible()
  })
})

test.describe('Pagination navigation tests', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetInProgressFiftyCases()
  })

  test('should display no pagination when no cases are present', async ({ page }) => {
    await resetStubs
    await communitySupport.stubGetUnassignedNoCases()
    await page.goto('/unassigned-cases')
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(caseListPage.pagination).not.toBeVisible()
  })

  test('should navigate to the next page of cases when clicking the next button', async ({ page }) => {
    await page.goto('/cases-in-progress')
    const nextButton = page.locator('.govuk-pagination__next')
    await nextButton.click()
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(page.url()).toContain('page=4')
    expect(caseListPage.pagination).toBeVisible()
  })

  test('should navigate to the previous page of cases when clicking the previous button', async ({ page }) => {
    await page.goto('/cases-in-progress')
    const previousButton = page.locator('.govuk-pagination__prev')
    await previousButton.click()
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(page.url()).toContain('page=2')
    expect(caseListPage.pagination).toBeVisible()
  })

  test('should navigate to the correct page of cases when clicking a page number', async ({ page }) => {
    await page.goto('/cases-in-progress')
    const pageNumberButton = page.locator('.govuk-pagination__item').nth(2)
    await pageNumberButton.click()
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(page.url()).toContain('page=4')
    expect(caseListPage.pagination).toBeVisible()
  })
})

test.describe('Unassigned Case List Pages', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetUnassignedCases()
    await page.goto('/')
    await login(page)
  })

  test('should display the unassigned case list', async ({ page }) => {
    await page.goto('/unassigned-cases')
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(caseListPage.header).toBeVisible()
  })
  test('should display the unassigned case list page with 10 cases', async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetUnassignedCases()
    await page.goto('/')
    await login(page)

    await page.goto('/unassigned-cases?selected=unassigned')
    const caseListPage = await CaseListPage.verifyOnPage(page)

    expect(caseListPage.pagination).toBeVisible()
    expect(caseListPage.caseListTable).toBeVisible()
    expect(caseListPage.subNavTitle).toContainText('Unassigned cases')
    expect(caseListPage.header).toBeVisible()
  })
})

test.describe('In Progress Case List Pages', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetInProgressCase()
    await page.goto('/')
    await login(page)
  })

  test('should display the in progress case list', async ({ page }) => {
    await page.goto('/cases-in-progress')
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(caseListPage.header).toBeVisible()
  })
  test('should display the in progress case list page with 10 cases', async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetInProgressFiftyCases()
    await page.goto('/cases-in-progress')
    const caseListPage = await CaseListPage.verifyOnPage(page)

    expect(caseListPage.pagination).toBeVisible()
    expect(caseListPage.caseListTable).toBeVisible()
    expect(caseListPage.subNavTitle).toContainText('Cases in progress')
    expect(caseListPage.header).toBeVisible()
  })
})

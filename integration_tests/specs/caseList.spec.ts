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
    await page.goto(CaseListPage.url('unassigned'))
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(caseListPage.noCasesMessage).toBeVisible()
    expect(caseListPage.noCasesTitle).toBeVisible()
  })

  test('should not display pagination when there are no cases', async ({ page }) => {
    await page.goto(CaseListPage.url('unassigned'))
    const caseListPage = await CaseListPage.verifyOnPage(page)
    await expect(caseListPage.pagination).not.toBeVisible()
  })
})

test.describe('Case List Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetInProgressFiftyCases()
    await page.goto(CaseListPage.url('in-progress'))
  })

  test('should navigate to the next page of cases', async ({ page }) => {
    await page.locator('.govuk-pagination__next').click()
    await expect(page).toHaveURL(/page=4/)
  })

  test('should navigate to the previous page of cases', async ({ page }) => {
    await page.locator('.govuk-pagination__prev').click()
    await expect(page).toHaveURL(/page=2/)
  })

  test('should navigate to a selected page of cases', async ({ page }) => {
    await page.locator('.govuk-pagination__item').nth(2).click()
    await expect(page).toHaveURL(/page=4/)
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
    await page.goto(CaseListPage.url('unassigned'))
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(caseListPage.header).toBeVisible()
  })
  test('should display the unassigned case list page with 10 cases', async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetUnassignedCases()
    await page.goto('/')
    await login(page)

    await page.goto(CaseListPage.url('unassigned'))
    const caseListPage = await CaseListPage.verifyOnPage(page)

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
    await page.goto(CaseListPage.url('in-progress'))
    const caseListPage = await CaseListPage.verifyOnPage(page)
    expect(caseListPage.header).toBeVisible()
  })
  test('should display the in progress case list page with 10 cases', async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubGetInProgressFiftyCases()
    await page.goto(CaseListPage.url('in-progress'))
    const caseListPage = await CaseListPage.verifyOnPage(page)

    expect(caseListPage.pagination).toBeVisible()
    expect(caseListPage.caseListTable).toBeVisible()
    expect(caseListPage.subNavTitle).toContainText('Cases in progress')
    expect(caseListPage.header).toBeVisible()
  })
})

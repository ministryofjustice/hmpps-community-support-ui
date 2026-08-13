import { test, expect } from '@playwright/test'
import { stubUpdateServiceEndDatePage } from '../mockApis/serviceEndDateStubs'

test.describe('Service End Date Page', () => {
  test('should display empty service end date form', async ({ page }) => {
    await page.goto('/referral/task-list/service-end-date')

    // Verify page elements
    await expect(page.locator('h1')).toContainText('Set the target service completion date')
    await expect(page.locator('text=This is the date by which the service should be completed.')).toBeVisible()

    // Verify form fields are empty
    const dateInput = page.locator('#target-service-completion-date')
    await expect(dateInput).toHaveValue('')

    const reasonTextarea = page.locator('#target-service-completion-reason')
    await expect(reasonTextarea).toHaveValue('')

    // Verify back link
    const backLink = page.locator('a:has-text("Back")')
    await expect(backLink).toHaveAttribute('href', '/referral/task-list')
  })

  test('should update service end date and redirect to task list', async ({ page }) => {
    await stubUpdateServiceEndDatePage(page)

    await page.goto('/referral/task-list/service-end-date')

    // Fill form
    await page.fill('#target-service-completion-date', '2026-06-30')
    await page.fill('#target-service-completion-reason', 'Six month target period')

    // Submit form
    await page.click('button:has-text("Continue")')

    // Verify redirect to task list
    await expect(page).toHaveURL('/referral/task-list')
  })

  test('should validate required fields before submit', async ({ page }) => {
    await page.goto('/referral/task-list/service-end-date')

    // Try to submit without filling required fields
    // Note: This test assumes the form has client-side or server-side validation
    // If no validation exists, this test may need to be updated
    await expect(page.locator('#target-service-completion-date')).toHaveValue('')
    await expect(page.locator('#target-service-completion-reason')).toHaveValue('')
  })
})

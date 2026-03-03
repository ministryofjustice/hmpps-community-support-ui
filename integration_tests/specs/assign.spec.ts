import { expect, test } from '@playwright/test'
import { randomUUID } from 'crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AssignPage from '../pages/AssignPage'
import AssignedPage from '../pages/AssignedPage'

/*
  Test log
  - what happen if we fill the first input in the second again and then do the assignment
*/

test.describe('AssignPage', () => {
  const referralId = randomUUID()
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await communitySupport.stubNewReferralUserAssignments(referralId)
    await test.step('go to assign page', async () => {
      await page.goto(`/referral/${referralId}/assign`)
    })
  })

  test('should display the page', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    expect(assignPage.header).toBeVisible()
  })
  // IPB-2010:AC1
  test('AC1: Assigning cases headers', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('check content', async () => {
      await expect(assignPage.header).toHaveText('Who do you want to assign this case to?')
      await expect(assignPage.subheader).toHaveText('Caseworker')
    })
  })
  // IPB-2010:AC2 - !!! No back link yet!!!
  test.skip('AC2: Back navigation', async () => {
    /*
      Given I’m assigning a specific case to caseworker(s)
      When I select the Back option
      Then I am taken back to the specific case’s referral details screen
      */
  })
  // IPB-2010:AC3
  test('AC3: Adding Multiple Caseworkers', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('adding case worker 1', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('testuser1@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
    })
    await test.step('adding case worker 2', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await assignPage.emailAddressInputs[1].fill('testuser2@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
    })
    await test.step('adding case worker 3', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
      await assignPage.emailAddressInputs[2].fill('testuser3@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(4)
    })
    await test.step('adding case worker 4', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(4)
      await assignPage.emailAddressInputs[3].fill('testuser4@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(5)
    })
    await test.step('adding the last case worker', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(5)
      await assignPage.emailAddressInputs[4].fill('testuser5@email.com')
      await expect(assignPage.addAnotherCaseWorkerButton).toContainClass('govuk-visually-hidden')
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(5)
    })
  })
  // IPB-2010:AC4
  test('AC4: Assign a single caseworker', async ({ page }) => {
    await communitySupport.stubPostReferralUserAssignments(referralId, {
      success: true,
      message: 'The case has been assigned to a caseworker.',
      succeededList: [
        {
          userType: 'EXTERNAL',
          userId: 'test-user-1',
          fullName: 'Test User 1',
          emailAddress: 'testuser1@email.com',
        },
      ],
    })
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('adding case worker 1', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('testuser1@email.com')
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.submitButton.click()
      await expect(page).toHaveURL(`/referral/${referralId}/assigned`)
      await AssignedPage.verifySingleAssignmentOnPage(page)
    })
  })
  // IPB-2010:AC5
  test('AC5: Assign multiple caseworkers', async ({ page }) => {
    await communitySupport.stubPostReferralUserAssignments(referralId, {
      success: true,
      message: 'The case has been assigned to caseworkers.',
      succeededList: [
        {
          userType: 'EXTERNAL',
          userId: 'test-user-1',
          fullName: 'Test User 1',
          emailAddress: 'testuser1@email.com',
        },
        {
          userType: 'EXTERNAL',
          userId: 'test-user-2',
          fullName: 'Test User 2',
          emailAddress: 'testuser2@email.com',
        },
      ],
    })
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('adding case worker 1', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('testuser1@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
    })
    await test.step('adding case worker 2', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await assignPage.emailAddressInputs[1].fill('testuser2@email.com')
    })
    await test.step('assign case workers', async () => {
      await assignPage.submitButton.click()
      await expect(page).toHaveURL(`/referral/${referralId}/assigned`)
      await AssignedPage.verifyMultipleAssignmentOnPage(page)
    })
  })
  // IPB-2010:AC6 - !!! integration needed !!!
  test.skip('AC6: View assigned caseworkers', async () => {
    /*
      Given I’ve assigned the referral to caseworker(s)
      When I view who the referral is Assigned to
      Then I can see each assigned caseworker displayed with:

      Caseworker first name and last name

      Caseworker email address in brackets

      for example:
      Alex Johnson
      (alex.johnson@example.com)
      Michaela Boronsky
      (michaela.b@example.com)
    */
  })
  // IPB-2010:AC7
  test('AC7: Removing multiple Caseworkers', async ({ page }) => {
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('adding case worker 1', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('testuser1@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
    })
    await test.step('adding case worker 2', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await assignPage.emailAddressInputs[1].fill('testuser2@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
    })
    await test.step('adding case worker 3', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
      await assignPage.emailAddressInputs[2].fill('testuser3@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(4)
    })
    await test.step('adding case worker 4', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(4)
      await assignPage.emailAddressInputs[3].fill('testuser4@email.com')
    })
    await test.step('remove case worker 3', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(4)
      await assignPage.removeCaseWorkerButtons[2].click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
      await expect(assignPage.emailAddressInputs[0]).toHaveValue('testuser1@email.com')
      await expect(assignPage.emailAddressInputs[1]).toHaveValue('testuser2@email.com')
      await expect(assignPage.emailAddressInputs[2]).toHaveValue('testuser4@email.com')
    })
    await test.step('remove the first case worker', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(3)
      await assignPage.removeCaseWorkerButtons[0].click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await expect(assignPage.emailAddressInputs[0]).toHaveValue('testuser2@email.com')
      await expect(assignPage.emailAddressInputs[1]).toHaveValue('testuser4@email.com')
    })
    await test.step('remove the last case worker ', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await assignPage.removeCaseWorkerButtons[1].click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await expect(assignPage.emailAddressInputs[0]).toHaveValue('testuser2@email.com')
    })
    await test.step('No remove button for the only one case worker input', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await expect(assignPage.removeCaseWorkerButtons).toHaveLength(0)
    })
  })
  // IPB-2010:AC8
  test('AC8: Invalid email format', async ({ page }) => {
    await communitySupport.stubPostReferralUserAssignments(
      referralId,
      {
        success: false,
        message: 'Failed to assign case workers',
        failureList: [
          {
            emailAddress: 'testuser1email.com',
            reason: 'Enter an email address in the correct format, like name@example.com',
          },
        ],
      },
      400,
    )
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('adding case worker with invalid email', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('testuser1@email.com')
      await assignPage.submitButton.click()
      await expect(page).toHaveURL(`/referral/${referralId}/assign`)
      await AssignPage.verifyInvalidEmailOnPage(page)
    })
  })
  // IPB-2010:AC9
  test('AC9: Blank email', async ({ page }) => {
    await communitySupport.stubPostReferralUserAssignments(
      referralId,
      {
        success: false,
        message: 'Failed to assign case workers',
        failureList: [
          {
            emailAddress: '',
            reason: "Enter the caseworker's email address",
          },
        ],
      },
      400,
    )
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('adding case worker with invalid email', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('')
      await assignPage.submitButton.click()
      await expect(page).toHaveURL(`/referral/${referralId}/assign`)
      await AssignPage.verifyBlankEmailOnPage(page)
    })
  })
  // IPB-2010:AC10
  test('AC10: Not a recognised caseworker email', async ({ page }) => {
    await communitySupport.stubPostReferralUserAssignments(
      referralId,
      {
        success: false,
        message: 'Failed to assign case workers',
        failureList: [
          {
            emailAddress: 'unknownuear@email.com',
            reason: 'Could not find a caseworker with that email address',
          },
        ],
      },
      400,
    )
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('adding case worker with unrecognised caseworker email', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('unknownuear@email.com')
      await assignPage.submitButton.click()
      await expect(page).toHaveURL(`/referral/${referralId}/assign`)
      await AssignPage.verifyUnrecognisedEmailOnPage(page)
    })
  })
  // IPB-2010: what happen if we fill the first input in the second again and then do the assignment
  test('Adding two case workers in the same input', async ({ page }) => {
    await communitySupport.stubPostReferralUserAssignments(referralId, {
      success: true,
      message: 'The case has been assigned to a caseworker.',
      succeededList: [
        {
          userType: 'EXTERNAL',
          userId: 'test-user-1',
          fullName: 'Test User 1',
          emailAddress: 'testuser1@email.com',
        },
      ],
    })
    const assignPage = await AssignPage.verifyOnPage(page)
    await test.step('assign a case worker', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(1)
      await assignPage.emailAddressInputs[0].fill('testuser1@email.com')
      await assignPage.addAnotherCaseWorkerButton.click()
      await assignPage.updateInputs()
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
    })
    await test.step('assign another case worker', async () => {
      await expect(assignPage.emailAddressInputs).toHaveLength(2)
      await assignPage.emailAddressInputs[1].fill('testuser1@email.com')
      await assignPage.submitButton.click()
      await expect(page).toHaveURL(`/referral/${referralId}/assigned`)
      await AssignedPage.verifySingleAssignmentOnPage(page)
    })
  })
})

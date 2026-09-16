import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { PDU, ProbationOffice, ProbationPractitionerDetails } from '@community-support-api'
import { login, resetStubs, seedSessionRiskSummary, seedSessionCreateReferralDetails } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AddContactDetailsPage from '../pages/AddContactDetailsPage'
import ConfirmContactDetailsPage from '../pages/ConfirmContactDetailsPage'
import TaskListPage from '../pages/TaskListPage'

test.describe('Confirm Contact Details Page', () => {
  const mockReferralId = randomUUID()
  const mockPduId = randomUUID()

  const mockPersonDetails = {
    firstName: 'Alex',
    middleNames: '',
    lastName: 'River',
    dateOfBirth: '1975-02-20',
    prisonNumbers: [],
    personIdentifier: 'X123456',
  }

  const mockPdus: PDU[] = [{ id: mockPduId, name: 'Redcar, Cleveland and Middlesbrough' }]

  const mockProbationOffices: ProbationOffice[] = [
    {
      probationOfficeId: 1,
      name: 'Middlesbrough Probation Office',
      address: '1 Example Street',
      probationRegionId: 'cleveland',
    },
  ]

  const mockPPDetails: ProbationPractitionerDetails = {
    name: '',
  }

  // Drives the add-contact-details form and submits it, populating req.session.ppDetails
  // and landing on the confirm-contact-details page under test.
  const goToConfirmContactDetailsPage = async (page: import('@playwright/test').Page) => {
    await page.goto(AddContactDetailsPage.url())
    const addContactDetailsPage = await AddContactDetailsPage.verifyOnPage(page)
    await addContactDetailsPage.fillForm({ name: 'PP 1', emailAddress: 'pp1@example.com' })
    await addContactDetailsPage.selectPdu(mockPdus[0].name)
    await addContactDetailsPage.selectProbationOffice(mockProbationOffices[0].name)
    await addContactDetailsPage.submit()
    return ConfirmContactDetailsPage.verifyOnPage(page)
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetPDUs(mockPdus)
    await communitySupport.stubGetProbationOffices(mockProbationOffices)
    await communitySupport.stubGetPPDetails(mockReferralId, mockPPDetails)
    await communitySupport.stubSubmitContactDetails(mockReferralId)
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, mockReferralId)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: { personDetails: mockPersonDetails } })
  })

  test('should display the previously submitted contact details', async ({ page }) => {
    const confirmContactDetailsPage = await goToConfirmContactDetailsPage(page)

    await expect(confirmContactDetailsPage.heading).toHaveText('Alex River')
    await expect(confirmContactDetailsPage.summaryList.rows[0].value).toHaveText('PP 1')
    await expect(confirmContactDetailsPage.summaryList.rows[2].value).toHaveText('pp1@example.com')
    await expect(confirmContactDetailsPage.summaryList.rows[4].value).toHaveText(mockPdus[0].name)
    await expect(confirmContactDetailsPage.summaryList.rows[5].value).toHaveText(mockProbationOffices[0].name)
  })

  test('should show "Not entered" for optional fields that were left blank', async ({ page }) => {
    const confirmContactDetailsPage = await goToConfirmContactDetailsPage(page)

    await expect(confirmContactDetailsPage.summaryList.rows[1].value).toHaveText('Not entered')
    await expect(confirmContactDetailsPage.summaryList.rows[3].value).toHaveText('Not entered')
    await expect(confirmContactDetailsPage.summaryList.rows[6].value).toHaveText('Not entered')
  })

  test('should redirect back to add-contact-details when there are no saved contact details in session', async ({
    page,
  }) => {
    await page.goto(ConfirmContactDetailsPage.url())

    await expect(page).toHaveURL(/add-contact-details$/)
  })

  test('should redirect to find-a-person when there is no draft referral in session', async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetPDUs(mockPdus)
    await communitySupport.stubGetProbationOffices(mockProbationOffices)
    await page.goto('/')
    await login(page)

    await page.goto(ConfirmContactDetailsPage.url())

    await expect(page).toHaveURL(/find-a-person$/)
  })

  test('should submit the contact details and redirect to the task list on save and continue', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(mockReferralId, { fullName: 'Alex River' })
    const confirmContactDetailsPage = await goToConfirmContactDetailsPage(page)

    await confirmContactDetailsPage.submit()

    await expect(page).toHaveURL(/task-list$/)
    await TaskListPage.verifyOnPage(page)
  })

  test('the change link should return to the add-contact-details page', async ({ page }) => {
    const confirmContactDetailsPage = await goToConfirmContactDetailsPage(page)

    await confirmContactDetailsPage.changeLink.click()

    await AddContactDetailsPage.verifyOnPage(page)
    await expect(page).toHaveURL(/add-contact-details$/)
  })
})

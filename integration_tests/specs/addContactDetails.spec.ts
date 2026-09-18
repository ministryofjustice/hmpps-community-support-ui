import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { PDU, ProbationOffice, ProbationPractitionerDetails } from '@community-support-api'
import { login, resetStubs, seedSessionRiskSummary, seedSessionCreateReferralDetails } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import AddContactDetailsPage from '../pages/AddContactDetailsPage'

test.describe('Add Contact Details Page', () => {
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

  const mockPdus: PDU[] = [
    { id: mockPduId, name: 'Redcar, Cleveland and Middlesbrough' },
    { id: randomUUID(), name: 'Humberside' },
  ]

  const mockProbationOffices: ProbationOffice[] = [
    {
      probationOfficeId: 1,
      name: 'Middlesbrough Probation Office',
      address: '1 Example Street',
      probationRegionId: 'cleveland',
    },
    {
      probationOfficeId: 2,
      name: 'Hull Probation Office',
      address: '2 Example Street',
      probationRegionId: 'humberside',
    },
  ]

  const mockPPDetails: ProbationPractitionerDetails = {
    name: '',
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetPDUs(mockPdus)
    await communitySupport.stubGetProbationOffices(mockProbationOffices)
    await communitySupport.stubGetPPDetails(mockReferralId, mockPPDetails)
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, mockReferralId)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: { personDetails: mockPersonDetails } })
  })

  test('should display the page with the person name and all fields', async ({ page }) => {
    await page.goto(AddContactDetailsPage.url())
    const addContactDetailsPage = await AddContactDetailsPage.verifyOnPage(page)

    await expect(addContactDetailsPage.heading).toHaveText('Alex River')
    await expect(addContactDetailsPage.subHeading).toBeVisible()
    await expect(addContactDetailsPage.nameInput).toBeVisible()
    await expect(addContactDetailsPage.emailInput).toBeVisible()
    await expect(addContactDetailsPage.jobRoleInput).toBeVisible()
    await expect(addContactDetailsPage.phoneNumberInput).toBeVisible()
    await expect(addContactDetailsPage.teamPhoneNumberInput).toBeVisible()
    await expect(page.locator('#pdu')).toBeVisible()
    await expect(page.locator('#probationOffice')).toBeVisible()
  })

  test('should show validation errors when required fields are missing', async ({ page }) => {
    await page.goto(AddContactDetailsPage.url())
    const addContactDetailsPage = await AddContactDetailsPage.verifyOnPage(page)

    await addContactDetailsPage.submit()

    await expect(page).toHaveURL(/add-contact-details$/)
    await expect(addContactDetailsPage.errorSummary.title).toHaveText('There is a problem')
    await expect(addContactDetailsPage.errorSummary.locator).toContainText('Enter a name')
    await expect(addContactDetailsPage.errorSummary.locator).toContainText('Enter an email address')
    await expect(addContactDetailsPage.errorSummary.locator).toContainText('Enter a PDU')
  })

  test('should show a validation error for an invalid email address', async ({ page }) => {
    await page.goto(AddContactDetailsPage.url())
    const addContactDetailsPage = await AddContactDetailsPage.verifyOnPage(page)

    await addContactDetailsPage.fillForm({ name: 'Sam Smith', emailAddress: 'not-an-email' })
    await addContactDetailsPage.selectPdu(mockPdus[0].name)
    await addContactDetailsPage.submit()

    await expect(page).toHaveURL(/add-contact-details$/)
    await expect(addContactDetailsPage.errorSummary.locator).toContainText(
      'Enter an email address in the correct format',
    )
  })

  test('should store the submitted details in session and redirect to the confirm contact details page', async ({
    page,
  }) => {
    await page.goto(AddContactDetailsPage.url())
    const addContactDetailsPage = await AddContactDetailsPage.verifyOnPage(page)

    await addContactDetailsPage.fillForm({ name: 'PP 1', emailAddress: 'pp1@example.com' })
    await addContactDetailsPage.selectPdu(mockPdus[0].name)
    await addContactDetailsPage.selectProbationOffice(mockProbationOffices[0].name)
    await addContactDetailsPage.submit()

    await expect(page).toHaveURL(/confirm-contact-details/)
    await expect(page.getByText('PP 1')).toBeVisible()
    await expect(page.getByText('pp1@example.com')).toBeVisible()
    await expect(page.getByText(mockPdus[0].name)).toBeVisible()
    await expect(page.getByText(mockProbationOffices[0].name)).toBeVisible()
  })

  test('should reject a submitted pdu id that is not one of the fetched reference-data options', async ({ page }) => {
    await page.goto(AddContactDetailsPage.url())
    const addContactDetailsPage = await AddContactDetailsPage.verifyOnPage(page)

    await addContactDetailsPage.fillForm({ name: 'PP 1', emailAddress: 'pp1@example.com' })

    await page.evaluate(() => {
      const select = document.querySelector('#pdu-select') as HTMLSelectElement
      const option = document.createElement('option')
      option.value = JSON.stringify({ id: 'not-a-real-pdu-id', name: 'Fake PDU' })
      option.textContent = 'Fake PDU'
      select.appendChild(option)
      select.value = option.value
    })
    await addContactDetailsPage.submit()

    await expect(page).toHaveURL(/add-contact-details$/)
    await expect(addContactDetailsPage.errorSummary.locator).toContainText('Select a PDU from the list')
  })

  test('should redirect to find a person when there is no draft referral in session', async ({ page }) => {
    await seedSessionRiskSummary(page, '')

    await page.goto(AddContactDetailsPage.url())

    await expect(page).toHaveURL(/find-a-person$/)
  })
})

import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { AreaConfirmationBffResponseDto, CommunityServiceProviderBffResponseDto } from '@community-support-api'
import { login, resetStubs, seedSessionRiskSummary, seedSessionCreateReferralDetails } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { getMatchingRequests } from '../mockApis/wiremock'
import ConfirmAnAreaForReferralPage from '../pages/ConfirmAnAreaForReferralPage'
import ErrorPage from '../pages/errorPage'

test.describe('Confirm An Area For Referral Page', () => {
  const mockReferralId = randomUUID()
  const mockProviderId = randomUUID()
  const mockCrn = 'X123456'
  const mockDateOfBirth = '1975-02-20'
  const mockFormattedDateOfBirth = '20 Feb 1975 (51 years old)'

  const mockPersonDetails = {
    firstName: 'Alex',
    middleNames: '',
    lastName: 'River',
    personIdentifier: mockCrn,
    dateOfBirth: mockFormattedDateOfBirth,
    prisonNumbers: [],
  }

  const mockAreaConfirmationDetails: AreaConfirmationBffResponseDto = {
    deliveryPartner: 'Ingeus UK Limited',
    contractArea: 'Avon and Somerset, Gloucestershire, Wiltshire.',
    associatedPdus: [
      'Bath and North Somerset',
      'Bristol and South Gloucestershire',
      'Gloucestershire',
      'Somerset',
      'Swindon and Wiltshire',
    ],
    crn: mockCrn,
    dateOfBirth: mockDateOfBirth,
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetAreaConfirmationDetails(mockReferralId, mockProviderId, mockAreaConfirmationDetails)
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, mockReferralId)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: { personDetails: mockPersonDetails } })
  })

  const selectProviderInSession = (page: Parameters<typeof seedSessionRiskSummary>[0]) =>
    seedSessionRiskSummary(page, mockReferralId, undefined, mockProviderId)

  test('should display the delivery partner, area covered, PDUs and person summary', async ({ page }) => {
    await selectProviderInSession(page)
    await page.goto(ConfirmAnAreaForReferralPage.url())
    const confirmAnAreaForReferralPage = await ConfirmAnAreaForReferralPage.verifyOnPage(page)

    await expect(confirmAnAreaForReferralPage.heading).toHaveText('Alex River')
    await expect(confirmAnAreaForReferralPage.cardHeading).toHaveText('Start a Community Support referral')
    await expect(confirmAnAreaForReferralPage.pageCaption).toHaveText(
      `CRN: ${mockCrn} | Date of birth: ${mockFormattedDateOfBirth}`,
    )
    await expect(confirmAnAreaForReferralPage.deliveryPartner).toContainText('Ingeus UK Limited')
    await expect(confirmAnAreaForReferralPage.areaCovered).toContainText(
      'Avon and Somerset, Gloucestershire, Wiltshire.',
    )
    await expect(confirmAnAreaForReferralPage.pdus).toContainText('Bath and North Somerset')
    await expect(confirmAnAreaForReferralPage.pdus).toContainText('Swindon and Wiltshire')
  })

  test('should link to select a different area', async ({ page }) => {
    await selectProviderInSession(page)
    await page.goto(ConfirmAnAreaForReferralPage.url())
    const confirmAnAreaForReferralPage = await ConfirmAnAreaForReferralPage.verifyOnPage(page)

    await expect(confirmAnAreaForReferralPage.selectDifferentAreaLink).toHaveAttribute(
      'href',
      '/referral/task-list/select-an-area-for-referral',
    )
  })

  test('should save the selected provider and redirect to the task list', async ({ page }) => {
    const savedResponse: CommunityServiceProviderBffResponseDto = {
      referralId: mockReferralId,
      communityServiceProviderId: mockProviderId,
      communityServiceProviderName: 'Ingeus UK Limited',
    }
    await communitySupport.stubSaveCommunityServiceProvider(mockReferralId, savedResponse)
    await communitySupport.stubGetTaskListStatus(mockReferralId, {
      fullName: 'Alex River',
      confirmPersonalDetailsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      checkRiskInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      selectAnAreaForReferralCompleted: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
      selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfAnyAdditionalSupportNeedsCompleted: {
        completed: false,
        statusText: 'Incomplete',
        tag: 'govuk-tag--blue',
      },
      addAdditionalInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    })

    await selectProviderInSession(page)
    await page.goto(ConfirmAnAreaForReferralPage.url())
    const confirmAnAreaForReferralPage = await ConfirmAnAreaForReferralPage.verifyOnPage(page)

    await confirmAnAreaForReferralPage.saveAndContinueButton.click()

    await expect(page).toHaveURL(/\/referral\/task-list$/)

    const matchingRequests = await getMatchingRequests({
      method: 'PATCH',
      urlPathPattern: `/community-support/draft-referral/community-service-provider/${mockReferralId}`,
    })
    const [savedRequest] = matchingRequests.body.requests
    expect(JSON.parse(savedRequest.body)).toEqual({ communityServiceProviderId: mockProviderId })
  })

  test('should redirect to select an area for referral when no provider has been selected', async ({ page }) => {
    await page.goto(ConfirmAnAreaForReferralPage.url())

    await expect(page).toHaveURL(/\/referral\/task-list\/select-an-area-for-referral$/)
  })

  test('should show an error page when the area confirmation details cannot be retrieved', async ({ page }) => {
    await communitySupport.stubGetAreaConfirmationDetails(
      mockReferralId,
      mockProviderId,
      mockAreaConfirmationDetails,
      500,
    )
    await selectProviderInSession(page)

    const response = await page.goto(ConfirmAnAreaForReferralPage.url())

    expect(response?.status()).toBe(500)
    await ErrorPage.verifyOnSPage(page)
  })

  test('should show an error page when saving the selected provider fails', async ({ page }) => {
    await communitySupport.stubSaveCommunityServiceProvider(
      mockReferralId,
      {} as CommunityServiceProviderBffResponseDto,
      500,
    )
    await selectProviderInSession(page)

    await page.goto(ConfirmAnAreaForReferralPage.url())
    const confirmAnAreaForReferralPage = await ConfirmAnAreaForReferralPage.verifyOnPage(page)

    const [response] = await Promise.all([
      page.waitForResponse(
        resp =>
          resp.url().endsWith('/referral/task-list/confirm-an-area-for-referral') && resp.request().method() === 'POST',
      ),
      confirmAnAreaForReferralPage.saveAndContinueButton.click(),
    ])

    expect(response.status()).toBe(500)
    await ErrorPage.verifyOnSPage(page)
  })
})

import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { AreaConfirmationBffResponseDto, CommunitySupportServicesProvider } from '@community-support-api'
import { login, resetStubs, seedSessionRiskSummary, seedSessionCreateReferralDetails } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import SelectAnAreaForReferralPage from '../pages/SelectAnAreaForReferralPage'
import ConfirmAnAreaForReferralPage from '../pages/ConfirmAnAreaForReferralPage'

test.describe('Select An Area For Referral Page', () => {
  const mockReferralId = randomUUID()
  const mockFirstProviderId = randomUUID()
  const mockSecondProviderId = randomUUID()

  const mockPersonDetails = {
    firstName: 'Alex',
    middleNames: '',
    lastName: 'River',
    dateOfBirth: '1975-02-20',
    prisonNumbers: [],
  }

  const mockCommunitySupportServices: CommunitySupportServicesProvider['communitySupportServices'] = {
    Cleveland: [
      {
        id: mockFirstProviderId,
        region: 'Cleveland',
        area: 'Cleveland North',
        name: 'Community Support Service in Cleveland',
        providerName: 'Provider A',
        description: 'Description',
        pdus: ['Redcar, Cleveland and Middlesbrough'],
      },
    ],
    Yorkshire: [
      {
        id: mockSecondProviderId,
        region: 'Yorkshire',
        area: 'Yorkshire East',
        name: 'Community Support Service in Yorkshire',
        providerName: 'Provider B',
        description: 'Description',
        pdus: ['Humberside'],
      },
    ],
  }

  const mockAreaConfirmationDetails: AreaConfirmationBffResponseDto = {
    deliveryPartner: 'Ingeus UK Limited',
    contractArea: 'Avon and Somerset, Gloucestershire, Wiltshire.',
    associatedPdus: ['Bath and North Somerset'],
    crn: 'X123456',
    dateOfBirth: mockPersonDetails.dateOfBirth,
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetCommunitySupportServiceProviders(mockCommunitySupportServices)
    await communitySupport.stubGetAreaConfirmationDetails(
      mockReferralId,
      mockFirstProviderId,
      mockAreaConfirmationDetails,
    )
    await communitySupport.stubGetAreaConfirmationDetails(
      mockReferralId,
      mockSecondProviderId,
      mockAreaConfirmationDetails,
    )
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, mockReferralId)
    await seedSessionCreateReferralDetails(page, { referralCreationDetails: { personDetails: mockPersonDetails } })
  })

  test('should display an area option for each community support service', async ({ page }) => {
    await page.goto(SelectAnAreaForReferralPage.url())
    const selectAnAreaForReferralPage = await SelectAnAreaForReferralPage.verifyOnPage(page)

    await expect(selectAnAreaForReferralPage.heading).toHaveText('Alex River')
    await expect(selectAnAreaForReferralPage.radioOption(mockFirstProviderId)).toBeVisible()
    await expect(selectAnAreaForReferralPage.radioOption(mockSecondProviderId)).toBeVisible()
  })

  test('should show a validation error when no area is selected', async ({ page }) => {
    await page.goto(SelectAnAreaForReferralPage.url())
    const selectAnAreaForReferralPage = await SelectAnAreaForReferralPage.verifyOnPage(page)

    await selectAnAreaForReferralPage.continueButton.click()

    await expect(page).toHaveURL(/select-an-area-for-referral$/)
    await expect(selectAnAreaForReferralPage.errorSummary).toContainText(
      'Select the area you want to make a referral to',
    )
  })

  test('should store the selected area in session and redirect to the confirm an area page', async ({ page }) => {
    await page.goto(SelectAnAreaForReferralPage.url())
    const selectAnAreaForReferralPage = await SelectAnAreaForReferralPage.verifyOnPage(page)

    await selectAnAreaForReferralPage.selectArea(mockFirstProviderId)
    await selectAnAreaForReferralPage.continueButton.click()

    await expect(page).toHaveURL(/confirm-an-area-for-referral$/)
    await ConfirmAnAreaForReferralPage.verifyOnPage(page)
  })

  test('should preselect the previously chosen area when returning via the select a different area link', async ({
    page,
  }) => {
    await page.goto(SelectAnAreaForReferralPage.url())
    let selectAnAreaForReferralPage = await SelectAnAreaForReferralPage.verifyOnPage(page)

    await selectAnAreaForReferralPage.selectArea(mockFirstProviderId)
    await selectAnAreaForReferralPage.continueButton.click()

    const confirmAnAreaForReferralPage = await ConfirmAnAreaForReferralPage.verifyOnPage(page)
    await confirmAnAreaForReferralPage.selectDifferentAreaLink.click()

    selectAnAreaForReferralPage = await SelectAnAreaForReferralPage.verifyOnPage(page)
    await expect(selectAnAreaForReferralPage.radioOption(mockFirstProviderId)).toBeChecked()
    await expect(selectAnAreaForReferralPage.radioOption(mockSecondProviderId)).not.toBeChecked()
  })
})

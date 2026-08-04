import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { CommunitySupportRiskDto, CommunitySupportRiskInformationDto } from '@community-support-api'
import { login, resetStubs, seedSessionRiskSummary } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { getMatchingRequests } from '../mockApis/wiremock'
import RiskSummaryPage from '../pages/RiskSummaryPage'
import EditRiskSummaryPage from '../pages/EditRiskSummaryPage'
import RiskSummaryErrorPage from '../pages/errorPage'

test.describe('Edit Risk Summary Page', () => {
  const mockReferralId = randomUUID()
  const mockCrn = 'X123456'

  const mockRisk: CommunitySupportRiskDto = {
    firstName: 'Alex',
    lastName: 'River',
    crn: mockCrn,
    dateOfBirth: '1975-02-20',
    assessmentWithin12Months: true,
    assessedOn: '2026-02-28T09:00:00',
    riskToSelf: {
      suicide: {
        risk: 'YES',
        previous: 'YES',
        previousConcernsText: 'Previous attempt in 2022 while in custody.',
        current: 'YES',
        currentConcernsText: 'Expressed suicidal ideation during last supervision.',
      },
      selfHarm: { risk: 'DK', previous: 'DK', current: 'DK' },
      custody: { risk: 'NO', previous: 'NO', current: 'NO' },
      hostelSetting: {
        risk: 'NO',
        previous: 'NO',
        current: 'NO',
      },
      vulnerability: {
        risk: 'YES',
        previous: 'NO',
        current: 'YES',
        currentConcernsText: 'Mental health deterioration noted by GP.',
      },
    },
    additionalInformation: 'Known to associate with a co-defendant in the local area.',
    summary: {
      whoIsAtRisk: 'Public, known adults and staff are at risk.',
      natureOfRisk: 'Physical violence and intimidation towards others.',
      riskImminence: 'Risk is immediate, particularly when under the influence of alcohol.',
      riskIncreaseFactors: 'Alcohol and drug misuse.',
      riskMitigationFactors: 'Regular probation contact.',
      analysisOfRiskFactors: 'Pattern of domestic violence linked to substance misuse.',
      riskInCommunity: { HIGH: ['Public'] },
      riskInCustody: { LOW: ['Public'] },
      overallRiskLevel: 'VERY_HIGH',
    },
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetRoshRisks(mockReferralId, mockRisk)
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, mockReferralId)
  })

  test('should link from each change link on the risk summary page to the corresponding field on the edit page', async ({
    page,
  }) => {
    await page.goto(RiskSummaryPage.url())
    const riskSummaryPage = await RiskSummaryPage.verifyOnPage(page)

    const changeLink = riskSummaryPage
      .rowByHeading('Concerns in relation to vulnerability')
      .getByRole('link', { name: 'Change' })

    await expect(changeLink).toHaveAttribute('href', '/referral/task-list/edit-risk-summary#riskToSelfVulnerability')

    await changeLink.click()

    await expect(page).toHaveURL(/\/referral\/task-list\/edit-risk-summary#riskToSelfVulnerability$/)
    const editRiskSummaryPage = await EditRiskSummaryPage.verifyOnPage(page)
    await expect(editRiskSummaryPage.vulnerability).toBeVisible()
  })

  test('should pre-fill the edit page with the current OASys risk information', async ({ page }) => {
    await page.goto(EditRiskSummaryPage.url())
    const editRiskSummaryPage = await EditRiskSummaryPage.verifyOnPage(page)

    await expect(editRiskSummaryPage.heading).toHaveText('Alex River')
    await expect(editRiskSummaryPage.lastUpdated).toHaveText('Last updated (OASys): 28 February 2026')
    await expect(editRiskSummaryPage.whoIsAtRisk).toHaveValue('Public, known adults and staff are at risk.')
    await expect(editRiskSummaryPage.natureOfRisk).toHaveValue('Physical violence and intimidation towards others.')
    await expect(editRiskSummaryPage.suicide).toHaveValue('Expressed suicidal ideation during last supervision.')
    await expect(editRiskSummaryPage.suicideIndicator).toHaveText('Yes')
    await expect(editRiskSummaryPage.selfHarm).toHaveValue('')
    await expect(editRiskSummaryPage.selfHarmIndicator).toHaveText(`Don't know`)
    await expect(editRiskSummaryPage.hostelSettingIndicator).toHaveText('No')
    await expect(editRiskSummaryPage.vulnerability).toHaveValue('Mental health deterioration noted by GP.')
    await expect(editRiskSummaryPage.vulnerabilityIndicator).toHaveText('Yes')
    await expect(editRiskSummaryPage.additionalInformation).toHaveValue(
      'Known to associate with a co-defendant in the local area.',
    )
  })

  test('should link back to the risk summary page', async ({ page }) => {
    await page.goto(EditRiskSummaryPage.url())
    const editRiskSummaryPage = await EditRiskSummaryPage.verifyOnPage(page)

    await expect(editRiskSummaryPage.backLink).toHaveAttribute('href', '/referral/task-list/view-risk-summary')
  })

  test('should save the edited risk information and return to the view risk summary page', async ({ page }) => {
    const savedRiskInformation: CommunitySupportRiskInformationDto = {
      riskSummaryWhoIsAtRisk: 'Updated who is at risk information.',
      riskSummaryNatureOfRisk: mockRisk.summary?.natureOfRisk,
      riskSummaryRiskImminence: mockRisk.summary?.riskImminence,
      riskToSelfSuicide: mockRisk.riskToSelf?.suicide?.currentConcernsText,
      riskToSelfSelfHarm: '',
      riskToSelfHostelSetting: '',
      riskToSelfVulnerability: mockRisk.riskToSelf?.vulnerability?.currentConcernsText,
      additionalInformation: '',
    }
    await communitySupport.stubSaveRiskInformation(mockReferralId, savedRiskInformation)

    await page.goto(EditRiskSummaryPage.url())
    const editRiskSummaryPage = await EditRiskSummaryPage.verifyOnPage(page)

    await editRiskSummaryPage.whoIsAtRisk.fill('Updated who is at risk information.')

    // The view page re-fetches risk data on redirect, so re-stub the GET to reflect the edit just saved.
    const updatedRisk: CommunitySupportRiskDto = {
      ...mockRisk,
      summary: {
        whoIsAtRisk: 'Updated who is at risk information.',
        natureOfRisk: mockRisk.summary?.natureOfRisk,
        riskImminence: mockRisk.summary?.riskImminence,
        riskInCommunity: mockRisk.summary?.riskInCommunity ?? {},
        riskInCustody: mockRisk.summary?.riskInCustody ?? {},
      },
    }
    await communitySupport.stubGetRoshRisks(mockReferralId, updatedRisk)
    await editRiskSummaryPage.saveAndContinueButton.click()

    await expect(page).toHaveURL(/\/referral\/task-list\/view-risk-summary$/)
    const riskSummaryPage = await RiskSummaryPage.verifyOnPage(page)
    await expect(riskSummaryPage.rowByHeading('Who is at risk')).toContainText('Updated who is at risk information.')

    const matchingRequests = await getMatchingRequests({
      method: 'PUT',
      urlPathPattern: `/community-support/draft-referral/risk-information/${mockReferralId}`,
    })
    const [savedRequest] = matchingRequests.body.requests
    expect(JSON.parse(savedRequest.body)).toMatchObject({
      riskSummaryWhoIsAtRisk: 'Updated who is at risk information.',
      riskSummaryNatureOfRisk: mockRisk.summary?.natureOfRisk,
      riskSummaryRiskImminence: mockRisk.summary?.riskImminence,
      riskToSelfSuicide: mockRisk.riskToSelf?.suicide?.currentConcernsText,
      riskToSelfVulnerability: mockRisk.riskToSelf?.vulnerability?.currentConcernsText,
    })
  })

  test('should show an error page when the risk information cannot be retrieved', async ({ page }) => {
    await communitySupport.stubGetRoshRisks(mockReferralId, mockRisk, 500)

    const response = await page.goto(EditRiskSummaryPage.url())

    expect(response?.status()).toBe(500)
    await RiskSummaryErrorPage.verifyOnPage(page)
  })

  test('should show an error page when saving the edited risk information fails', async ({ page }) => {
    const savedRiskInformation: CommunitySupportRiskInformationDto = {}
    await communitySupport.stubSaveRiskInformation(mockReferralId, savedRiskInformation, 500)

    await page.goto(EditRiskSummaryPage.url())
    const editRiskSummaryPage = await EditRiskSummaryPage.verifyOnPage(page)

    const [response] = await Promise.all([
      page.waitForResponse(
        resp => resp.url().endsWith('/referral/task-list/edit-risk-summary') && resp.request().method() === 'POST',
      ),
      editRiskSummaryPage.saveAndContinueButton.click(),
    ])

    expect(response.status()).toBe(500)
    await RiskSummaryErrorPage.verifyOnPage(page)
  })
})

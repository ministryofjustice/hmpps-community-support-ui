import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { differenceInYears } from 'date-fns'
import { CommunitySupportRiskDto, CommunitySupportRiskInformationDto, TaskListStatusDto } from '@community-support-api'
import { login, resetStubs, seedSessionRiskSummary } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { getMatchingRequests } from '../mockApis/wiremock'
import RiskSummaryPage from '../pages/RiskSummaryPage'
import TaskListPage from '../pages/TaskListPage'
import ErrorPage from '../pages/errorPage'

test.describe('Risk Summary Page', () => {
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

  const mockTaskListStatus: TaskListStatusDto = {
    fullName: 'Alex River',
    confirmPersonalDetailsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    checkRiskInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    addDetailsOfAnyAdditionalSupportNeedsCompleted: {
      completed: false,
      statusText: 'Incomplete',
      tag: 'govuk-tag--blue',
    },
    addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  }

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetRoshRisks(mockReferralId, mockRisk)
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, mockReferralId)
  })

  test('should display the OASys risk information for the person', async ({ page }) => {
    await page.goto(RiskSummaryPage.url())

    const riskSummaryPage = await RiskSummaryPage.verifyOnPage(page)

    await expect(riskSummaryPage.heading).toHaveText('Alex River')
    await expect(riskSummaryPage.crn).toHaveText(`CRN: ${mockCrn}`)
    const expectedAge = differenceInYears(new Date(), new Date('1975-02-20'))
    await expect(riskSummaryPage.dateOfBirth).toHaveText(`Date of birth: 20 February 1975 (${expectedAge} years old)`)
    await expect(riskSummaryPage.lastUpdated).toHaveText('Last updated (OASys): 28 February 2026')

    await expect(riskSummaryPage.rowByHeading('Who is at risk')).toContainText(
      'Public, known adults and staff are at risk.',
    )
    await expect(riskSummaryPage.rowByHeading('Risk of self-harm')).toContainText(`Don't know`)
    await expect(riskSummaryPage.rowByHeading('Risk of suicide')).not.toContainText('Yes')
    await expect(riskSummaryPage.rowByHeading('Risk of suicide')).toContainText(
      'Expressed suicidal ideation during last supervision.',
    )
    await expect(riskSummaryPage.rowByHeading('Concerns in relation to coping in a hostel setting')).toContainText('No')
    await expect(riskSummaryPage.rowByHeading('Concerns in relation to vulnerability')).not.toContainText('Yes')
    await expect(riskSummaryPage.rowByHeading('Additional information')).toContainText(
      'Known to associate with a co-defendant in the local area.',
    )
  })

  test('should show an edited concern even when OASys did not flag a risk for that field', async ({ page }) => {
    await communitySupport.stubGetRoshRisks(mockReferralId, {
      ...mockRisk,
      riskToSelf: {
        ...mockRisk.riskToSelf,
        // Simulates the API merging in a case worker's edit for a field OASys itself did not flag.
        hostelSetting: { risk: 'NO', previous: 'NO', current: 'NO', currentConcernsText: 'Edited via the edit page.' },
      },
    })

    await page.goto(RiskSummaryPage.url())
    const riskSummaryPage = await RiskSummaryPage.verifyOnPage(page)

    await expect(riskSummaryPage.rowByHeading('Concerns in relation to coping in a hostel setting')).toContainText(
      'Edited via the edit page.',
    )
  })

  test('should link back to the task list for the referral, not the CRN', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(mockReferralId, mockTaskListStatus)

    await page.goto(RiskSummaryPage.url())
    const riskSummaryPage = await RiskSummaryPage.verifyOnPage(page)

    await expect(riskSummaryPage.backLink).toHaveAttribute('href', TaskListPage.url())

    await riskSummaryPage.backLink.click()

    await expect(page).toHaveURL(TaskListPage.url())
    await TaskListPage.verifyOnPage(page)
  })

  test('should save the risk information and return to the task list when saved', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(mockReferralId, mockTaskListStatus)
    const savedRiskInformation: CommunitySupportRiskInformationDto = {
      riskSummaryWhoIsAtRisk: mockRisk.summary?.whoIsAtRisk,
      riskSummaryNatureOfRisk: mockRisk.summary?.natureOfRisk,
      riskSummaryRiskImminence: mockRisk.summary?.riskImminence,
      riskToSelfSuicide: mockRisk.riskToSelf?.suicide?.currentConcernsText,
      riskToSelfSelfHarm: null,
      riskToSelfHostelSetting: null,
      riskToSelfVulnerability: mockRisk.riskToSelf?.vulnerability?.currentConcernsText,
      additionalInformation: mockRisk.additionalInformation,
    }
    await communitySupport.stubSaveRiskInformation(mockReferralId, savedRiskInformation)

    await page.goto(RiskSummaryPage.url())
    const riskSummaryPage = await RiskSummaryPage.verifyOnPage(page)

    await riskSummaryPage.saveAndContinueButton.click()

    await expect(page).toHaveURL(/\/referral\/task-list$/)
    await TaskListPage.verifyOnPage(page)

    const matchingRequests = await getMatchingRequests({
      method: 'PUT',
      urlPathPattern: `/community-support/draft-referral/risk-information/${mockReferralId}`,
    })
    const [savedRequest] = matchingRequests.body.requests
    expect(JSON.parse(savedRequest.body)).toMatchObject({
      riskSummaryWhoIsAtRisk: mockRisk.summary?.whoIsAtRisk,
      riskSummaryNatureOfRisk: mockRisk.summary?.natureOfRisk,
      riskSummaryRiskImminence: mockRisk.summary?.riskImminence,
      riskToSelfSuicide: mockRisk.riskToSelf?.suicide?.currentConcernsText,
      riskToSelfVulnerability: mockRisk.riskToSelf?.vulnerability?.currentConcernsText,
      additionalInformation: mockRisk.additionalInformation,
    })
  })

  test('should show an error page when the risk information cannot be retrieved', async ({ page }) => {
    await communitySupport.stubGetRoshRisks(mockReferralId, mockRisk, 500)

    const response = await page.goto(RiskSummaryPage.url())

    expect(response?.status()).toBe(500)
    await ErrorPage.verifyOnSPage(page)
  })

  test('should show an error page when saving the risk information fails', async ({ page }) => {
    const savedRiskInformation: CommunitySupportRiskInformationDto = {}
    await communitySupport.stubSaveRiskInformation(mockReferralId, savedRiskInformation, 500)

    await page.goto(RiskSummaryPage.url())
    const riskSummaryPage = await RiskSummaryPage.verifyOnPage(page)

    const [response] = await Promise.all([
      page.waitForResponse(
        resp => resp.url().endsWith('/referral/task-list/view-risk-summary') && resp.request().method() === 'POST',
      ),
      riskSummaryPage.saveAndContinueButton.click(),
    ])

    expect(response.status()).toBe(500)
    await ErrorPage.verifyOnSPage(page)
  })
})

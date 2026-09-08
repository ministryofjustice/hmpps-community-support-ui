import { expect, test, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import type { OffenceSentenceInfoBffResponseDto, OffenceSentenceRequest } from '@community-support-api'
import { getMatchingRequests } from '../mockApis/wiremock'
import communitySupport from '../mockApis/communitySupport'
import { login, resetStubs, seedSessionRiskSummary } from '../testUtils'
import OffenceSentencePage from '../pages/OffenceSentencePage'
import ServiceDaysPage from '../pages/ServiceDaysPage'

const NO_SELECTION_ERROR_MESSAGE =
  'Select yes if there are any licence conditions or exclusion zones the delivery partner should know about'
const DETAILS_EMPTY_ERROR_MESSAGE = 'Enter details of all relevant licence conditions or exclusion zones'

const referralId = randomUUID()
const baseResponse: OffenceSentenceInfoBffResponseDto = {
  firstName: 'Alex',
  lastName: 'Rivers',
  crn: 'X123456',
  dateOfBirth: '20 April 1984 (42 years old)',
  offenceSentenceInfo: {
    offence: 'Robbery',
    offenceSubCategory: 'Aggravated robbery',
    outcome: 'Community order',
  },
}

const buildResponse = (
  overrides: Partial<OffenceSentenceInfoBffResponseDto> = {},
): OffenceSentenceInfoBffResponseDto => ({
  ...baseResponse,
  ...overrides,
  offenceSentenceInfo: {
    ...baseResponse.offenceSentenceInfo,
    ...overrides.offenceSentenceInfo,
  },
})

const goToOffenceSentencePage = async (
  page: Page,
  response: OffenceSentenceInfoBffResponseDto = buildResponse(),
): Promise<OffenceSentencePage> => {
  await communitySupport.stubGetOffenceSentencePage(referralId, response)
  await page.goto(OffenceSentencePage.url())
  return OffenceSentencePage.verifyOnPage(page)
}

test.describe('Offence Sentence Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, referralId)
  })

  test('shows sentence end date row when sentence end date is returned', async ({ page }) => {
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { sentenceEndDate: '2026-06-01' } }),
    )
    const summaryCard = page.locator('.govuk-summary-card')

    await expect(summaryCard).toBeVisible()
    await expect(offenceSentencePage.personSummary).toBeVisible()
    await expect(offenceSentencePage.crn).toHaveText('CRN: X123456')
    await expect(offenceSentencePage.dateOfBirth).toHaveText('Date of birth: 20 April 1984 (42 years old)')
    await expect(offenceSentencePage.heading).toHaveText('Alex Rivers')
    await expect(offenceSentencePage.subHeader).toHaveText('Check offence and sentence information')
    await expect(offenceSentencePage.bodyText).toBeVisible()
    await expect(offenceSentencePage.summaryHeading).toHaveText('Offence and sentence information')
    await expect(offenceSentencePage.summaryHeading).toHaveClass(/govuk-summary-card__title/)
    await expect(offenceSentencePage.summaryRows).toHaveCount(4)
    await expect(offenceSentencePage.summaryRows.nth(0).locator('.govuk-summary-list__value')).toHaveText('Robbery')
    await expect(offenceSentencePage.summaryRows.nth(3).locator('.govuk-summary-list__key')).toHaveText(
      'Sentence end date',
    )
    await expect(offenceSentencePage.summaryRows.nth(3).locator('.govuk-summary-list__value')).toHaveText('1 June 2026')
    await expect(offenceSentencePage.licenceConditionsDetailsTextArea).not.toBeVisible()
  })

  test('shows expected release date row when sentence end date is missing', async ({ page }) => {
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { expectedReleaseDate: '2026-12-15' } }),
    )

    await expect(offenceSentencePage.summaryRows).toHaveCount(4)
    await expect(offenceSentencePage.summaryRows.nth(3).locator('.govuk-summary-list__key')).toHaveText(
      'Expected release date',
    )
    await expect(offenceSentencePage.summaryRows.nth(3).locator('.govuk-summary-list__value')).toHaveText(
      '15 December 2026',
    )
  })

  test('shows sentence end date row when expected release date is missing', async ({ page }) => {
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { sentenceEndDate: '2026-06-01', expectedReleaseDate: undefined } }),
    )

    await expect(offenceSentencePage.summaryRows).toHaveCount(4)
    await expect(offenceSentencePage.summaryRows.nth(3).locator('.govuk-summary-list__key')).toHaveText(
      'Sentence end date',
    )
    await expect(offenceSentencePage.summaryRows.nth(3).locator('.govuk-summary-list__value')).toHaveText('1 June 2026')
  })

  test('hides date rows when neither sentence end date nor expected release date is returned', async ({ page }) => {
    const offenceSentencePage = await goToOffenceSentencePage(page, buildResponse())

    await expect(offenceSentencePage.summaryRows).toHaveCount(3)
    await expect(offenceSentencePage.summaryRows.nth(0).locator('.govuk-summary-list__value')).toHaveText('Robbery')
    await expect(offenceSentencePage.summaryRows.nth(1).locator('.govuk-summary-list__value')).toHaveText(
      'Aggravated robbery',
    )
    await expect(offenceSentencePage.summaryRows.nth(2).locator('.govuk-summary-list__value')).toHaveText(
      'Community order',
    )
  })

  test('shows validation error when continuing without selecting yes or no', async ({ page }) => {
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { sentenceEndDate: undefined, expectedReleaseDate: '2026-12-15' } }),
    )

    await offenceSentencePage.clickSaveAndContinue()

    await expect(page).toHaveURL(OffenceSentencePage.url())
    await expect(offenceSentencePage.errorSummary.locator).toBeVisible()
    await expect(offenceSentencePage.errorSummary.title).toHaveText('There is a problem')
    await expect(offenceSentencePage.errorSummary.items).toHaveCount(1)
    await expect(page.locator('.govuk-error-message').filter({ hasText: NO_SELECTION_ERROR_MESSAGE })).toBeVisible()
  })

  test('shows validation error when Yes is selected and details are blank', async ({ page }) => {
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { sentenceEndDate: '2026-06-01', expectedReleaseDate: undefined } }),
    )

    await offenceSentencePage.selectYes()
    await offenceSentencePage.clickSaveAndContinue()

    await expect(page).toHaveURL(OffenceSentencePage.url())
    await expect(offenceSentencePage.errorSummary.locator).toBeVisible()
    await expect(offenceSentencePage.errorSummary.items).toHaveCount(1)
    await expect(offenceSentencePage.licenceConditionsDetailsTextArea).toBeVisible()
    await expect(page.locator('.govuk-error-message').filter({ hasText: DETAILS_EMPTY_ERROR_MESSAGE })).toBeVisible()
  })

  test('navigates back to service days page when Back is clicked', async ({ page }) => {
    await communitySupport.stubGetServiceDaysPage(referralId, {})
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { sentenceEndDate: undefined, expectedReleaseDate: '2026-12-15' } }),
    )

    await offenceSentencePage.clickBackLink()

    await expect(page).toHaveURL(ServiceDaysPage.url())
    await ServiceDaysPage.verifyOnPage(page)
  })

  test('saves No selection and redirects to additional information for delivery partner', async ({ page }) => {
    const response = buildResponse({ offenceSentenceInfo: { hasLicenceConditionsOrZones: false } })
    await communitySupport.stubUpdateOffenceSentencePage(referralId, response)
    await communitySupport.stubGetAdditionalInformationForTheDeliveryPartnerPage(referralId, {
      refereeName: { firstName: baseResponse.firstName, lastName: baseResponse.lastName },
      details: { selected: 'Unanswered' },
    })
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { sentenceEndDate: '2026-06-01', expectedReleaseDate: undefined } }),
    )

    await offenceSentencePage.selectNo()
    await offenceSentencePage.clickSaveAndContinue()

    await expect(page).toHaveURL('/referral/task-list/additional-information-for-the-delivery-partner')

    const matchingRequests = await getMatchingRequests({
      method: 'PATCH',
      urlPathPattern: `/community-support/draft-referral/${referralId}/offence-sentence`,
    })

    const [savedRequest] = matchingRequests.body.requests
    expect(JSON.parse(savedRequest.body)).toEqual({
      hasLicenceConditionsOrZones: false,
      licenceConditionsOrZonesDetails: null,
    } satisfies OffenceSentenceRequest)
  })

  test('saves Yes selection with details and redirects to additional information for delivery partner', async ({
    page,
  }) => {
    const response = buildResponse({ offenceSentenceInfo: { hasLicenceConditionsOrZones: true } })
    await communitySupport.stubUpdateOffenceSentencePage(referralId, response)
    await communitySupport.stubGetAdditionalInformationForTheDeliveryPartnerPage(referralId, {
      refereeName: { firstName: baseResponse.firstName, lastName: baseResponse.lastName },
      details: { selected: 'Unanswered' },
    })
    const offenceSentencePage = await goToOffenceSentencePage(
      page,
      buildResponse({ offenceSentenceInfo: { sentenceEndDate: undefined, expectedReleaseDate: '2026-12-15' } }),
    )

    await offenceSentencePage.selectYes()
    await offenceSentencePage.fillDetails('No contact with victim')
    await offenceSentencePage.clickSaveAndContinue()

    await expect(page).toHaveURL('/referral/task-list/additional-information-for-the-delivery-partner')

    const matchingRequests = await getMatchingRequests({
      method: 'PATCH',
      urlPathPattern: `/community-support/draft-referral/${referralId}/offence-sentence`,
    })

    const [savedRequest] = matchingRequests.body.requests
    expect(JSON.parse(savedRequest.body)).toEqual({
      hasLicenceConditionsOrZones: true,
      licenceConditionsOrZonesDetails: 'No contact with victim',
    } satisfies OffenceSentenceRequest)
  })
})

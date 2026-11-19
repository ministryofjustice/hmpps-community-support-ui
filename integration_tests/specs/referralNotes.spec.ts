import { test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ReferralNotesPage from '../pages/referralNotesPage'
import { referralInformationInCommunity } from '../mockData/referralInformationData'

test.describe('Referral Notes Page', () => {
  const caseReference = 'AB1234CD'

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  // Can be replaced or extended into future tests for journeys.
  test('loads the notes page', async ({ page }) => {
    await communitySupport.stubGetReferralNotes(
      { content: [], page: 0, size: 25, totalElements: 0, totalPages: 0 },
      caseReference,
    )
    await communitySupport.stubGetReferralInformation(200, caseReference, referralInformationInCommunity)
    await page.goto(ReferralNotesPage.url(caseReference))

    const notesPage = new ReferralNotesPage(page)
    await notesPage.verifyOnPage()
  })
})

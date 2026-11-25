import { expect, test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ReferralNotesPage from '../pages/referralNotesPage'
import ReferralNoteTypePage from '../pages/referralNoteTypePage'
import ReferralPathwaysPage from '../pages/referralPathwaysPage'
import { referralInformationInCommunity } from '../mockData/referralInformationData'
import ReferralCaseNoteDetailsPage from '../pages/referralCaseNoteDetailsPage'

test.describe('Referral Notes Page', () => {
  const caseReference = 'AB1234CD'

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
  })

  test('creates a case note through the notes, note type, pathway and details pages', async ({ page }) => {
    await communitySupport.stubGetReferralNotes(
      { content: [], page: 0, size: 25, totalElements: 0, totalPages: 0 },
      caseReference,
    )
    await communitySupport.stubGetReferralInformation(200, caseReference, referralInformationInCommunity)
    await communitySupport.stubGetReferralPathways(
      {
        pathways: [
          { id: '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', title: 'Accommodation' },
          { id: '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22', title: 'Employment' },
        ],
      },
      caseReference,
    )
    await page.goto(ReferralNotesPage.url(caseReference))

    const notesPage = new ReferralNotesPage(page)
    await notesPage.verifyOnPage()
    await notesPage.addNoteButton.click()

    const noteTypePage = new ReferralNoteTypePage(page)
    await noteTypePage.verifyOnPage()
    await noteTypePage.selectCaseNote()
    await noteTypePage.continue()

    const pathwaysPage = new ReferralPathwaysPage(page)
    await pathwaysPage.verifyCaseNoteOnPage()
    await expect(pathwaysPage.pathwayCheckbox('Accommodation')).toBeVisible()
    await expect(pathwaysPage.pathwayCheckbox('Employment')).toBeVisible()
    await pathwaysPage.pathwayCheckbox('Accommodation').check()
    await pathwaysPage.continue()

    const caseNoteDetailsPage = new ReferralCaseNoteDetailsPage(page)
    await caseNoteDetailsPage.verifyOnPage()
    await caseNoteDetailsPage.titleInput.fill('Case note title')
    await caseNoteDetailsPage.detailsInput.fill('Case note details')
    await caseNoteDetailsPage.shouldNotify()
    await caseNoteDetailsPage.continue()
  })

  test('creates a non-contact activity note without the does not relate option', async ({ page }) => {
    await communitySupport.stubGetReferralNotes(
      { content: [], page: 0, size: 25, totalElements: 0, totalPages: 0 },
      caseReference,
    )
    await communitySupport.stubGetReferralInformation(200, caseReference, referralInformationInCommunity)
    await communitySupport.stubGetReferralPathways(
      {
        pathways: [
          { id: '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', title: 'Accommodation' },
          { id: '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22', title: 'Employment' },
        ],
      },
      caseReference,
    )
    await page.goto(ReferralNotesPage.url(caseReference))

    const notesPage = new ReferralNotesPage(page)
    await notesPage.verifyOnPage()
    await notesPage.addNoteButton.click()

    const noteTypePage = new ReferralNoteTypePage(page)
    await noteTypePage.verifyOnPage()
    await noteTypePage.selectNonContactActivity()
    await noteTypePage.continue()

    const pathwaysPage = new ReferralPathwaysPage(page)
    await pathwaysPage.verifyNonContactSessionOnPage()
    await expect(pathwaysPage.pathwayCheckbox('Accommodation')).toBeVisible()
    await expect(pathwaysPage.pathwayCheckbox('Employment')).toBeVisible()
  })
})

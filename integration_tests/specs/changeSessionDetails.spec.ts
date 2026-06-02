import { expect, test } from '@playwright/test'

import { login, randomCaseReferenceId, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import InitialContactSessionDetailsPage from '../pages/InitialContactSessionDetailsPage'
import prisonApi from '../mockApis/prisonApi'
import { probationOfficesData } from '../mockData/referenceData'
import ChangeIcsDetailsPage from '../pages/ChangeIcsDetailsPage'

test.describe('Change Session Details Page', () => {
  const virtual = {
    caseRefId: randomCaseReferenceId(),
    data: initialContactSessionDetailsPageData.virtual(),
  } as const

  const inPerson = {
    caseRefId: randomCaseReferenceId(),
    data: initialContactSessionDetailsPageData.inPerson(),
  } as const

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await Promise.all([
      communitySupport.stubGetICS(virtual.caseRefId, virtual.data),
      communitySupport.stubGetICS(inPerson.caseRefId, inPerson.data),
      communitySupport.stubGetReferralInformation(200, virtual.caseRefId),
      prisonApi.stubGetPrisons(),
      communitySupport.stubGetProbationOffices(probationOfficesData),
    ])
    await page.goto('/')
    await login(page)
  })

  // IPB-2365 - AC1
  test('Navigate to Change Session Details Screen', async ({ page }) => {
    await test.step('given I\'m on the "View or change session details" screen', async () => {
      await page.goto(InitialContactSessionDetailsPage.url(virtual.caseRefId))
    })
    await test.step('when I select to change the scheduled ICS details', async () => {
      const icsDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
      await icsDetailsPage.changeLink.click()
      expect(page).toHaveURL(ChangeIcsDetailsPage.url(virtual.caseRefId))
    })
  })
})

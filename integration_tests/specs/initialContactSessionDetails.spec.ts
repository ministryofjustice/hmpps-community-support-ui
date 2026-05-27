import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import initialContactSessionDetailsPageData from '../mockData/initialContactSessionDetailsPageData'
import InitialContactSessionDetailsPage from '../pages/InitialContactSessionDetailsPage'
import ReferralProgressPage from '../pages/referralProgressPage'
import prisonApi from '../mockApis/prisonApi'
import { probationOfficesData } from '../mockData/referenceData'
import { referralInformationInPrison, referralInformationInPrisonCustom } from '../mockData/referralInformationData'

test.describe('Initial Contact Session Details Page', () => {
  const virtual = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.virtual(),
  } as const

  const inPerson = {
    caseRefId: randomUUID(),
    data: initialContactSessionDetailsPageData.inPerson(),
  } as const

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetICS(virtual.caseRefId, virtual.data)
    await communitySupport.stubGetICS(inPerson.caseRefId, inPerson.data)
    await page.goto('/')
    await login(page)
  })

  test('should display the page - virtual', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(InitialContactSessionDetailsPage.url(virtual.caseRefId))
    })
    await InitialContactSessionDetailsPage.verifyOnPage(page)
  })

  test('should display the page - in person', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(InitialContactSessionDetailsPage.url(inPerson.caseRefId))
    })
    await InitialContactSessionDetailsPage.verifyOnPage(page)
  })

  // IPB-2130:AC2
  test('Heading', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(InitialContactSessionDetailsPage.url(virtual.caseRefId))
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    await expect(referralDetailsPage.header).toHaveText('View or change session details')
  })

  // IPB-2130:AC3
  test('Navigate back', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(InitialContactSessionDetailsPage.url(virtual.caseRefId))
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    const backlink = referralDetailsPage.backLink
    await test.step('check backlink', async () => {
      await backlink.click()
      await expect(page).toHaveURL(ReferralProgressPage.url(virtual.data.referralId))
    })
  })

  // IPB-2130:AC4
  test('View ICS details - virtual', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(InitialContactSessionDetailsPage.url(virtual.caseRefId))
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    const summary = referralDetailsPage.details
    await test.step('summary has required number of rows', () => {
      expect(summary.rows).toHaveLength(5)
    })
    await test.step('I can see the details I entered, including:', async () => {
      const { rows } = summary
      await test.step('summary has required number of rows', () => {
        expect(rows).toHaveLength(5)
      })
      await test.step('Date', async () => {
        await expect(rows[0].key).toHaveText('Date')
      })
      await test.step('Start time', async () => {
        await expect(rows[1].key).toHaveText('Start time')
      })
      await test.step('Method', async () => {
        await expect(rows[2].key).toHaveText('Method')
      })
      await test.step('Reason session is not in person', async () => {
        await expect(rows[3].key).toHaveText('Reason session is not in person')
      })
      await test.step('How [First Name] was informed about the session', async () => {
        await expect(rows[4].key).toHaveText(`How ${virtual.data.referralFirstName} was informed about the session`)
      })
    })
  })
  // IPB-2130:AC4
  test('View ICS details - in person', async ({ page }) => {
    await test.step('go to initial contact session details page', async () => {
      await page.goto(InitialContactSessionDetailsPage.url(inPerson.caseRefId))
    })
    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    const summary = referralDetailsPage.details
    await test.step('summary has required number of rows', () => {
      expect(summary.rows).toHaveLength(5)
    })
    await test.step('I can see the details I entered, including:', async () => {
      const { rows } = summary
      await test.step('summary has required number of rows', () => {
        expect(rows).toHaveLength(5)
      })
      await test.step('Date', async () => {
        await expect(rows[0].key).toHaveText('Date')
      })
      await test.step('Start time', async () => {
        await expect(rows[1].key).toHaveText('Start time')
      })
      await test.step('Method', async () => {
        await expect(rows[2].key).toHaveText('Method')
      })
      await test.step('Location', async () => {
        await expect(rows[3].key).toHaveText('Location')
      })
      await test.step('How [First Name] was informed about the session', async () => {
        await expect(rows[4].key).toHaveText(`How ${inPerson.data.referralFirstName} was informed about the session`)
      })
    })
  })
  test('Change details new', async ({ page }) => {
    console.log('caseref :', inPerson.caseRefId)
    await prisonApi.stubGetPrisons()
    await communitySupport.stubGetProbationOffices(probationOfficesData)
    const { referralId } = inPerson.data
    console.log('referralId :', referralId)
    const data = referralInformationInPrisonCustom(inPerson.caseRefId, referralId)
    console.log('data :', data)
    await communitySupport.stubGetReferralInformation(200, referralId, data)

    console.log('caseref :', inPerson.caseRefId)
    const url = InitialContactSessionDetailsPage.url(inPerson.caseRefId)
    console.log('url :', url)
    await page.goto(url)

    const referralDetailsPage = await InitialContactSessionDetailsPage.verifyOnPage(page)
    await referralDetailsPage.clickChange()
  })
})

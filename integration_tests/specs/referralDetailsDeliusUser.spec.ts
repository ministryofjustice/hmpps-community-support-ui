import { expect, test } from '@playwright/test'

import { differenceInYears, format } from 'date-fns'
import { randomUUID } from 'node:crypto'
import { loginDeliusUser, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import ReferralDetailsPage from '../pages/referralDetailsPage'
import referralDetailsPageData from '../mockData/referralDetailsPageData'
import CaseListPage from '../pages/caseListPage'

test.describe('Referral Details Page as a Delius User', () => {
  const dateFormatStr = 'd MMMM uuuu'
  const id = randomUUID()
  const referralDetailsPageMockData = referralDetailsPageData(id)

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetReferralDetailsPage(200, id)
    await page.goto('/')
    await loginDeliusUser(page)
    await test.step('go to referral details page', async () => {
      await page.goto(ReferralDetailsPage.url(id))
    })
  })

  test('should display the page', async ({ page }) => {
    await ReferralDetailsPage.verifyOnPage(page)
  })
  // IPB-1940:AC1
  test('should display the heading with the correct content', async ({ page }) => {
    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    expect(referralDetailsPage.header).toHaveText(
      `Referral for ${referralDetailsPageMockData.personDetailsTableData.name}`,
    )
  })
  // IPB-1940:AC2
  test('back link should navigate to the correct page', async ({ page }) => {
    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    await test.step('click back link', async () => {
      await referralDetailsPage.backLink.click()
    })
    await test.step('should be on cases screen', async () => {
      await expect(page).toHaveURL(CaseListPage.url('unassigned'))
    })
  })
  // IPB-1940:AC3
  test('Referral Details Sections', async ({ page }) => {
    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    await test.step('personal details summary', async () => {
      const summary = referralDetailsPage.personalDetailsSummary
      await test.step('title should be "Personal details"', () => {
        expect(summary.title).toHaveText('Personal details')
      })
      await test.step('summary has required number of rows', () => {
        expect(summary.rows).toHaveLength(5)
      })
      await test.step('First row should be the name field', () => {
        const row = summary.rows[0]
        expect(row.key).toHaveText('Name')
        expect(row.value).toHaveText(referralDetailsPageMockData.personDetailsTableData.name)
      })
      await test.step('Second row should be the crn field', () => {
        const row = summary.rows[1]
        expect(row.key).toHaveText('CRN')
        expect(row.value).toHaveText(referralDetailsPageMockData.personDetailsTableData.crn)
      })
      await test.step('Third row should be the date of birth field', () => {
        const row = summary.rows[2]
        expect(row.key).toHaveText('Date of birth')
        const { dateOfBirth } = referralDetailsPageMockData.personDetailsTableData
        const age = differenceInYears(new Date(), dateOfBirth)
        const date = format(dateOfBirth, dateFormatStr)
        expect(row.value).toHaveText(`${date} (${age} years old)`)
      })
      await test.step('Fourth row should be the preferred language field', () => {
        const row = summary.rows[3]
        expect(row.key).toHaveText('Preferred language')
        expect(row.value).toHaveText(referralDetailsPageMockData.personDetailsTableData.preferredLanguage)
      })
      await test.step('Fifth row should be the disabilities field', () => {
        const row = summary.rows[4]
        expect(row.key).toHaveText('Disabilities')
        expect(row.value).toHaveText(referralDetailsPageMockData.personDetailsTableData.disabilities)
      })
    })
    await test.step('equality monitoring summary', async () => {
      const summary = referralDetailsPage.equalityMonitoringSummary
      await test.step('title should be "Equality monitoring"', () => {
        expect(summary.title).toHaveText('Equality monitoring')
      })
      await test.step('summary has required number of rows', () => {
        expect(summary.rows).toHaveLength(6)
      })
      await test.step('First row should be the ethnicity field', () => {
        const row = summary.rows[0]
        expect(row.key).toHaveText('Ethnicity')
        expect(row.value).toHaveText(referralDetailsPageMockData.equalityDetailsTableData.ethnicity!)
      })
      await test.step('Second row should be the religion or belief field', () => {
        const row = summary.rows[1]
        expect(row.key).toHaveText('Religion or belief')
        expect(row.value).toHaveText(referralDetailsPageMockData.equalityDetailsTableData.religionOrBelief!)
      })
      await test.step('Third row should be the sex field', () => {
        const row = summary.rows[2]
        expect(row.key).toHaveText('Sex')
        expect(row.value).toHaveText(referralDetailsPageMockData.equalityDetailsTableData.sex)
      })
      await test.step('Fourth row should be the gender identity field', () => {
        const row = summary.rows[3]
        expect(row.key).toHaveText('Gender identity')
        expect(row.value).toHaveText(referralDetailsPageMockData.equalityDetailsTableData.genderIdentity)
      })
      await test.step('Fifth row should be the sexual orientation field', () => {
        const row = summary.rows[4]
        expect(row.key).toHaveText('Sexual orientation')
        expect(row.value).toHaveText(referralDetailsPageMockData.equalityDetailsTableData.sexualOrientation)
      })
      await test.step('Sixth row should be the transgender field', () => {
        const row = summary.rows[5]
        expect(row.key).toHaveText('Transgender')
        expect(row.value).toHaveText(referralDetailsPageMockData.equalityDetailsTableData.transgender)
      })
    })
    await test.step('contact details summary', async () => {
      const summary = referralDetailsPage.contactDetailsSummary
      await test.step('title should be "Contact details"', () => {
        expect(summary.title).toHaveText('Contact details')
      })
      await test.step('summary has required number of rows', () => {
        expect(summary.rows).toHaveLength(4)
      })
      await test.step('First row should be the phone number field', () => {
        const row = summary.rows[0]
        expect(row.key).toHaveText('Phone number')
        expect(row.value).toHaveText(referralDetailsPageMockData.contactDetailsTableData.phoneNumber as string)
      })
      await test.step('Second row should be the mobile number field', () => {
        const row = summary.rows[1]
        expect(row.key).toHaveText('Mobile number')
        expect(row.value).toHaveText(referralDetailsPageMockData.contactDetailsTableData.mobileNumber as string)
      })
      await test.step('Third row should be the email address field', () => {
        const row = summary.rows[2]
        expect(row.key).toHaveText('Email address')
        expect(row.value).toHaveText(referralDetailsPageMockData.contactDetailsTableData.email as string)
      })
      await test.step('Fourth row should be the main address field', () => {
        const row = summary.rows[3]
        expect(row.key).toHaveText('Main address')
        expect(row.value).toHaveText(referralDetailsPageMockData.contactDetailsTableData.address as string)
      })
    })
    await test.step('referral details summary', async () => {
      const summary = referralDetailsPage.referralDetailsSummary
      await test.step('title should be "Referral details"', () => {
        expect(summary.title).toHaveText('Referral details')
      })
      await test.step('summary has required number of rows', () => {
        expect(summary.rows).toHaveLength(2)
      })
      await test.step('First row should be the referral date field', () => {
        const row = summary.rows[0]
        expect(row.key).toHaveText('Referral date')
        expect(row.value).toHaveText(
          format(referralDetailsPageMockData.referralDetailsTableData.referralDate, dateFormatStr),
        )
      })
      await test.step('Second row should be the assigned to field', () => {
        const row = summary.rows[1]
        expect(row.key).toHaveText('Assigned to')
        const assignedTo = 'Unassigned'
        expect(row.value).toHaveText(assignedTo)
      })
    })
  })
  // IPB-1940:AC4
  test('Calculated age', async ({ page }) => {
    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    await test.step('personal details summary', async () => {
      const summary = referralDetailsPage.personalDetailsSummary
      await test.step('Age should be displayed along with date of birth', () => {
        const row = summary.rows[2]
        expect(row.key).toHaveText('Date of birth')
        const { dateOfBirth } = referralDetailsPageMockData.personDetailsTableData
        const age = differenceInYears(new Date(), dateOfBirth)
        const date = format(dateOfBirth, dateFormatStr)
        expect(row.value).toHaveText(`${date} (${age} years old)`)
      })
    })
  })
  // IPB-1940:AC5 - !!! No disabilities date yet !!!
  test.skip('Disabilities last updated date', () => {
    /*
    Given I’m viewing the Personal details section
    When I’m viewing the Disabilities information
    Then I can see the date it was last updated on NDelius
    And the date is displayed in the format: DD Month YYYY (e.g. 7 January 2026)
    */
  })
  // IPB-1940:AC6 - !!! No main address date yet !!!
  test.skip('Main address last updated date', () => {
    /*
    Given I’m viewing the Contact details section
    When I’m viewing the Main Address
    Then I can see the date it was last updated on NDelius
    And the date is displayed in the format: DD Month YYYY (e.g. 7 January 2026)
    */
  })
  // IPB-1940:AC7 - !!! Start date and Notes data not available !!!
  test.skip('Main address details', () => {
    /*
    Given I’m viewing the Contact details section
    When I’m viewing the Main Address
    Then I can see:
    Main address
    Type of address (from nDelius)
    Start date (from nDelius)
    Notes (from nDelius)
    */
  })

  test('Assign caseworker navigation should not be visible', async ({ page }) => {
    const referralDetailsPage = await ReferralDetailsPage.verifyOnPage(page)
    const row = referralDetailsPage.referralDetailsSummary.rows[1]
    const action = row.actions[0]
    await test.step('check link has correct text', () => {
      expect(action).toBeHidden()
    })
  })
})

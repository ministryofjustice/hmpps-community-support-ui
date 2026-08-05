import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'
import HomePage from '../pages/homePage'
import FindPersonPage from '../pages/findPersonPage'

// These tests will have to move to end to end testing

test.describe('Task List Journey', () => {
  const referralId = randomUUID()
  const crn = 'X320741'
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubGetPerson()
    await communitySupport.stubGetCommunitySupportServicesTwoOptions()
    await communitySupport.stubCreateReferral({
      referralId,
      personId: '',
      referralDate: '',
      personIdentifier: '',
      communityServiceProviderId: '',
      communityServiceProviderName: '',
      region: '',
      deliveryPartner: '',
    })
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: {
        completed: false,
        statusText: 'Incomplete',
        tag: 'govuk-tag--blue',
      },
      checkRiskInformationCompleted: {
        completed: false,
        statusText: 'Incomplete',
        tag: 'govuk-tag--blue',
      },
      selectThePersonsNeedsCompleted: {
        completed: false,
        statusText: 'Incomplete',
        tag: 'govuk-tag--blue',
      },
      addDetailsOfAnyAdditionalSupportNeedsCompleted: {
        completed: false,
        statusText: 'Incomplete',
        tag: 'govuk-tag--blue',
      },
      addDetailsOfMainPointOfContactCompleted: {
        completed: false,
        statusText: 'Incomplete',
        tag: 'govuk-tag--blue',
      },
    })
    await page.goto(HomePage.url())
    await login(page)
    await test.step('go to task list page', async () => {
      await test.step('select make a referal', async () => {
        const pom = await HomePage.verifyOnPage(page)
        await pom.clickMakeAReferralTile()
      })
      await test.step('find a person', async () => {
        const pom = await FindPersonPage.verifyOnPage(page)
        await pom.enterIdentifyierAndContinue('X320741')
      })
      await test.step('confirm person', async () => {
        await expect(page.getByRole('heading', { name: 'Confirm this is the correct' })).toBeVisible()
        await page.getByRole('button', { name: 'Continue' }).click()
      })
      await test.step('service select', async () => {
        await expect(page.getByRole('heading', { name: 'Select the Community Support' })).toBeVisible()
        await page.getByRole('radio', { name: 'First Accommodation support' }).check()
        await page.getByRole('button', { name: 'Continue' }).click()
      })
      await test.step('confirm task list page', async () => {
        await expect(page.getByRole('heading', { name: 'Make a referral' })).toBeVisible()
      })
    })
  })

  test('change service provider', async ({ page }) => {
    await test.step('select back', async () => {
      const taskListPom = await TaskListPage.verifyOnPage(page)
      await taskListPom.clickBackLink()
    })
    await test.step('service select', async () => {
      await expect(page.getByRole('heading', { name: 'Select the Community Support' })).toBeVisible()
      await page.getByRole('radio', { name: 'Second Accommodation support' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    await test.step('on task list page', async () => {
      await TaskListPage.verifyOnPage(page)
    })
  })

  test('confirm personal details', async ({ page }) => {
    await communitySupport.stubGetConfirmPersonalDetailsData(referralId, {
      id: '',
      personalDetails: {
        firstName: 'Alex',
        middleNames: '',
        lastName: 'Rivers',
        crn,
        prisonNumbers: [],
        dateOfBirth: '2026-07-27T13:36:00Z',
        preferredLanguage: 'English',
        currentCircumstances: {
          updatedAt: '2026-07-27T13:36:00Z',
          value: 'none',
        },
        disabilities: {
          updatedAt: '2026-07-27T13:36:00Z',
          allDisabilities: 'none',
        },
      },
      equalityMonitoring: {
        ethnicity: 'White',
        genderIdentity: 'Male',
        nationalities: ['British'],
        religionOrBelief: 'Christian',
        sex: 'Male',
        sexualOrientation: 'Hetrosexual',
        transgender: 'yes',
      },
      contactDetails: {
        phoneNumber: '',
        mobileNumber: '',
        emailAddress: '',
        address: {
          updatedAt: '2026-07-27T13:36:00Z',
          value: '',
          type: '',
          startAt: '2026-07-27T13:36:00Z',
          notes: 'some notes',
          noFixedAbode: true,
        },
      },
    })

    await test.step('select confirm personal details task', async () => {
      const taskListPom = await TaskListPage.verifyOnPage(page)
      await taskListPom.clickPersonalDetailsTask()
    })
    await test.step('confirm personal details page', async () => {
      await expect(page.getByRole('heading', { name: 'Confirm personal details' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    await test.step('return to task list', async () => {
      await communitySupport.stubGetTaskListStatus(referralId, {
        fullName: 'Alex Rivers',
        confirmPersonalDetailsCompleted: {
          completed: true,
          statusText: '',
          tag: undefined,
        },
        checkRiskInformationCompleted: {
          completed: false,
          statusText: '',
          tag: undefined,
        },
        selectThePersonsNeedsCompleted: {
          completed: false,
          statusText: '',
          tag: undefined,
        },
        addDetailsOfAnyAdditionalSupportNeedsCompleted: {
          completed: false,
          statusText: '',
          tag: undefined,
        },
        addDetailsOfMainPointOfContactCompleted: {
          completed: false,
          statusText: '',
          tag: undefined,
        },
      })
      await TaskListPage.verifyOnPage(page)
    })
  })

  // AC4 - Display incomplete status for Additional Support Needs
  // AC9 - Persist incomplete status
  test('should display Incomplete status for additional support needs task', async ({ page }) => {
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
  })

  // AC5 - Navigate to Additional support needs
  test('should navigate to additional support needs screen when link is clicked', async ({ page }) => {
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
      refereeName: { firstName: 'Alex', lastName: 'Rivers' },
      physicalHealth: { selected: false, value: null },
      mentalEmotionalHealth: { selected: false, value: null },
      neurodiversity: { selected: false, value: null },
      locationTravel: { selected: false, value: null },
      caringResponsibilities: { selected: false, value: null },
      employmentResponsibilities: { selected: false, value: null },
      diversity: { selected: false, value: null },
      anythingElse: { selected: false, value: null },
      needsAdditionalSupport: null,
    })
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.clickAddSupportNeedsTask()
    await expect(page).toHaveURL(/additional-support-needs/)
    await expect(
      page.getByRole('heading', { name: 'What does Alex need support with to attend or take part in sessions?' }),
    ).toBeVisible()
  })

  // AC8 - Persist completed status
  test('should display Completed status for additional support needs task when it has been completed', async ({
    page,
  }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      checkRiskInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfAnyAdditionalSupportNeedsCompleted: {
        completed: true,
        statusText: 'Completed',
        tag: undefined,
      },
      addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    })
    await page.goto('/referral/task-list')
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
  })

  // AC10 - Maintain Completed Status When Revisiting additional support needs Task
  test('should maintain Completed status when revisiting additional support needs task', async ({ page }) => {
    await communitySupport.stubGetTaskListStatus(referralId, {
      fullName: 'Alex Rivers',
      confirmPersonalDetailsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      checkRiskInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfAnyAdditionalSupportNeedsCompleted: {
        completed: true,
        statusText: 'Completed',
        tag: undefined,
      },
      addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    })
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
      refereeName: { firstName: 'Alex', lastName: 'Rivers' },
      physicalHealth: { selected: false, value: null },
      mentalEmotionalHealth: { selected: false, value: null },
      neurodiversity: { selected: false, value: null },
      locationTravel: { selected: false, value: null },
      caringResponsibilities: { selected: false, value: null },
      employmentResponsibilities: { selected: false, value: null },
      diversity: { selected: false, value: null },
      anythingElse: { selected: false, value: null },
      needsAdditionalSupport: null,
    })
    await page.goto('/referral/task-list')
    const taskListPom = await TaskListPage.verifyOnPage(page)
    await taskListPom.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
    await taskListPom.clickAddSupportNeedsTask()
    await expect(page).toHaveURL(/additional-support-needs/)
    await expect(
      page.getByRole('heading', { name: 'What does Alex need support with to attend or take part in sessions?' }),
    ).toBeVisible()
    await page.goto('/referral/task-list')
    await TaskListPage.verifyOnPage(page)
    await taskListPom.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
  })
})

test.describe.skip('Task List Page', () => {
  /* const mockReferralId = referralInformationTaskList.referralId
  const mockPersonId = randomUUID()
   const mockReferralDetailsInCommunity = {
    personDetails: {
      id: mockPersonId,
      personIdentifier: 'A123456',
      firstName: 'Alex',
      lastName: 'River',
      dateOfBirth: '20 Feb 1975 (51 years old)',
      sex: 'Male',
    },
    communityServiceProviderId: 'csp-id-123',
    crn: 'A123456',
  } */

  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await communitySupport.stubCreateReferral(referralInformationTaskList)
    await communitySupport.stubGetPerson()
    await communitySupport.stubGetCommunitySupportServices()
    await page.goto(HomePage.url())
    await login(page)
  })

  test.skip('should display task list correctly', async ({ page }) => {
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Incomplete')
    await taskListPage.verifyTaskStatus('Referral information', `Select the person's needs`, 'Incomplete')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus(
      'Referral contact details',
      'Add details of main point of contact',
      'Incomplete',
    )
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Cannot start yet')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test.skip('should display check answers status correctly after updated all task status to completed', async ({
    page,
  }) => {
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', 'Check risk information', 'Completed')
    await taskListPage.verifyTaskStatus('Referral information', `Select the person's needs`, 'Completed')
    await taskListPage.verifyTaskStatus(
      'Referral information',
      'Add details of any additional support needs',
      'Completed',
    )
    await taskListPage.verifyTaskStatus('Referral contact details', 'Add details of main point of contact', 'Completed')
    await taskListPage.verifyTaskStatus('Check answers and submit', 'Check answers and submit', 'Completed')
    await taskListPage.verifyCheckAnswersLink(referralInformationTaskList.referralId)
  })

  test.skip('should navigate to sub tasks', async ({ page }) => {
    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.clickPersonalDetailsTask()
    await expect(taskListPage.page).toHaveURL(/personal-details/)

    await taskListPage.page.goBack()
    await taskListPage.clickCheckRiskInformationTask()
    await expect(taskListPage.page).toHaveURL(/risk-information/)
  })
})

import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { addMonths } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import communitySupport from '../mockApis/communitySupport'
import { referralInformationTaskList } from '../mockData/referralInformationData'
import TaskListPage from '../pages/TaskListPage'
import HomePage from '../pages/homePage'
import FindPersonPage from '../pages/findPersonPage'
import ConfirmPersonalDetailsPage from '../pages/ConfirmPersonalDetailsPage'
import AdditionalSupportNeedsPage from '../pages/AdditionalSupportNeedsPage'
import NeedsAnInterpreterPage from '../pages/NeedsAnInterpreterPage'
import ServiceEndDatePage from '../pages/ServiceEndDatePage'
import ServiceDaysPage from '../pages/ServiceDaysPage'

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
      selectAnAreaForReferralCompleted: {
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
      addAdditionalInformationCompleted: {
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
      await test.step('select make a referral', async () => {
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
      await test.step('confirm task list page', async () => {
        await TaskListPage.verifyOnPage(page)
      })
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
        nationalities: ['British'],
        religionOrBelief: 'Christian',
        sex: 'Male',
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
      const pom = await ConfirmPersonalDetailsPage.verifyOnPage(page)
      await expect(page.getByText('Gender identity', { exact: true })).toHaveCount(0)
      await expect(page.getByText('Sexual orientation', { exact: true })).toHaveCount(0)
      await expect(page.getByText('Transgender', { exact: true })).toHaveCount(0)
      await pom.clickContinue()
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
        selectAnAreaForReferralCompleted: {
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
        addAdditionalInformationCompleted: {
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
      physicalHealth: { selected: 'Unanswered' },
      mentalEmotionalHealth: { selected: 'Unanswered' },
      neurodiversity: { selected: 'Unanswered' },
      locationTravel: { selected: 'Unanswered' },
      caringResponsibilities: { selected: 'Unanswered' },
      employmentResponsibilities: { selected: 'Unanswered' },
      diversity: { selected: 'Unanswered' },
      anythingElse: { selected: 'Unanswered' },
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
      selectAnAreaForReferralCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfAnyAdditionalSupportNeedsCompleted: {
        completed: true,
        statusText: 'Completed',
        tag: undefined,
      },
      addAdditionalInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
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
      selectAnAreaForReferralCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfAnyAdditionalSupportNeedsCompleted: {
        completed: true,
        statusText: 'Completed',
        tag: undefined,
      },
      addAdditionalInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
    })
    await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
      refereeName: { firstName: 'Alex', lastName: 'Rivers' },
      physicalHealth: { selected: 'Unanswered' },
      mentalEmotionalHealth: { selected: 'Unanswered' },
      neurodiversity: { selected: 'Unanswered' },
      locationTravel: { selected: 'Unanswered' },
      caringResponsibilities: { selected: 'Unanswered' },
      employmentResponsibilities: { selected: 'Unanswered' },
      diversity: { selected: 'Unanswered' },
      anythingElse: { selected: 'Unanswered' },
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
  test.describe('Additional support needs journey', () => {
    test.beforeEach(async () => {
      await communitySupport.stubGetAdditionalSupportNeeds(referralId, {
        refereeName: { firstName: 'Alex', lastName: 'Rivers' },
        physicalHealth: { selected: 'Unanswered' },
        mentalEmotionalHealth: { selected: 'Unanswered' },
        neurodiversity: { selected: 'Unanswered' },
        locationTravel: { selected: 'Unanswered' },
        caringResponsibilities: { selected: 'Unanswered' },
        employmentResponsibilities: { selected: 'Unanswered' },
        diversity: { selected: 'Unanswered' },
        anythingElse: { selected: 'Unanswered' },
        needsAdditionalSupport: null,
      })
      await communitySupport.stubSubmitAdditionalSupportNeeds(referralId)
      await communitySupport.stubGetNeedsAnInterpreter(referralId, {
        refereeName: { firstName: 'Alex', lastName: 'Rivers' },
        language: { selected: 'No' },
      })
      await communitySupport.stubSubmitNeedsAnInterpreter(referralId)
    })
    test('Additional support needs journey happy path', async ({ page }) => {
      await test.step('select Additional Support Needs', async () => {
        const pom = await TaskListPage.verifyOnPage(page)
        await pom.clickAddSupportNeedsTask()
      })
      await test.step('fill additional support needs', async () => {
        const pom = await AdditionalSupportNeedsPage.verifyOnPage(page, 'Alex', 'Rivers')
        await pom.select('Physical health')
        await pom.fill(
          'Physical health',
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
        )
        await pom.select('Mental or emotional health')
        await pom.fill(
          'Mental or emotional health',
          'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
        )
        await pom.select('Neurodiversity')
        await pom.fill(
          'Neurodiversity',
          'n enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.',
        )
        await pom.select('Location and travel')
        await pom.fill(
          'Location and travel',
          'Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.',
        )
        await pom.select('Caring responsibilities')
        await pom.fill(
          'Caring responsibilities',
          'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.',
        )
        await pom.select('Employment responsibilities')
        await pom.fill(
          'Employment responsibilities',
          'Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.',
        )
        await pom.select('Diversity')
        await pom.fill(
          'Diversity',
          'Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.',
        )
        await pom.select('Anything else')
        await pom.fill(
          'Anything else',
          'Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.',
        )
        await pom.clickSaveAndContinue()
      })
      await test.step('fill in needs an interpreter', async () => {
        const pom = await NeedsAnInterpreterPage.verifyOnPage(page, 'Alex')
        await pom.select('Yes')
        await pom.fill('Chinese (Mandarin)')
        await pom.clickSaveAndContinue()
      })
      await test.step('back to task list', async () => {
        await TaskListPage.verifyOnPage(page)
      })
    })
    test('Additional support needs journey unhappy path missing additional needs text', async ({ page }) => {
      await test.step('select Additional Support Needs', async () => {
        const pom = await TaskListPage.verifyOnPage(page)
        await pom.clickAddSupportNeedsTask()
      })
      await test.step('fill additional support needs', async () => {
        const pom = await AdditionalSupportNeedsPage.verifyOnPage(page, 'Alex', 'Rivers')
        await pom.select('Physical health')
        await pom.fill(
          'Physical health',
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
        )
        await pom.select('Mental or emotional health')
        await pom.fill(
          'Mental or emotional health',
          'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
        )
        await pom.select('Neurodiversity')
        await pom.select('Location and travel')
        await pom.fill(
          'Location and travel',
          'Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.',
        )
        await pom.select('Caring responsibilities')
        await pom.fill(
          'Caring responsibilities',
          'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.',
        )
        await pom.select('Employment responsibilities')
        await pom.fill(
          'Employment responsibilities',
          'Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.',
        )
        await pom.select('Diversity')
        await pom.fill(
          'Diversity',
          'Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.',
        )
        await pom.select('Anything else')
        await pom.fill(
          'Anything else',
          'Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.',
        )
        await pom.clickSaveAndContinue()
      })
      await test.step('error banner', async () => {
        const pom = await AdditionalSupportNeedsPage.verifyOnPage(page, 'Alex', 'Rivers')
        await expect(pom.errorSummary).toBeVisible()
        await test.step('physical health checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Physical health')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
        await test.step('mental health checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Mental or emotional health')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
        await test.step('neurodiversity checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Neurodiversity')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
        await test.step('location and travel checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Location and travel')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
        await test.step('caring responsibilities checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Caring responsibilities')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
        await test.step('employment responsibilities checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Employment responsibilities')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
        await test.step('diversity checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Diversity')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
        await test.step('anything else checkbox is checked', async () => {
          const checkbox = pom.checkboxes.getItem('Anything else')
          expect(checkbox).toBeDefined()
          await expect(checkbox!.input).toBeChecked()
        })
      })
    })
    test('Additional support needs journey unhappy path missing language', async ({ page }) => {
      await test.step('select Additional Support Needs', async () => {
        const pom = await TaskListPage.verifyOnPage(page)
        await pom.clickAddSupportNeedsTask()
      })
      await test.step('fill additional support needs', async () => {
        const pom = await AdditionalSupportNeedsPage.verifyOnPage(page, 'Alex', 'Rivers')
        await pom.select('Physical health')
        await pom.fill(
          'Physical health',
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
        )
        await pom.select('Mental or emotional health')
        await pom.fill(
          'Mental or emotional health',
          'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
        )
        await pom.select('Neurodiversity')
        await pom.fill(
          'Neurodiversity',
          'n enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.',
        )
        await pom.select('Location and travel')
        await pom.fill(
          'Location and travel',
          'Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.',
        )
        await pom.select('Caring responsibilities')
        await pom.fill(
          'Caring responsibilities',
          'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.',
        )
        await pom.select('Employment responsibilities')
        await pom.fill(
          'Employment responsibilities',
          'Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.',
        )
        await pom.select('Diversity')
        await pom.fill(
          'Diversity',
          'Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.',
        )
        await pom.select('Anything else')
        await pom.fill(
          'Anything else',
          'Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.',
        )
        await pom.clickSaveAndContinue()
      })
      await test.step('fill in needs an interpreter', async () => {
        const pom = await NeedsAnInterpreterPage.verifyOnPage(page, 'Alex')
        await pom.select('Yes')
        await pom.clickSaveAndContinue()
      })
      await test.step('page shows errors', async () => {
        const pom = await NeedsAnInterpreterPage.verifyOnPage(page, 'Alex')
        await expect(pom.errorBanner).toBeVisible()
        await test.step('yes radio is checked', async () => {
          const yesRadio = pom.radios.getItem('Yes')
          expect(yesRadio).toBeDefined()
          await expect(yesRadio!.input).toBeChecked()
        })
      })
    })
  })

  test.describe('Additional information journey', () => {
    test.beforeEach(async () => {
      await communitySupport.stubGetServiceEndDatePage(referralId, {
        target_service_completion_date: null,
        target_service_completion_reason: null,
      })
      const validSubmissionReason = 'Unique valid submission reason for AC8'
      const validDate = addMonths(new Date(), 6)

      await communitySupport.stubUpdateServiceEndDatePage(referralId, {
        target_service_completion_date: validDate.toISOString(),
        target_service_completion_reason: validSubmissionReason,
      })
      await communitySupport.stubGetServiceDaysPage(referralId, {})
      await communitySupport.stubUpdateServiceDaysPage(referralId, {
        service_days: 10,
      })
    })

    test('Happy path', async ({ page }) => {
      await test.step('Navigate to service end date', async () => {
        const taskListPage = await TaskListPage.verifyOnPage(page)
        await taskListPage.clickAdditionalReferralInformationTask()
      })

      await test.step('Complete service end date form', async () => {
        const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)
        await serviceEndDatePage.fillTargetCompletionDateSixMonthsFromToday()
        await serviceEndDatePage.fillReason('reason')
        await serviceEndDatePage.clickSaveAndContinue()
      })

      await test.step('Complete service days form', async () => {
        const serviceDaysPage = await ServiceDaysPage.verifyOnPage(page)
        await serviceDaysPage.fillServiceDays('10')
        await serviceDaysPage.clickSaveAndContinue()
      })

      await test.step('TODO check offence and sentence information', async () => {})
    })

    test('Unhappy path service end date', async ({ page }) => {
      await test.step('Navigate to service end date', async () => {
        const taskListPage = await TaskListPage.verifyOnPage(page)
        await taskListPage.clickAdditionalReferralInformationTask()
      })

      await test.step('Complete service end date form', async () => {
        const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)
        await serviceEndDatePage.fillTargetCompletionDateSixMonthsFromToday()
        await serviceEndDatePage.clickSaveAndContinue()

      })
      
      await test.step('page shows errors', async () => {
        const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)
        await expect(serviceEndDatePage.errorMessages).toBeVisible()
      })
    })

    test('Unhappy path service days', async ({ page }) => {
      await test.step('Navigate to service end date', async () => {
        const taskListPage = await TaskListPage.verifyOnPage(page)
        await taskListPage.clickAdditionalReferralInformationTask()
      })

      await test.step('Complete service end date form', async () => {
        const serviceEndDatePage = await ServiceEndDatePage.verifyOnPage(page)
        await serviceEndDatePage.fillTargetCompletionDateSixMonthsFromToday()
        await serviceEndDatePage.fillReason('reason')
        await serviceEndDatePage.clickSaveAndContinue()
      })

      await test.step('Complete service days form', async () => {
        const serviceDaysPage = await ServiceDaysPage.verifyOnPage(page)
        await serviceDaysPage.clickSaveAndContinue()
      })

      await test.step('page shows errors', async () => {
        const serviceDaysPage = await ServiceDaysPage.verifyOnPage(page)
        await expect(serviceDaysPage.errorMessages).toBeVisible()
      })
    })
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

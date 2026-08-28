import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { login, resetStubs, seedSessionRiskSummary } from '../testUtils'
import { getMatchingRequests } from '../mockApis/wiremock'
import communitySupport from '../mockApis/communitySupport'
import TaskListPage from '../pages/TaskListPage'
import ConfirmPersonalDetailsPage from '../pages/ConfirmPersonalDetailsPage'

const referralId = randomUUID()

const incompleteStatus = { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' }
const completedStatus = { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' }

const stubTaskListStatus = async (confirmPersonalDetailsCompleted?: typeof incompleteStatus) => {
  await communitySupport.stubGetTaskListStatus(referralId, {
    fullName: 'Alex Rivers',
    confirmPersonalDetailsCompleted,
    checkRiskInformationCompleted: incompleteStatus,
    selectThePersonsNeedsCompleted: incompleteStatus,
    addDetailsOfAnyAdditionalSupportNeedsCompleted: incompleteStatus,
    addDetailsOfMainPointOfContactCompleted: incompleteStatus,
    addAdditionalInformationCompleted: incompleteStatus,
    selectAnAreaForReferralCompleted: incompleteStatus,
  })
}

const stubConfirmPersonalDetailsData = async () => {
  await communitySupport.stubGetConfirmPersonalDetailsData(referralId, {
    id: '',
    personalDetails: {
      firstName: 'Alex',
      middleNames: '',
      lastName: 'Rivers',
      crn: 'X320741',
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
}

const countWriteRequests = async (method: 'POST' | 'PUT' | 'PATCH') => {
  const matchingRequests = await getMatchingRequests({
    method,
    urlPathPattern: '/community-support/(draft-referral|referral)/.*',
  })

  return matchingRequests.body.requests.length as number
}

test.describe('Confirm personal details task - E2E AC coverage', () => {
  test.beforeEach(async ({ page }) => {
    await resetStubs()
    await page.goto('/')
    await login(page)
    await seedSessionRiskSummary(page, referralId)
  })

  test('AC1: should display Confirm personal details as Completed on task list', async ({ page }) => {
    await stubTaskListStatus(completedStatus)

    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)

    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')
  })

  test('AC2: should display Completed regardless of backend completion record', async ({ page }) => {
    await stubTaskListStatus(incompleteStatus)

    await page.goto(TaskListPage.url())
    let taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')

    await stubTaskListStatus(undefined)
    await page.goto(TaskListPage.url())
    taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')
  })

  test('AC3: should navigate to Confirm personal details page from task list and return back', async ({ page }) => {
    await stubTaskListStatus(incompleteStatus)
    await stubConfirmPersonalDetailsData()

    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)

    await taskListPage.clickConfirmPersonalDetailsTask()
    const confirmPersonalDetailsPage = await ConfirmPersonalDetailsPage.verifyOnPage(page)

    await confirmPersonalDetailsPage.clickContinue()
    await expect(page).toHaveURL(TaskListPage.url())
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')
  })

  test('AC4: should not persist referral data to display Confirm personal details as Completed', async ({ page }) => {
    await stubTaskListStatus(incompleteStatus)

    await page.goto(TaskListPage.url())
    const taskListPage = await TaskListPage.verifyOnPage(page)
    await taskListPage.verifyTaskStatus('Personal details', 'Confirm personal details', 'Completed')

    const [postCount, putCount, patchCount] = await Promise.all([
      countWriteRequests('POST'),
      countWriteRequests('PUT'),
      countWriteRequests('PATCH'),
    ])

    expect(postCount).toBe(0)
    expect(putCount).toBe(0)
    expect(patchCount).toBe(0)
  })
})

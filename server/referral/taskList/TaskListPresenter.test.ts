import { Response } from 'express'
import { TaskListStatusDto } from '@community-support-api'
import TaskListPresenter from './TaskListPresenter'
import TaskListContent from '../../testutils/factories/TaskListContent'

const baseTaskListState: TaskListStatusDto = {
  fullName: 'John Smith',
  confirmPersonalDetailsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  checkRiskInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  selectAnAreaForReferralCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  selectThePersonsNeedsCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  addDetailsOfAnyAdditionalSupportNeedsCompleted: {
    completed: false,
    statusText: 'Incomplete',
    tag: 'govuk-tag--blue',
  },
  addAdditionalInformationCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  addDetailsOfMainPointOfContactCompleted: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  checkProbationPractitionerDetailsCompleted: null,
  addMainPointOfContactCompleted: null,
}

describe('TaskListPresenter - Page Rendering', () => {
  test('always renders confirm personal details as completed when backend returns incomplete', () => {
    const taskListState: TaskListStatusDto = { ...baseTaskListState }
    const presenter = new TaskListPresenter(taskListState, 'referralId')
    const content = TaskListContent.build()
    const response = { locals: { content } } as unknown as Response
    const viewModel = presenter.buildViewModel(response)

    // Basic page info
    expect(viewModel.pageHeader).toBe('John Smith')
    expect(viewModel.pageSubHeader).toBe('Make a referral')
    expect(viewModel.backLink.href).toBe('/referral/new/find-a-person')

    // Task list structure
    const sections = viewModel.taskListItemsBySection

    expect(sections.personalDetails.title).toBe('Personal details')
    expect(sections.personalDetails.taskList.items).toHaveLength(1)

    expect(sections.referralInformation.title).toBe('Referral information')
    expect(sections.referralInformation.taskList.items).toHaveLength(5)

    expect(sections.contactDetails.title).toBe('Referral contact details')
    expect(sections.checkAnswers.title).toBe('Check answers and submit')

    const checkAnswersLink = sections.checkAnswers.taskList.items[0].href
    expect(checkAnswersLink).not.toContain('/referral/task-list')

    // Status rendering
    expect(sections.personalDetails.taskList.items[0].status.tag.text).toBe('Completed')
    expect(sections.referralInformation.taskList.items[0].status.tag.text).toBe('Incomplete')
  })

  test('renders confirm personal details as completed when backend completion record is missing', () => {
    const taskListState: TaskListStatusDto = {
      ...baseTaskListState,
      confirmPersonalDetailsCompleted: null,
    }

    const presenter = new TaskListPresenter(taskListState, 'referralId')
    const content = TaskListContent.build()
    const response = { locals: { content } } as unknown as Response
    const viewModel = presenter.buildViewModel(response)

    expect(viewModel.taskListItemsBySection.personalDetails.taskList.items[0].status.tag.text).toBe('Completed')
  })

  describe('contact details section', () => {
    test('shows the check probation practitioner details task when the main point of contact has not been added', () => {
      const taskListState: TaskListStatusDto = {
        ...baseTaskListState,
        addMainPointOfContactCompleted: null,
      }
      const presenter = new TaskListPresenter(taskListState, 'referralId')
      const content = TaskListContent.build()
      const response = { locals: { content } } as unknown as Response
      const viewModel = presenter.buildViewModel(response)

      const { items } = viewModel.taskListItemsBySection.contactDetails.taskList
      expect(items).toHaveLength(1)
      expect(items[0].title.text).toBe(`Check probation practitioner's details`)
      expect(items[0].href).toBe('/referral/task-list/check-probation-practitioner-details')
    })

    test('shows the add contact details task when the main point of contact has been added', () => {
      const taskListState: TaskListStatusDto = {
        ...baseTaskListState,
        addMainPointOfContactCompleted: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
      }
      const presenter = new TaskListPresenter(taskListState, 'referralId')
      const content = TaskListContent.build()
      const response = { locals: { content } } as unknown as Response
      const viewModel = presenter.buildViewModel(response)

      const { items } = viewModel.taskListItemsBySection.contactDetails.taskList
      expect(items).toHaveLength(1)
      expect(items[0].title.text).toBe('Add details of main point of contact')
      expect(items[0].href).toBe('/referral/new/add-contact-details')
    })
  })
})

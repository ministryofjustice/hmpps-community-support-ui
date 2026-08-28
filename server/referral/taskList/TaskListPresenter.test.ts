import { Response } from 'express'
import { TaskListStatusDto } from '@community-support-api'
import TaskListPresenter from './TaskListPresenter'
import TaskListContent from '../../testutils/factories/TaskListContent'

describe('TaskListPresenter - Page Rendering', () => {
  test('always renders confirm personal details as completed when backend returns incomplete', () => {
    const taskListState: TaskListStatusDto = {
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
    }
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
      fullName: 'John Smith',
      confirmPersonalDetailsCompleted: null,
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
    }

    const presenter = new TaskListPresenter(taskListState, 'referralId')
    const content = TaskListContent.build()
    const response = { locals: { content } } as unknown as Response
    const viewModel = presenter.buildViewModel(response)

    expect(viewModel.taskListItemsBySection.personalDetails.taskList.items[0].status.tag.text).toBe('Completed')
  })
})

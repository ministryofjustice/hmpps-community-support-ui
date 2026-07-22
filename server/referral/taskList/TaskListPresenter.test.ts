import { Response } from 'express'
import TaskListPresenter from './TaskListPresenter'
import TaskListContent from '../../testutils/factories/TaskListContent'

describe('TaskListPresenter - Page Rendering', () => {
  test('rendering', () => {
    const taskListState = {
      fullName: 'John Smith',
      confirmPersonalDetailsCompleted: true,
      checkRiskInformationCompleted: false,
      selectThePersonsNeedsCompleted: false,
      addDetailsOfAnyAdditionalSupportNeedsCompleted: false,
      addDetailsOfMainPointOfContactCompleted: false,
    }
    const presenter = new TaskListPresenter(taskListState, 'referralId')
    const content = TaskListContent.build()
    const response = { locals: { content } } as unknown as Response
    const viewModel = presenter.buildViewModel(response)

    // Basic page info
    expect(viewModel.pageHeader).toBe('John Smith')
    expect(viewModel.pageSubHeader).toBe('Make a referral')
    expect(viewModel.backLink.href).toBe('/referral/new/select-a-service')

    // Task list structure
    const sections = viewModel.taskListItemsBySection

    expect(sections.personalDetails.title).toBe('Personal details')
    expect(sections.personalDetails.taskList.items).toHaveLength(1)

    expect(sections.referralInformation.title).toBe('Referral information')
    expect(sections.referralInformation.taskList.items).toHaveLength(3)

    expect(sections.contactDetails.title).toBe('Referral contact details')
    expect(sections.checkAnswers.title).toBe('Check answers and submit')

    const checkAnswersLink = sections.checkAnswers.taskList.items[0].href
    expect(checkAnswersLink).not.toContain('/referral/task-list')

    // Status rendering
    expect(sections.personalDetails.taskList.items[0].status.text).toBe('Completed')
    expect(sections.referralInformation.taskList.items[0].status.tag.text).toBe('Incomplete')
  })
})

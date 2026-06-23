import { Response } from 'express'
import { randomUUID } from 'crypto'
import TaskListPresenter from './TaskListPresenter'
import { TaskStatus } from './TaskStatus'
import TaskListState from './TaskListState'
import TaskListContent from '../../testutils/factories/TaskListContent'

describe('TaskListPresenter - Page Rendering', () => {
  const mockRefereeName = 'John Smith'
  const mockReferralId = randomUUID()

  const mockTaskListState: TaskListState = {
    referralId: mockReferralId,
    sections: {
      personalDetails: { status: TaskStatus.COMPLETED },
      riskInformation: { status: TaskStatus.IN_PROGRESS },
      personNeeds: { status: TaskStatus.INCOMPLETE },
      supportNeeds: { status: TaskStatus.INCOMPLETE },
      contactDetails: { status: TaskStatus.CANNOT_START_YET },
      checkAnswers: { status: TaskStatus.CANNOT_START_YET },
    },
  }

  it('rendering', () => {
    const presenter = new TaskListPresenter(mockRefereeName, mockTaskListState)
    const content = TaskListContent.build()
    const response = { locals: { content } } as unknown as Response
    const viewModel = presenter.buildPageContent(response)

    // Basic page info
    expect(viewModel.pageHeader).toBe('John Smith')
    expect(viewModel.pageSubHeader).toBe('Make a referral')
    expect(viewModel.backLink.href).toBe('/referral/new/select-a-service')

    // Task list structure
    const sections = viewModel.taskListItemsBySection

    expect(sections.personalDetails.title).toBe('Personal details')
    expect(sections.personalDetails.tasks).toHaveLength(1)

    expect(sections.referralInformation.title).toBe('Referral Information')
    expect(sections.referralInformation.tasks).toHaveLength(3)

    expect(sections.contactDetails.title).toBe('Referral contact details')
    expect(sections.checkAnswers.title).toBe('Check answers and submit')

    // Check answers link should have mockReferralId replaced
    const checkAnswersLink = sections.checkAnswers.tasks[0].href
    expect(checkAnswersLink).toContain(mockReferralId)
    expect(checkAnswersLink).not.toContain('{{ id }}')

    // Status rendering
    expect(sections.personalDetails.tasks[0].status.text).toBe('Completed')
    expect(sections.referralInformation.tasks[0].status.tag?.text).toBe('In progress')
  })
})

import { Response } from 'express'
import { TaskListStatusResponseDto } from '@community-support-api'
import TaskListPresenter from './TaskListPresenter'
import TaskListContent from '../../testutils/factories/TaskListContent'

describe('TaskListPresenter - Page Rendering', () => {
  test.skip('rendering', () => {
    const taskListState: TaskListStatusResponseDto = {
      confirmPersonalDetails: false,
      checkRiskInformation: false,
      selectThePersonsNeeds: false,
      addDetailsOfAnyAdditionalSupportNeeds: false,
      addDetailsOfMainPointOfContact: false,
      checkAnswers: false,
    }

    const presenter = new TaskListPresenter(taskListState)
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
    expect(sections.personalDetails.taskList.items).toHaveLength(1)

    expect(sections.referralInformation.title).toBe('Referral information')
    expect(sections.referralInformation.taskList.items).toHaveLength(3)

    expect(sections.contactDetails.title).toBe('Referral contact details')
    expect(sections.checkAnswers.title).toBe('Check answers and submit')

    // Check answers link should have mockReferralId replaced
    const checkAnswersLink = sections.checkAnswers.taskList.items[0].href
    expect(checkAnswersLink).not.toContain('{{ id }}')

    // Status rendering
    expect(sections.personalDetails.taskList.items[0].status.text).toBe('Completed')
    expect(sections.referralInformation.taskList.items[0].status.tag?.text).toBe('In progress')
  })
})

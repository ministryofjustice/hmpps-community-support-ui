import { Response } from 'express'
import { TaskListStatusDto } from '@community-support-api'
import TaskListPresenter from './TaskListPresenter'
import TaskListContent from '../../testutils/factories/TaskListContent'

const baseTaskListState: TaskListStatusDto = {
  fullName: 'John Smith',
  confirmPersonalDetailsStatus: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  checkRiskInformationStatus: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  selectAnAreaForReferralStatus: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  selectThePersonsNeedsStatus: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  addDetailsOfAnyAdditionalSupportNeedsStatus: {
    completed: false,
    statusText: 'Incomplete',
    tag: 'govuk-tag--blue',
  },
  addAdditionalInformationStatus: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  contactDetailsStatus: {
    isProbationPractitioner: false,
    status: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
  },
  checkYourAnswersStatus: { completed: false, statusText: 'Cannot Start Yet', tag: null },
}

describe('TaskListPresenter - Page Rendering', () => {
  describe('check your answers', () => {
    test('check answers is plain text when it shows Cannot Start Yet', () => {
      const presenter = new TaskListPresenter(baseTaskListState)
      const content = TaskListContent.build()
      const response = { locals: { content } } as unknown as Response
      const viewModel = presenter.buildViewModel(response)

      const { checkAnswers } = viewModel.taskListItemsBySection
      expect(checkAnswers.taskList.items[0].status).toEqual({ text: 'Cannot Start Yet' })
      expect(checkAnswers.taskList.items[0].title.text).toBe('Check answers and submit')
      expect(checkAnswers.taskList.items[0].href).toBeUndefined()
    })
    test('check answers is a link when it shows Incomplete', () => {
      const taskListState = {
        ...baseTaskListState,
        checkYourAnswersStatus: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
      }
      const presenter = new TaskListPresenter(taskListState)
      const content = TaskListContent.build()
      const response = { locals: { content } } as unknown as Response
      const viewModel = presenter.buildViewModel(response)

      const { checkAnswers } = viewModel.taskListItemsBySection
      expect(checkAnswers.taskList.items[0].status).toEqual({
        tag: { text: 'Incomplete', classes: 'govuk-tag--blue' },
      })
      expect(checkAnswers.taskList.items[0].title.text).toBe('Check answers and submit')
      expect(checkAnswers.taskList.items[0].href).toBe('/referral/check-referral-information')
    })
  })

  describe('contact details section', () => {
    test('renders correct content', () => {
      const taskListState: TaskListStatusDto = { ...baseTaskListState }
      const presenter = new TaskListPresenter(taskListState)
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

      expect(sections.checkAnswers.taskList.items[0].href).toBeUndefined()

      expect(sections.personalDetails.taskList.items[0].status.tag.text).toBe('Incomplete')
      expect(sections.referralInformation.taskList.items[0].status.tag.text).toBe('Incomplete')
    })
    test('shows the add contact details task when the main point of contact has been added', () => {
      const taskListState: TaskListStatusDto = {
        ...baseTaskListState,
        contactDetailsStatus: {
          isProbationPractitioner: false,
          status: { completed: true, statusText: 'Completed', tag: 'govuk-tag--green' },
        },
      }
      const presenter = new TaskListPresenter(taskListState)
      const content = TaskListContent.build()
      const response = { locals: { content } } as unknown as Response
      const viewModel = presenter.buildViewModel(response)

      const { items } = viewModel.taskListItemsBySection.contactDetails.taskList
      expect(items).toHaveLength(1)
      expect(items[0].title.text).toBe('Add details of main point of contact')
      expect(items[0].href).toBe('/referral/new/add-contact-details')
      expect(items[0].status.tag.text).toBe('Completed')
    })

    test('derives the contact details status from addMainPointOfContactCompleted, not addDetailsOfMainPointOfContactCompleted', () => {
      const taskListState: TaskListStatusDto = {
        ...baseTaskListState,
        contactDetailsStatus: {
          isProbationPractitioner: false,
          status: { completed: false, statusText: 'Incomplete', tag: 'govuk-tag--blue' },
        },
      }
      const presenter = new TaskListPresenter(taskListState)
      const content = TaskListContent.build()
      const response = { locals: { content } } as unknown as Response
      const viewModel = presenter.buildViewModel(response)

      const { items } = viewModel.taskListItemsBySection.contactDetails.taskList
      expect(items[0].status.tag.text).toBe('Incomplete')
    })
  })
})

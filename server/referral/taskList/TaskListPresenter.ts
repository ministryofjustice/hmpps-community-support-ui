import { Response } from 'express'
import { GovukFrontendTaskListItemStatus } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import TaskListState from './TaskListState'
import { TaskStatus, TaskListViewModel, TaskListContent } from './TaskListViewModel'

export default class TaskListPresenter extends PresenterBase<TaskListViewModel, TaskListContent> {
  constructor(
    private readonly refereeName: string,
    private readonly taskListState: TaskListState,
  ) {
    super()
  }

  buildViewModel(res: Response): TaskListViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader.replace('{{ fullName }}', this.refereeName || ''),
      pageSubHeader: content.pageSubHeader,
      backLink: { href: content.backLink },
      taskListItemsBySection: this.buildTaskList(content),
    }
  }

  getTemplatePath(): string {
    return 'referral/taskList'
  }

  private buildTaskList(content: TaskListContent) {
    return {
      personalDetails: {
        title: content.taskList.personalDetails.title,
        taskList: {
          items: [
            {
              title: { text: content.taskList.personalDetails.subTasks.confirmPersonalDetails.text },
              href: content.taskList.personalDetails.subTasks.confirmPersonalDetails.href,
              status: this.getStatusTag(this.taskListState.sections.personalDetails.status),
            },
          ],
        },
      },
      referralInformation: {
        title: content.taskList.referralInformation.title,
        taskList: {
          items: [
            {
              title: { text: content.taskList.referralInformation.subTasks.checkRiskInformation.text },
              href: content.taskList.referralInformation.subTasks.checkRiskInformation.href,
              status: this.getStatusTag(this.taskListState.sections.riskInformation.status),
            },
            {
              title: { text: content.taskList.referralInformation.subTasks.selectPersonNeeds.text },
              href: content.taskList.referralInformation.subTasks.selectPersonNeeds.href,
              status: this.getStatusTag(this.taskListState.sections.personNeeds.status),
            },
            {
              title: { text: content.taskList.referralInformation.subTasks.addSupportNeeds.text },
              href: content.taskList.referralInformation.subTasks.addSupportNeeds.href,
              status: this.getStatusTag(this.taskListState.sections.supportNeeds.status),
            },
          ],
        },
      },
      contactDetails: {
        title: content.taskList.contactDetails.title,
        taskList: {
          items: [
            {
              title: { text: content.taskList.contactDetails.subTasks.addContactDetails.text },
              href: content.taskList.contactDetails.subTasks.addContactDetails.href,
              status: this.getStatusTag(this.taskListState.sections.contactDetails.status),
            },
          ],
        },
      },
      checkAnswers: {
        title: content.taskList.checkAnswers.title,
        taskList: {
          items: [
            {
              title: { text: content.taskList.checkAnswers.subTasks.checkAnswersAndSubmit.text },
              href: content.taskList.checkAnswers.subTasks.checkAnswersAndSubmit.href.replace(
                '{{ id }}',
                this.taskListState.referralId || '',
              ),
              status: this.getStatusTag(this.taskListState.sections.checkAnswers.status),
            },
          ],
        },
      },
    }
  }

  private getStatusTag(status: TaskStatus): GovukFrontendTaskListItemStatus {
    switch (status) {
      case 'completed':
        return { text: 'Completed' }
      case 'in-progress':
        return { tag: { text: 'In progress', classes: 'govuk-tag--blue' } }
      case 'incomplete':
        return { tag: { text: 'Incomplete', classes: 'govuk-tag--blue' } }
      case 'cannot-start-yet':
      default:
        return { tag: { text: 'Cannot start yet', classes: 'govuk-tag--grey' } }
    }
  }

  private buildTaskListStatus() {
    return {
      personalDetails: this.getStatusTag(this.taskListState.sections.personalDetails.status),
      riskInformation: this.getStatusTag(this.taskListState.sections.riskInformation.status),
      personNeeds: this.getStatusTag(this.taskListState.sections.personNeeds.status),
      supportNeeds: this.getStatusTag(this.taskListState.sections.supportNeeds.status),
      contactDetails: this.getStatusTag(this.taskListState.sections.contactDetails.status),
      checkAnswers: this.getStatusTag(this.taskListState.sections.checkAnswers.status),
    }
  }
}

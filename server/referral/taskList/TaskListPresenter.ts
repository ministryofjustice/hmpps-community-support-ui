import { Response } from 'express'
import { GovukFrontendTaskListItemStatus } from '@govuk-frontend'
import { TaskListStatusDto, TaskListStatusItem } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { TaskListViewModel, TaskListPageContent, TaskListContent } from './TaskListViewModel'

const getStatusTag = (status: TaskListStatusItem | null): GovukFrontendTaskListItemStatus => {
  if (!status) {
    return { tag: { text: 'Not Started', classes: 'govuk-tag--grey' } }
  }
  return { tag: { text: status.statusText, classes: status.tag } }
}

const getTaskListStatus = (data: TaskListStatusDto) => {
  return {
    personalDetails: getStatusTag(data.confirmPersonalDetailsCompleted),
    riskInformation: getStatusTag(data.checkRiskInformationCompleted),
    personNeeds: getStatusTag(data.selectThePersonsNeedsCompleted),
    supportNeeds: getStatusTag(data.addDetailsOfAnyAdditionalSupportNeedsCompleted),
    contactDetails: getStatusTag(data.addDetailsOfMainPointOfContactCompleted),
    checkAnswers: getStatusTag(null),
  }
}

export default class TaskListPresenter extends PresenterBase<TaskListViewModel, TaskListPageContent> {
  constructor(
    private readonly data: TaskListStatusDto,
    private readonly referralId: string,
  ) {
    super()
  }

  private buildTaskList(content: TaskListContent) {
    const status = getTaskListStatus(this.data)
    return {
      personalDetails: {
        title: content.personalDetails.title,
        taskList: {
          items: [
            {
              title: { text: content.personalDetails.subTasks.confirmPersonalDetails.text },
              href: content.personalDetails.subTasks.confirmPersonalDetails.href,
              status: status.personalDetails,
            },
          ],
        },
      },
      referralInformation: {
        title: content.referralInformation.title,
        taskList: {
          items: [
            {
              title: { text: content.referralInformation.subTasks.checkRiskInformation.text },
              href: content.referralInformation.subTasks.checkRiskInformation.href,
              status: status.riskInformation,
            },
            {
              title: { text: content.referralInformation.subTasks.selectPersonNeeds.text },
              href: content.referralInformation.subTasks.selectPersonNeeds.href,
              status: status.personNeeds,
            },
            {
              title: { text: content.referralInformation.subTasks.addSupportNeeds.text },
              href: content.referralInformation.subTasks.addSupportNeeds.href,
              status: status.supportNeeds,
            },
          ],
        },
      },
      contactDetails: {
        title: content.contactDetails.title,
        taskList: {
          items: [
            {
              title: { text: content.contactDetails.subTasks.addContactDetails.text },
              href: content.contactDetails.subTasks.addContactDetails.href,
              status: status.contactDetails,
            },
          ],
        },
      },
      checkAnswers: {
        title: content.checkAnswers.title,
        taskList: {
          items: [
            {
              title: { text: content.checkAnswers.subTasks.checkAnswersAndSubmit.text },
              href: content.checkAnswers.subTasks.checkAnswersAndSubmit.href.replace('{{ id }}', this.referralId),
              status: status.checkAnswers,
            },
          ],
        },
      },
    }
  }

  buildViewModel(res: Response): TaskListViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader.replace('{{ fullName }}', this.data.fullName),
      pageSubHeader: content.pageSubHeader,
      backLink: { href: content.backLink },
      taskListItemsBySection: this.buildTaskList(content.taskList),
    }
  }

  getTemplatePath(): string {
    return 'referral/taskList'
  }
}

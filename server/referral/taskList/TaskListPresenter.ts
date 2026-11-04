import { Response } from 'express'
import { GovukFrontendTaskListItemStatus } from '@govuk-frontend'
import { TaskListStatusDto, TaskListStatusItem } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { TaskListViewModel, TaskListPageContent, TaskListContent } from './TaskListViewModel'

const getStatusTag = (status: TaskListStatusItem): GovukFrontendTaskListItemStatus =>
  status.tag ? { tag: { text: status.statusText, classes: status.tag } } : { text: status.statusText }

const getTaskListStatus = (data: TaskListStatusDto) => {
  return {
    personalDetails: getStatusTag(data.confirmPersonalDetailsStatus),
    riskInformation: getStatusTag(data.checkRiskInformationStatus),
    personNeeds: getStatusTag(data.selectThePersonsNeedsStatus),
    supportNeeds: getStatusTag(data.addAdditionalSupportNeedsStatus),
    contactDetails: getStatusTag(data.contactDetailsStatus.status),
    additionalReferralInformation: getStatusTag(data.addAdditionalInformationStatus),
    selectAnAreaForReferral: getStatusTag(data.selectAnAreaForReferralStatus),
    checkAnswers: getStatusTag(data.checkYourAnswersStatus),
  }
}

export default class TaskListPresenter extends PresenterBase<TaskListViewModel, TaskListPageContent> {
  constructor(private readonly data: TaskListStatusDto) {
    super()
  }

  private buildTaskList(content: TaskListContent) {
    const status = getTaskListStatus(this.data)
    return {
      personalDetails: {
        title: content.personalDetails.title.replace('{{ firstName }}', this.data.refereeName.firstName),
        taskList: {
          items: [
            {
              title: { text: content.personalDetails.subTasks.confirmPersonalDetails.text },
              href: content.personalDetails.subTasks.confirmPersonalDetails.href,
              status: status.personalDetails,
            },
            {
              title: { text: content.personalDetails.subTasks.checkRiskInformation.text },
              href: content.personalDetails.subTasks.checkRiskInformation.href,
              status: status.riskInformation,
            },
            {
              title: { text: content.personalDetails.subTasks.addSupportNeeds.text },
              href: content.personalDetails.subTasks.addSupportNeeds.href,
              status: status.supportNeeds,
            },
          ],
        },
      },
      referralInformation: {
        title: content.referralInformation.title,
        taskList: {
          items: [
            {
              title: { text: content.referralInformation.subTasks.selectPersonNeeds.text },
              href: content.referralInformation.subTasks.selectPersonNeeds.href,
              status: status.personNeeds,
            },
            {
              title: { text: content.referralInformation.subTasks.selectArea.text },
              href: content.referralInformation.subTasks.selectArea.href,
              status: status.selectAnAreaForReferral,
            },
            {
              title: { text: content.referralInformation.subTasks.additionalReferralInformation.text },
              href: content.referralInformation.subTasks.additionalReferralInformation.href,
              status: status.additionalReferralInformation,
            },
          ],
        },
      },
      contactDetails: {
        title: content.contactDetails.title,
        taskList: {
          items: [
            this.data.contactDetailsStatus.isProbationPractitioner
              ? {
                  title: { text: content.contactDetails.subTasks.checkPPDetails.text },
                  href: content.contactDetails.subTasks.checkPPDetails.href,
                  status: status.contactDetails,
                }
              : {
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
              href:
                this.data.checkYourAnswersStatus.statusText === 'Cannot Start Yet'
                  ? undefined
                  : content.checkAnswers.subTasks.checkAnswersAndSubmit.href,
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
      pageHeader: content.pageHeader.replace(
        '{{ fullName }}',
        `${this.data.refereeName.firstName} ${this.data.refereeName.lastName}`,
      ),
      pageSubHeader: content.pageSubHeader,
      backLink: { href: content.backLink },
      taskListItemsBySection: this.buildTaskList(content.taskList),
    }
  }

  getTemplatePath(): string {
    return 'referral/taskList'
  }
}

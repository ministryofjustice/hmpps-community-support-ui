import { GovukFrontendTaskListItem, GovukFrontendBackLink } from '@govuk-frontend'

export interface TaskListContent {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  backLink: string
  taskList: {
    personalDetails: {
      title: string
      subTasks: {
        confirmPersonalDetails: { text: string; href: string }
      }
    }
    referralInformation: {
      title: string
      subTasks: {
        checkRiskInformation: { text: string; href: string }
        addPersonNeeds: { text: string; href: string }
        addSupportNeeds: { text: string; href: string }
      }
    }
    contactDetails: {
      title: string
      subTasks: {
        addContactDetails: { text: string; href: string }
      }
    }
    checkAnswers: {
      title: string
      subTasks: {
        checkAnswersAndSubmit: { text: string; href: string }
      }
    }
  }
}

export interface TaskListSection {
  title: string
  tasks: GovukFrontendTaskListItem[]
}

export interface TaskListViewModel {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  backLink: GovukFrontendBackLink

  taskListItemsBySection: {
    personalDetails: TaskListSection
    referralInformation: TaskListSection
    contactDetails: TaskListSection
    checkAnswers: TaskListSection
  }
}

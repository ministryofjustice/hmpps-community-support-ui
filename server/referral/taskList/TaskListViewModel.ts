import { GovukFrontendTaskList, GovukFrontendBackLink } from '@govuk-frontend'

export interface TaskListContent {
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
      selectPersonNeeds: { text: string; href: string }
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

export interface TaskListPageContent {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  backLink: string
  taskList: TaskListContent
}

export interface TaskListViewModel {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  backLink: GovukFrontendBackLink
  taskListItemsBySection: {
    personalDetails: { title: string; taskList: GovukFrontendTaskList }
    referralInformation: { title: string; taskList: GovukFrontendTaskList }
    contactDetails: { title: string; taskList: GovukFrontendTaskList }
    checkAnswers: { title: string; taskList: GovukFrontendTaskList }
  }
}

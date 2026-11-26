import { GovukFrontendTaskList, GovukFrontendBackLink } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type TaskListContent = TaskListPageContent['taskList']

export type TaskListPageContent = GlobalContent['referral']['taskList']['page']

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

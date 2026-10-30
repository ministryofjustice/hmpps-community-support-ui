import { Factory } from 'fishery'
import { TaskListPageContent } from '../../referral/taskList/TaskListViewModel'

class TaskListContentFactory extends Factory<TaskListPageContent> {}

export default TaskListContentFactory.define(({ transientParams }) => ({
  pageTitle: 'Make a referral',
  pageHeader: transientParams.pageHeader || '{{ fullName }}',
  pageSubHeader: transientParams.pageSubHeader || 'Make a referral',
  backLink: '/referral/new/find-a-person',
  taskList: {
    personalDetails: {
      title: 'About {{ firstName }}',
      subTasks: {
        confirmPersonalDetails: {
          text: 'Confirm personal details',
          href: '/referral/new/personal-details',
        },
        checkRiskInformation: { text: 'Check risk information', href: '/referral/task-list/view-risk-summary' },
        addSupportNeeds: {
          text: 'Add details of any additional support needs',
          href: '/referral/new/add-support-needs',
        },
      },
    },
    referralInformation: {
      title: 'Referral information',
      subTasks: {
        selectPersonNeeds: { text: `Select the person's needs`, href: '/referral/new/select-person-needs' },
        selectArea: {
          text: 'Select the area for the referral',
          href: '/referral/task-list/select-an-area-for-referral',
        },
        additionalReferralInformation: {
          text: 'Additional referral information',
          href: '/referral/new/additional-referral-information',
        },
      },
    },
    contactDetails: {
      title: 'Referral contact details',
      subTasks: {
        addContactDetails: { text: 'Add details of main point of contact', href: '/referral/new/add-contact-details' },
        checkPPDetails: {
          text: `Check probation practitioner's details`,
          href: '/referral/task-list/check-probation-practitioner-details',
        },
      },
    },
    checkAnswers: {
      title: 'Check answers and submit',
      subTasks: {
        checkAnswersAndSubmit: { text: 'Check answers and submit', href: '/referral/check-referral-information' },
      },
    },
  },
}))

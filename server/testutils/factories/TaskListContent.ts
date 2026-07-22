import { Factory } from 'fishery'
import { TaskListPageContent } from '../../referral/taskList/TaskListViewModel'

class TaskListContentFactory extends Factory<TaskListPageContent> {}

export default TaskListContentFactory.define(({ transientParams }) => ({
  pageTitle: 'Make a referral - [service name]',
  pageHeader: transientParams.pageHeader || '{{ fullName }}',
  pageSubHeader: transientParams.pageSubHeader || 'Make a referral',
  backLink: '/referral/new/select-a-service',
  taskList: {
    personalDetails: {
      title: 'Personal details',
      subTasks: {
        confirmPersonalDetails: {
          text: 'Confirm personal details',
          href: '/referral/new/personal-details',
        },
      },
    },
    referralInformation: {
      title: 'Referral information',
      subTasks: {
        checkRiskInformation: { text: 'Check risk information', href: '/referral/new/check-risk-information' },
        selectPersonNeeds: { text: `Select the person's needs`, href: '/referral/new/select-person-needs' },
        addSupportNeeds: {
          text: 'Add details of any additional support needs',
          href: '/referral/new/add-support-needs',
        },
      },
    },
    contactDetails: {
      title: 'Referral contact details',
      subTasks: {
        addContactDetails: { text: 'Add details of main point of contact', href: '/referral/new/add-contact-details' },
      },
    },
    checkAnswers: {
      title: 'Check answers and submit',
      subTasks: {
        checkAnswersAndSubmit: { text: 'Check answers and submit', href: '/referral/new/check-answers/{{ id }}' },
      },
    },
  },
}))

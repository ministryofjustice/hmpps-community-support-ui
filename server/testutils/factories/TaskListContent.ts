import { Factory } from 'fishery'
import { TaskListContent } from '../../referral/taskList/TaskListViewModel'

class TaskListContentFactory extends Factory<TaskListContent> {}

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
        checkRiskInformation: { text: 'Check risk information', href: '/referral/new/risk-information' },
        addPersonNeeds: { text: `Add the person's needs`, href: '/referral/new/person-needs' },
        addSupportNeeds: { text: 'Add details of any additional support needs', href: '/referral/new/support-needs' },
      },
    },
    contactDetails: {
      title: 'Referral contact details',
      subTasks: {
        addContactDetails: { text: 'Add contact details for this referral', href: '/referral/new/contact-details' },
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

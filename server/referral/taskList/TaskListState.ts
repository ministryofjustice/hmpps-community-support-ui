import { TaskStatus } from './TaskStatus'

export default interface TaskListState {
  referralId?: string
  sections: {
    personalDetails: { status: TaskStatus }
    riskInformation: { status: TaskStatus }
    personNeeds: { status: TaskStatus }
    supportNeeds: { status: TaskStatus }
    contactDetails: { status: TaskStatus }
    checkAnswers: { status: TaskStatus }
  }
}

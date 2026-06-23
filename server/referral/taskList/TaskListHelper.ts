import { Request } from 'express'
import { TaskStatus } from './TaskStatus'
import TaskListState from './TaskListState'

export default class TaskListHelper {
  static newTaskListState(req: Request, personIdentifier: string): TaskListState {
    req.session.taskList ??= {}
    req.session.taskList[personIdentifier] = TaskListHelper.initializeTaskList(req)
    return req.session.taskList[personIdentifier]
  }

  static getTaskListState(req: Request, personIdentifier: string): TaskListState {
    return req.session.taskList?.[personIdentifier] || TaskListHelper.initializeTaskList(req)
  }

  static saveTaskListState(req: Request, personIdentifier: string, state: TaskListState): void {
    req.session.taskList ??= {}

    const isAllMandatoryCompleted = TaskListHelper.isMandatoryTasksCompleted(state)

    const updatedState: TaskListState = {
      ...state,
      sections: {
        ...state.sections,
        checkAnswers: {
          ...state.sections.checkAnswers,
          status: isAllMandatoryCompleted ? TaskStatus.COMPLETED : TaskStatus.CANNOT_START_YET,
        },
      },
    }

    req.session.taskList[personIdentifier] = updatedState
  }

  static removeTaskListState(req: Request, personIdentifier: string) {
    delete req.session.taskList?.[personIdentifier]
  }

  static updateSectionStatus(
    req: Request,
    personIdentifier: string,
    section: keyof TaskListState['sections'],
    newStatus: TaskStatus,
  ): void {
    const state = TaskListHelper.getTaskListState(req, personIdentifier)

    const updatedState: TaskListState = {
      ...state,
      sections: {
        ...state.sections,
        [section]: {
          ...state.sections[section],
          status: newStatus,
        },
      },
    }

    if (TaskListHelper.isMandatoryTasksCompleted(updatedState)) {
      updatedState.sections.checkAnswers.status = TaskStatus.COMPLETED
    } else {
      updatedState.sections.checkAnswers.status = TaskStatus.CANNOT_START_YET
    }

    req.session.taskList[personIdentifier] = updatedState
  }

  static initializeTaskList(req: Request, referralId?: string): TaskListState {
    return {
      referralId,
      sections: {
        personalDetails: { status: TaskStatus.INCOMPLETE },
        riskInformation: { status: TaskStatus.INCOMPLETE },
        personNeeds: { status: TaskStatus.INCOMPLETE },
        supportNeeds: { status: TaskStatus.INCOMPLETE },
        contactDetails: { status: TaskStatus.INCOMPLETE },
        checkAnswers: { status: TaskStatus.CANNOT_START_YET },
      } as const,
    }
  }

  static isMandatoryTasksCompleted(state: TaskListState): boolean {
    const { checkAnswers, ...otherSections } = state.sections
    return Object.values(otherSections).every(section => section.status === TaskStatus.COMPLETED)
  }

  static isAllTasksCompleted(state: TaskListState): boolean {
    return Object.values(state.sections).every(section => section.status === TaskStatus.COMPLETED)
  }
}

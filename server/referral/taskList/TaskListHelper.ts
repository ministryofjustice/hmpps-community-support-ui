import { Request } from 'express'
import { TaskStatus } from './TaskListViewModel'
import TaskListState from './TaskListState'

export function newTaskListState(req: Request, personIdentifier: string): TaskListState {
  req.session.taskList ??= {}
  req.session.taskList[personIdentifier] = initializeTaskList(req)
  return req.session.taskList[personIdentifier]
}

export function getTaskListState(req: Request, personIdentifier: string): TaskListState {
  return req.session.taskList?.[personIdentifier] || initializeTaskList(req)
}

export function saveTaskListState(req: Request, personIdentifier: string, state: TaskListState): void {
  req.session.taskList ??= {}

  const isAllMandatoryCompleted = isMandatoryTasksCompleted(state)

  const updatedState: TaskListState = {
    ...state,
    sections: {
      ...state.sections,
      checkAnswers: {
        ...state.sections.checkAnswers,
        status: isAllMandatoryCompleted ? 'completed' : 'cannot-start-yet',
      },
    },
  }

  req.session.taskList[personIdentifier] = updatedState
}

export function removeTaskListState(req: Request, personIdentifier: string): void {
  delete req.session.taskList?.[personIdentifier]
}

export function updateSectionStatus(
  req: Request,
  personIdentifier: string,
  section: keyof TaskListState['sections'],
  newStatus: TaskStatus,
): void {
  const state = getTaskListState(req, personIdentifier)

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

  if (isMandatoryTasksCompleted(updatedState)) {
    updatedState.sections.checkAnswers.status = 'completed'
  } else {
    updatedState.sections.checkAnswers.status = 'cannot-start-yet'
  }

  req.session.taskList[personIdentifier] = updatedState
}

export function initializeTaskList(req: Request, referralId?: string): TaskListState {
  return {
    referralId,
    sections: {
      personalDetails: { status: 'incomplete' },
      riskInformation: { status: 'incomplete' },
      personNeeds: { status: 'incomplete' },
      supportNeeds: { status: 'incomplete' },
      contactDetails: { status: 'incomplete' },
      checkAnswers: { status: 'cannot-start-yet' },
    } as const,
  }
}

export function isMandatoryTasksCompleted(state: TaskListState): boolean {
  const { checkAnswers, ...otherSections } = state.sections
  return Object.values(otherSections).every(section => section.status === 'completed')
}

export function isAllTasksCompleted(state: TaskListState): boolean {
  return Object.values(state.sections).every(section => section.status === 'completed')
}

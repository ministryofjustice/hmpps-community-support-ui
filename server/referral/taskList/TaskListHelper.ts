import { Request } from 'express'
import { TaskStatus } from './TaskListViewModel'
import TaskListState from './TaskListState'

export const getCurrentDraftReferralKey = (req: Request): string | undefined => {
  return req.session?.taskList?.referralId
}

export const initialiseTaskList = (referralId: string): TaskListState => ({
  referralId,
  sections: {
    personalDetails: { status: 'incomplete' },
    riskInformation: { status: 'incomplete' },
    personNeeds: { status: 'incomplete' },
    supportNeeds: { status: 'incomplete' },
    contactDetails: { status: 'incomplete' },
    checkAnswers: { status: 'cannot-start-yet' },
  },
})

export const newTaskListState = (req: Request, draftReferralId: string): TaskListState => {
  req.session.taskList = initialiseTaskList(draftReferralId)
  return req.session.taskList
}

export const getTaskListState = (req: Request, draftReferralId: string): TaskListState => {
  if (req.session.taskList?.referralId === draftReferralId) {
    return req.session.taskList
  }
  return newTaskListState(req, draftReferralId)
}

export const removeTaskListState = (req: Request): void => {
  const { referralId } = req.params as { referralId: string }

  if (req.session.taskList?.referralId === referralId) {
    delete req.session.taskList
  }
}

export const saveTaskListState = (req: Request, state: TaskListState): void => {
  removeTaskListState(req)
  req.session.taskList = {
    ...state,
    sections: {
      ...state.sections,
      checkAnswers: {
        ...state.sections.checkAnswers,
        status: isMandatoryTasksCompleted(state) ? 'completed' : ('cannot-start-yet' as TaskStatus),
      },
    },
  }
}

export const updateSectionStatus = (
  req: Request,
  draftReferralId: string,
  section: keyof TaskListState['sections'],
  newStatus: TaskStatus,
): void => {
  const state = getTaskListState(req, draftReferralId)

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
  updatedState.sections.checkAnswers.status = isMandatoryTasksCompleted(updatedState)
    ? 'completed'
    : ('cannot-start-yet' as TaskStatus)
  req.session.taskList[draftReferralId] = updatedState
}

export const isMandatoryTasksCompleted = (state: TaskListState): boolean => {
  const { checkAnswers, ...otherSections } = state.sections
  return Object.values(otherSections).every(section => section.status === 'completed')
}

export const isAllTasksCompleted = (state: TaskListState): boolean => {
  return Object.values(state.sections).every(section => section.status === 'completed')
}

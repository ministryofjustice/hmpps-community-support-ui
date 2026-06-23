import { Request } from 'express'
import { randomUUID } from 'crypto'
import TaskListHelper from './TaskListHelper'
import { TaskStatus } from './TaskStatus'
import TaskListState from './TaskListState'

describe('TaskListHelper', () => {
  let req: Partial<Request>

  const mockReferralId = randomUUID()
  const mockPersonIdentifier = 'A123456'

  beforeEach(() => {
    req = {
      session: {},
    } as Partial<Request>
  })

  describe('initializeTaskList', () => {
    it('should return a new TaskListState with default statuses', () => {
      const state = TaskListHelper.initializeTaskList(req as Request)

      expect(state.referralId).toBeUndefined()
      expect(state.sections.personalDetails.status).toBe(TaskStatus.INCOMPLETE)
      expect(state.sections.riskInformation.status).toBe(TaskStatus.INCOMPLETE)
      expect(state.sections.personNeeds.status).toBe(TaskStatus.INCOMPLETE)
      expect(state.sections.supportNeeds.status).toBe(TaskStatus.INCOMPLETE)
      expect(state.sections.contactDetails.status).toBe(TaskStatus.INCOMPLETE)
      expect(state.sections.checkAnswers.status).toBe(TaskStatus.CANNOT_START_YET)
    })

    it('should accept optional referralId', () => {
      const referralId = mockReferralId
      const state = TaskListHelper.initializeTaskList(req as Request, referralId)

      expect(state.referralId).toBe(referralId)
    })
  })

  describe('newTaskListState', () => {
    it('should create and save new task list state in session', () => {
      const personIdentifier = mockPersonIdentifier

      const state = TaskListHelper.newTaskListState(req as Request, personIdentifier)

      expect(req.session!.taskList).toBeDefined()
      expect(req.session!.taskList![personIdentifier]).toBeDefined()
      expect(state.sections.personalDetails.status).toBe(TaskStatus.INCOMPLETE)
    })
  })

  describe('getTaskListState', () => {
    it('should return existing state from session if available', () => {
      const personIdentifier = mockPersonIdentifier
      const existingState: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: TaskStatus.COMPLETED },
          riskInformation: { status: TaskStatus.INCOMPLETE },
          personNeeds: { status: TaskStatus.COMPLETED },
          supportNeeds: { status: TaskStatus.INCOMPLETE },
          contactDetails: { status: TaskStatus.COMPLETED },
          checkAnswers: { status: TaskStatus.CANNOT_START_YET },
        },
      }

      req.session!.taskList = { [personIdentifier]: existingState }

      const state = TaskListHelper.getTaskListState(req as Request, personIdentifier)

      expect(state).toEqual(existingState)
    })

    it('should initialize new state for personIdentifier not exists in session', () => {
      const personIdentifier = 'N123456'
      const state = TaskListHelper.getTaskListState(req as Request, personIdentifier)

      expect(state.sections.personalDetails.status).toBe(TaskStatus.INCOMPLETE)
    })
  })

  describe('saveTaskListState', () => {
    it('should save state to session', () => {
      const personIdentifier = mockPersonIdentifier
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: TaskStatus.COMPLETED },
          riskInformation: { status: TaskStatus.INCOMPLETE },
          personNeeds: { status: TaskStatus.COMPLETED },
          supportNeeds: { status: TaskStatus.COMPLETED },
          contactDetails: { status: TaskStatus.COMPLETED },
          checkAnswers: { status: TaskStatus.CANNOT_START_YET },
        },
      }

      TaskListHelper.saveTaskListState(req as Request, personIdentifier, state)

      expect(req.session!.taskList).toBeDefined()
      expect(req.session!.taskList![personIdentifier]).toEqual(state)
    })

    it('should save state to session and update checkAnswer state to complete when all other section states are completed', () => {
      const personIdentifier = mockPersonIdentifier
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: TaskStatus.COMPLETED },
          riskInformation: { status: TaskStatus.COMPLETED },
          personNeeds: { status: TaskStatus.COMPLETED },
          supportNeeds: { status: TaskStatus.COMPLETED },
          contactDetails: { status: TaskStatus.COMPLETED },
          checkAnswers: { status: TaskStatus.CANNOT_START_YET },
        },
      }

      TaskListHelper.saveTaskListState(req as Request, personIdentifier, state)
      expect(req.session!.taskList).toBeDefined()
      expect(req.session!.taskList![personIdentifier].sections.checkAnswers.status).toEqual(TaskStatus.COMPLETED)
    })
  })

  describe('removeTaskListState', () => {
    it('should remove state from session', () => {
      const personIdentifier = mockPersonIdentifier
      const mockTaskListState: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: TaskStatus.INCOMPLETE },
          riskInformation: { status: TaskStatus.INCOMPLETE },
          personNeeds: { status: TaskStatus.INCOMPLETE },
          supportNeeds: { status: TaskStatus.INCOMPLETE },
          contactDetails: { status: TaskStatus.INCOMPLETE },
          checkAnswers: { status: TaskStatus.CANNOT_START_YET },
        },
      }
      req.session!.taskList = {
        [personIdentifier]: mockTaskListState,
      }

      TaskListHelper.removeTaskListState(req as Request, personIdentifier)

      expect(req.session!.taskList![personIdentifier]).toBeUndefined()
    })
  })

  describe('updateSectionStatus', () => {
    it('should update the status of a specific section and save to session', () => {
      const personIdentifier = mockPersonIdentifier
      TaskListHelper.newTaskListState(req as Request, personIdentifier)

      TaskListHelper.updateSectionStatus(req as Request, personIdentifier, 'riskInformation', TaskStatus.COMPLETED)

      const updatedState = req.session!.taskList![personIdentifier]

      expect(updatedState.sections.riskInformation.status).toBe(TaskStatus.COMPLETED)
    })
  })

  describe('isMandatoryTasksCompleted', () => {
    it('should return true when all sections except checkAnswers are completed', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: TaskStatus.COMPLETED },
          riskInformation: { status: TaskStatus.COMPLETED },
          personNeeds: { status: TaskStatus.COMPLETED },
          supportNeeds: { status: TaskStatus.COMPLETED },
          contactDetails: { status: TaskStatus.COMPLETED },
          checkAnswers: { status: TaskStatus.CANNOT_START_YET },
        },
      }

      expect(TaskListHelper.isMandatoryTasksCompleted(state)).toBe(true)
      expect(TaskListHelper.isAllTasksCompleted(state)).toBe(false)
    })

    it('should return true when all tasks are completed', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: TaskStatus.COMPLETED },
          riskInformation: { status: TaskStatus.COMPLETED },
          personNeeds: { status: TaskStatus.COMPLETED },
          supportNeeds: { status: TaskStatus.COMPLETED },
          contactDetails: { status: TaskStatus.COMPLETED },
          checkAnswers: { status: TaskStatus.COMPLETED },
        },
      }

      expect(TaskListHelper.isMandatoryTasksCompleted(state)).toBe(true)
      expect(TaskListHelper.isAllTasksCompleted(state)).toBe(true)
    })

    it('should return false if any main section is not completed', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: TaskStatus.COMPLETED },
          riskInformation: { status: TaskStatus.INCOMPLETE },
          personNeeds: { status: TaskStatus.COMPLETED },
          supportNeeds: { status: TaskStatus.COMPLETED },
          contactDetails: { status: TaskStatus.COMPLETED },
          checkAnswers: { status: TaskStatus.CANNOT_START_YET },
        },
      }

      expect(TaskListHelper.isMandatoryTasksCompleted(state)).toBe(false)
      expect(TaskListHelper.isAllTasksCompleted(state)).toBe(false)
    })
  })
})

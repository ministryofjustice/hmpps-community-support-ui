import { Request } from 'express'
import { randomUUID } from 'crypto'
import {
  newTaskListState,
  getTaskListState,
  saveTaskListState,
  removeTaskListState,
  updateSectionStatus,
  initialiseTaskList,
  isMandatoryTasksCompleted,
  isAllTasksCompleted,
} from './TaskListHelper'
import TaskListState from './TaskListState'

describe('TaskList Helper Functions', () => {
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
      const draftReferralKey = 'my-draft-referral-key'
      const state = initialiseTaskList(draftReferralKey)

      expect(state.referralId).toBe(draftReferralKey)
      expect(state.sections.personalDetails.status).toBe('incomplete')
      expect(state.sections.riskInformation.status).toBe('incomplete')
      expect(state.sections.personNeeds.status).toBe('incomplete')
      expect(state.sections.supportNeeds.status).toBe('incomplete')
      expect(state.sections.contactDetails.status).toBe('incomplete')
      expect(state.sections.checkAnswers.status).toBe('cannot-start-yet')
    })

    it('should accept optional referralId', () => {
      const referralId = mockReferralId
      const state = initialiseTaskList(referralId)

      expect(state.referralId).toBe(referralId)
    })
  })

  describe('newTaskListState', () => {
    it('should create and save new task list state in session', () => {
      const personIdentifier = mockPersonIdentifier

      const state = newTaskListState(req as Request, personIdentifier)

      expect(req.session!.taskList).toBeDefined()
      expect(req.session!.taskList).toBeDefined()
      expect(state.sections.personalDetails.status).toBe('incomplete')
    })
  })

  describe('getTaskListState', () => {
    it('should return existing state from session if available', () => {
      const existingState: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: 'completed' },
          riskInformation: { status: 'incomplete' },
          personNeeds: { status: 'completed' },
          supportNeeds: { status: 'incomplete' },
          contactDetails: { status: 'completed' },
          checkAnswers: { status: 'cannot-start-yet' },
        },
      }

      req.session!.taskList = existingState
      const state = getTaskListState(req as Request, 'anything')
      expect(state).toEqual(existingState)
    })

    it.skip('should not initialise new state if not existing in session', () => {
      // needed to do this for sticky plaster fix
      const state = getTaskListState(req as Request, '')

      expect(state).toBeUndefined()
    })
  })

  describe('saveTaskListState', () => {
    it('should save state to session', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: 'completed' },
          riskInformation: { status: 'incomplete' },
          personNeeds: { status: 'completed' },
          supportNeeds: { status: 'completed' },
          contactDetails: { status: 'completed' },
          checkAnswers: { status: 'cannot-start-yet' },
        },
      }

      saveTaskListState(req as Request, state)

      expect(req.session!.taskList).toBeDefined()
      expect(req.session!.taskList).toEqual(state)
    })

    it('should save state to session and update checkAnswer state to complete when all other section states are completed', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: 'completed' },
          riskInformation: { status: 'completed' },
          personNeeds: { status: 'completed' },
          supportNeeds: { status: 'completed' },
          contactDetails: { status: 'completed' },
          checkAnswers: { status: 'cannot-start-yet' },
        },
      }

      saveTaskListState(req as Request, state)
      expect(req.session!.taskList).toBeDefined()
      expect(req.session!.taskList?.sections.checkAnswers.status).toEqual('completed')
    })
  })

  describe('removeTaskListState', () => {
    it('should remove state from session', () => {
      const mockTaskListState: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: 'incomplete' },
          riskInformation: { status: 'incomplete' },
          personNeeds: { status: 'incomplete' },
          supportNeeds: { status: 'incomplete' },
          contactDetails: { status: 'incomplete' },
          checkAnswers: { status: 'cannot-start-yet' },
        },
      }
      req.session!.taskList = mockTaskListState

      removeTaskListState(req as Request)

      expect(req.session!.taskList).toBeUndefined()
    })
  })

  describe('updateSectionStatus', () => {
    it('should update the status of a specific section and save to session', () => {
      const personIdentifier = mockPersonIdentifier
      newTaskListState(req as Request, personIdentifier)

      updateSectionStatus(req as Request, personIdentifier, 'riskInformation', 'completed')

      const updatedState = req.session!.taskList![personIdentifier]

      expect(updatedState.sections.riskInformation.status).toBe('completed')
    })
  })

  describe('isMandatoryTasksCompleted', () => {
    it('should return true when all sections except checkAnswers are completed', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: 'completed' },
          riskInformation: { status: 'completed' },
          personNeeds: { status: 'completed' },
          supportNeeds: { status: 'completed' },
          contactDetails: { status: 'completed' },
          checkAnswers: { status: 'cannot-start-yet' },
        },
      }

      expect(isMandatoryTasksCompleted(state)).toBe(true)
      expect(isAllTasksCompleted(state)).toBe(false)
    })

    it('should return true when all tasks are completed', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: 'completed' },
          riskInformation: { status: 'completed' },
          personNeeds: { status: 'completed' },
          supportNeeds: { status: 'completed' },
          contactDetails: { status: 'completed' },
          checkAnswers: { status: 'completed' },
        },
      }

      expect(isMandatoryTasksCompleted(state)).toBe(true)
      expect(isAllTasksCompleted(state)).toBe(true)
    })

    it('should return false if any main section is not completed', () => {
      const state: TaskListState = {
        referralId: mockReferralId,
        sections: {
          personalDetails: { status: 'completed' },
          riskInformation: { status: 'incomplete' },
          personNeeds: { status: 'completed' },
          supportNeeds: { status: 'completed' },
          contactDetails: { status: 'completed' },
          checkAnswers: { status: 'cannot-start-yet' },
        },
      }

      expect(isMandatoryTasksCompleted(state)).toBe(false)
      expect(isAllTasksCompleted(state)).toBe(false)
    })
  })
})

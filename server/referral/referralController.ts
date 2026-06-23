import { Request, Response, NextFunction } from 'express'
import { CreateReferralRequest, ReferralUserAssignmentsResponse, AssignmentFailureDto } from '@community-support-api'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import logger from '../../logger'
import CheckReferralInformationPresenter from './check-referral-information/checkReferralInformationPresenter'
import ReferralDetailsPresenter from './referralDetails/ReferralDetailsPresenter'
import ReferralProgressPresenter from './progress/referralProgressPresenter'
import TaskListHelper from './taskList/TaskListHelper'
import TaskListPresenter from './taskList/TaskListPresenter'
import { ErrorMiddlewareErrors } from '../@types/express'
import getLatestAppointments from './progress/getLatestAppointments'

class ReferralController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly personService: PersonService,
  ) {}

  async showReferralPage(req: Request, res: Response, next: NextFunction) {
    const referralId = req.params.id as string
    const { username } = res.locals.user
    const referral = await this.referralService.getReferralById(referralId, username)
    return res.render('referral/referral', { referral })
  }

  async showReferralDetailsPage(req: Request, res: Response) {
    const referralId = req.params.id as string
    const results = req.session.assignmentResults ? { ...req.session.assignmentResults } : null
    delete req.session.assignmentResults
    const { username } = res.locals.user
    return this.referralService
      .getCaseDetailsByCaseIdentifier(referralId, username)
      .then(dto => new ReferralDetailsPresenter(dto, results))
      .then(presenter => presenter.renderPage(res))
  }

  async handleFindPersonRequest(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      const { personIdentifier } = req.body
      const { username } = res.locals.user
      try {
        const foundPerson = await this.personService.getPersonByIdentifier(personIdentifier, username)
        const presenter = new FoundPersonPresenter(foundPerson)
        req.session.referralCreationDetails = { personDetails: foundPerson } as CreateReferralRequest
        return presenter.renderPage(res)
      } catch (error) {
        if (error.responseStatus === 404) {
          req.flash('personIdentifierError', `No person with identifier '${personIdentifier}' found`)
        } else {
          logger.error('Error finding person by identifier:', error)
          req.flash('personIdentifierError', 'An unexpected error occurred. Please try again.')
        }
        return res.redirect('/referral/new/find-a-person')
      }
    }
    return res.render('referral/findPerson', {
      content: {
        backLink: { href: '/' },
      },
    })
  }

  async viewConfirmation(req: Request, res: Response, next: NextFunction): Promise<void> {
    const referralId = req.params.id as string
    const { username } = res.locals.user
    const referral = await this.referralService.getReferralById(referralId, username)

    const presenter = new ConfirmationPresenter(referral)

    return presenter.renderPage(res)
  }

  async checkReferralInformation(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const referralId = req.params.id as string
    const referralCreationDetails = req.session ? (req.session.referralCreationDetails as CreateReferralRequest) : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    try {
      const referralInformation = await this.referralService.getReferralInformation(referralId, username)
      const presenter = new CheckReferralInformationPresenter(referralInformation)
      return presenter.renderPage(res)
    } catch (error) {
      logger.error('Error retrieving referral:', error)
      req.flash('Retrieving referral', 'An unexpected error when retrieving a referral. Please try again.')
      return res.redirect('/referral/new/find-a-person')
    }
  }

  async submitReferralInformation(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }

    const submitReferralResponse = await this.referralService.submitReferralById(referralId, username)

    return res.redirect(`/referral/${submitReferralResponse.referralId}/confirmation`)
  }

  async showAssignCaseWorkersPage(req: Request, res: Response, next: NextFunction) {
    const { identifier } = req.params as { identifier: string }
    const { username } = res.locals.user
    const viewModel = {
      content: {
        referralId: identifier,
        backLink: { href: `/referral-details/${identifier}` },
      },
    }
    try {
      const caseworkers = await this.referralService.getReferralUserAssignments(identifier, username)
      return res.render('referral/assign', { ...viewModel, caseworkers })
    } catch (error) {
      if (error.responseStatus === 404) {
        req.flash('referralIdError', `No referral with identifier '${identifier}' found`)
        return res.render('referral/assign', {
          ...viewModel,
          errors: {
            list: [{ href: '#referralIdError', text: `No referral with identifier '${identifier}' found` }],
            messages: { referralIdError: { text: `No referral with identifier '${identifier}' found` } },
          },
        })
      }
      req.flash('retrievalError', 'An unexpected error when retrieving user assignments. Please try again.')
      return res.render('referral/assign', {
        ...viewModel,
        errors: {
          list: [
            {
              href: '#retrievalError',
              text: `An unexpected error when retrieving user assignments. Please try again.`,
            },
          ],
          messages: {
            retrievalError: { text: `An unexpected error when retrieving user assignments. Please try again.` },
          },
        },
      })
    }
  }

  async submitReferralUserAssignments(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { identifier } = req.params as { identifier: string }
    const { caseworkers } = req.body
    const viewModel = {
      content: {
        referralId: identifier,
        backLink: { href: `/referral-details/${identifier}` },
      },
    }

    const errors: ErrorMiddlewareErrors = { list: [], messages: {} }

    const referralUserAssignmentsRequest = {
      emails: caseworkers
        .map((item: { email_address?: string }) => item?.email_address)
        .filter((email: { email?: string }) => typeof email === 'string'),
    }

    try {
      const referralUserAssignmentsResponse = await this.referralService.submitReferralUserAssignments(
        identifier,
        referralUserAssignmentsRequest,
        username,
      )
      if (referralUserAssignmentsResponse.success) {
        req.session.assignmentResults = referralUserAssignmentsResponse as ReferralUserAssignmentsResponse
        return res.redirect(`/referral-details/${identifier}`)
      }
      req.session.assignmentResults = referralUserAssignmentsResponse as ReferralUserAssignmentsResponse
      return res.redirect(`/referral/${identifier}/assign`)
    } catch (error) {
      if (error.responseStatus === 400) {
        const referralUserAssignmentsResponse = error.data || {}
        const formattedCaseworkers = caseworkers.map((item: { email_address?: string }) => ({
          emailAddress: item?.email_address ?? '',
        }))
        const uniqueCaseworkers = Array.from(
          new Map(formattedCaseworkers.map((item: { emailAddress: string }) => [item.emailAddress, item])).values(),
        )

        if (referralUserAssignmentsResponse.failureList.length === 0 && referralUserAssignmentsResponse.message) {
          errors.list.push({ href: `#generalError`, text: referralUserAssignmentsResponse.message })
          errors.messages.generalError = { text: referralUserAssignmentsResponse.message }
        }

        const fieldErrors: Record<string, { text: string }> = {}
        referralUserAssignmentsResponse.failureList.forEach((failure: AssignmentFailureDto, index: number) => {
          if (!failure.reason?.trim()) {
            return
          }
          const key = `caseworkers[${index}][email_address]`
          fieldErrors[key] = { text: failure.reason.trim() }
          errors.list.push({ href: `#caseworkers[${index}][email_address]`, text: failure.reason.trim() })
          errors.messages[`caseworkers[${index}][email_address]`] = { text: failure.reason.trim() }
        })

        return res.render('referral/assign', {
          ...viewModel,
          caseworkers: uniqueCaseworkers,
          errors,
          fieldErrors,
        })
      }

      if (error.responseStatus === 404) {
        req.flash('referralError', `No referral with identifier '${identifier}' found`)
      } else {
        req.flash('assignmentError', 'An unexpected error when assigning case workers. Please try again.')
      }
      return res.redirect(`referral/${identifier}/assign`)
    }
  }

  async showReferralProgressDetails(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }
    const { username } = res.locals.user
    const sessionBanner = req.session.referralProgressBanner
    const bannerContent = sessionBanner?.caseReference === caseReference ? sessionBanner : undefined

    delete req.session.referralProgressBanner

    const referralProgress = await this.referralService.getReferralProgress(caseReference, username)

    req.session.icsFeedbackInfo = getLatestAppointments(referralProgress.appointments).map((appointment, index) => ({
      appointmentId: appointment.appointmentIcsId,
      icsFeedbackId: appointment.icsFeedbackId,
      appointmentDateTime: appointment.dateTime,
      rowIndex: index,
    }))

    const presenter = new ReferralProgressPresenter(referralProgress, caseReference, bannerContent)

    return presenter.renderPage(res)
  }

  async showTaskList(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralCreationDetails = req.session ? req.session.referralCreationDetails : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    const { personIdentifier } = referralCreationDetails.personDetails
    let taskListState = TaskListHelper.getTaskListState(req, personIdentifier)

    if (!taskListState.referralId) {
      try {
        const createReferralRequest = {
          personDetails: referralCreationDetails.personDetails,
          communityServiceProviderId: req.params.id as string,
          crn: referralCreationDetails.personDetails.personIdentifier,
          urgency: false,
        } as CreateReferralRequest

        const referralInformation = await this.referralService.createReferral(createReferralRequest, username)

        req.session.referralCreationDetails = createReferralRequest
        taskListState = { ...taskListState, referralId: referralInformation.referralId }
      } catch (error) {
        logger.error('Error creating referral:', error)
        req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
        return res.redirect('/referral/new/find-a-person')
      }
    }
    TaskListHelper.saveTaskListState(req, personIdentifier, taskListState)

    const presenter = new TaskListPresenter(
      `${referralCreationDetails.personDetails.firstName} ${referralCreationDetails.personDetails.lastName}`,
      taskListState,
    )

    return presenter.renderPage(res)
  }
}

export default ReferralController

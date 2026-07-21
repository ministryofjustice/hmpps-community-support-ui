import { Request, Response, NextFunction } from 'express'
import { ReferralUserAssignmentsResponse, AssignmentFailureDto } from '@community-support-api'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import logger from '../../logger'
import CheckReferralInformationPresenter from './check-referral-information/checkReferralInformationPresenter'
import ReferralDetailsPresenter from './referralDetails/ReferralDetailsPresenter'
import ReferralProgressPresenter from './progress/referralProgressPresenter'
import TaskListPresenter from './taskList/TaskListPresenter'
import { ErrorMiddlewareErrors } from '../@types/express'
import {
  getCurrentDraftReferralKey,
  getTaskListState,
  saveTaskListState,
  updateSectionStatus,
  removeTaskListState,
} from './taskList/TaskListHelper'
import ConfirmPersonalDetailsPresenter from './confirmPersonalDetails/ConfirmPersonalDetailsPresenter'
import AdditionalSuportNeedsPresenter from './additionalSupportNeeds/AdditionalSupportNeedsPresenter'
import ReferralCreationDetails from './referralDetails/ReferralCreationDetails'

export default class ReferralController {
  private static readonly CRN_REGEX = /^[A-Za-z]\d{6}$/

  private static readonly PRISON_NUMBER_REGEX = /^[A-Z]\d{4}[A-Z]{2}$/

  constructor(
    private readonly referralService: ReferralService,
    private readonly personService: PersonService,
  ) {}

  private static isValidPersonIdentifier(personIdentifier: string): boolean {
    const normalized = personIdentifier.trim().toUpperCase()
    return ReferralController.CRN_REGEX.test(normalized) || ReferralController.PRISON_NUMBER_REGEX.test(normalized)
  }

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
    const { username, authSource } = res.locals.user
    return this.referralService
      .getCaseDetailsByCaseIdentifier(referralId, username)
      .then(dto => new ReferralDetailsPresenter(dto, results, authSource))
      .then(presenter => presenter.renderPage(res))
  }

  async handlePostFindPersonRequest(req: Request, res: Response, next: NextFunction) {
    const personIdentifier = (req.body.personIdentifier as string | undefined) ?? ''
    const { username } = res.locals.user
    const trimmedIdentifier = personIdentifier.trim()

    if (!trimmedIdentifier) {
      req.flash('personIdentifierError', 'Enter a CRN or prison number')
      return res.redirect('/referral/new/find-a-person')
    }

    if (!ReferralController.isValidPersonIdentifier(trimmedIdentifier)) {
      req.flash(
        'personIdentifierError',
        'Enter a CRN or prison number in the correct format, like X123456 for a CRN or D0168GH for a prison number',
      )
      return res.redirect('/referral/new/find-a-person')
    }

    try {
      const normalizedIdentifier = trimmedIdentifier.toUpperCase()
      const foundPerson = await this.personService.getPersonByIdentifier(normalizedIdentifier, username)
      const presenter = new FoundPersonPresenter(foundPerson)
      req.session.referralCreationDetails = { personDetails: foundPerson }
      return presenter.renderPage(res)
    } catch (error) {
      if (error.responseStatus === 404) {
        req.flash('personIdentifierError', `No person with that CRN or prison number found`)
      } else {
        logger.error('Error finding person by identifier:', error)
        req.flash('personIdentifierError', 'An unexpected error occurred. Please try again.')
      }
      return res.redirect('/referral/new/find-a-person')
    }
  }

  async handleGetFindPersonRequest(req: Request, res: Response, next: NextFunction) {
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
    const referralCreationDetails: ReferralCreationDetails = req.session ? req.session.referralCreationDetails : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    try {
      const referralInformation = await this.referralService.getReferralInformation(referralId, username)

      req.session.referralCreationDetails.referralInformation = referralInformation
      const presenter = new CheckReferralInformationPresenter(
        referralInformation,
        referralCreationDetails.personDetails,
      )
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

    try {
      const submitReferralResponse = await this.referralService.submitReferralById(referralId, username)

      removeTaskListState(req)

      return res.redirect(`/referral/${submitReferralResponse.referralId}/confirmation`)
    } catch (error) {
      if (error.responseStatus === 409) {
        logger.info('Referral already submitted')
        return res.redirect(`/referral/${referralId}/confirmation`)
      }
      // no special error handling at this moment
      logger.error('Error in submitting a referral:', error)
      throw error
    }
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
    const { username, authSource } = res.locals.user
    const sessionBanner = req.session.referralProgressBanner
    const bannerContent = sessionBanner?.caseReference === caseReference ? sessionBanner : undefined

    delete req.session.referralProgressBanner

    const referralProgress = await this.referralService.getReferralProgress(caseReference, username)

    const presenter = new ReferralProgressPresenter(referralProgress, caseReference, bannerContent, authSource)

    return presenter.renderPage(res)
  }

  async showTaskList(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralCreationDetails: ReferralCreationDetails = req.session ? req.session.referralCreationDetails : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    const { personIdentifier } = referralCreationDetails.personDetails

    try {
      const createReferralRequest = {
        communityServiceProviderId: req.params.id as string,
        personIdentifier,
        urgency: false,
      }

      const referralInformation = await this.referralService.createReferral(createReferralRequest, username)

      req.session.referralCreationDetails.referralInformation = referralInformation
      const taskListState = {
        ...getTaskListState(req, referralInformation.referralId),
        referralId: referralInformation.referralId,
      }
      saveTaskListState(req, taskListState)

      const presenter = new TaskListPresenter(
        `${referralCreationDetails.personDetails.firstName} ${referralCreationDetails.personDetails.lastName}`,
        taskListState,
      )
      return presenter.renderPage(res)
    } catch (error) {
      logger.error('Error creating referral:', error)
      req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
      return res.redirect('/referral/new/find-a-person')
    }
  }

  async showConfirmPersonalDetails(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralKey = getCurrentDraftReferralKey(req)

    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    const data = await this.referralService.getPersonalDetails(draftReferralKey, username)
    const presenter = new ConfirmPersonalDetailsPresenter(data)
    return presenter.renderPage(res)
  }

  async confirmPersonalDetails(req: Request, res: Response): Promise<void> {
    const draftReferralKey = getCurrentDraftReferralKey(req)
    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }
    updateSectionStatus(req, draftReferralKey, 'personalDetails', 'completed')
    return res.redirect(`/referral/task-list/${draftReferralKey}`)
  }

  showAdditionalSupportNeeds(req: Request, res: Response) {
    const referralCreationDetails = req.session ? req.session.referralCreationDetails : null
    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    const { personDetails } = referralCreationDetails
    const presenter = new AdditionalSuportNeedsPresenter(personDetails)
    return presenter.renderPage(res)
  }
}

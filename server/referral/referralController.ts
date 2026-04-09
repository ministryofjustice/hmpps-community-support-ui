import { Request, Response, NextFunction } from 'express'
import {
  CreateReferralRequest,
  CaseWorkerDto,
  ReferralUserAssignmentsResponse,
  AssignmentFailureDto,
} from '@community-support-api'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import logger from '../../logger'
import CheckReferralInformationPresenter from './check-referral-information/checkReferralInformationPresenter'
import ReferralDetailsPresenter from './referralDetails/ReferralDetailsPresenter'
import ProgressPresenter from './progress/progressPresenter'

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
    return res.render('referral/findPerson', {})
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
    const referralCreationDetails = req.session ? req.session.referralCreationDetails : null

    if (!referralCreationDetails || !referralCreationDetails.personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    const createReferralRequest = {
      personDetails: referralCreationDetails.personDetails,
      communityServiceProviderId: req.params.id as string,
      crn: referralCreationDetails.personDetails.personIdentifier,
      urgency: false,
    } as CreateReferralRequest
    let referralInformation
    try {
      referralInformation = await this.referralService.createReferral(createReferralRequest, username)
    } catch (error) {
      logger.error('Error creating referral:', error)
      req.flash('create referral', 'An unexpected error when creating a referral. Please try again.')
      return res.redirect('/referral/new/find-a-person')
    }
    const presenter = new CheckReferralInformationPresenter(referralInformation)

    return presenter.renderPage(res)
  }

  async submitReferralInformation(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }

    const submitReferralResponse = await this.referralService.submitReferralById(referralId, username)

    return res.redirect(`/referral/${submitReferralResponse.referralId}/confirmation`)
  }

  async showAssignCaseWorkersPage(req: Request, res: Response, next: NextFunction) {
    const { referralId } = req.params as { referralId: string }
    const { username } = res.locals.user
    const viewModel = {
      referralId,
      backLink: { href: `/referral-details/${referralId}` },
    }
    try {
      const caseworkers = await this.referralService.getReferralUserAssignments(referralId, username)
      return res.render('referral/assign', { content: { ...viewModel }, caseworkers })
    } catch (error) {
      if (error.responseStatus === 404) {
        req.flash('referralIdError', `No referral with identifier '${referralId}' found`)
        return res.render('referral/assign', {
          content: {
            ...viewModel,
          },
          errorsList: [
            {
              href: '#referralIdError',
              text: `No referral with identifier '${referralId}' found`,
            },
          ],
        })
      }
      req.flash('retrievalError', 'An unexpected error when retrieving user assignments. Please try again.')
      return res.render('referral/assign', {
        content: {
          ...viewModel,
        },
        errorsList: [
          {
            href: '#retrievalError',
            text: `An unexpected error when retrieving user assignments. Please try again.`,
          },
        ],
      })
    }
  }

  async submitReferralUserAssignments(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const { referralId } = req.params as { referralId: string }
    const { caseworkers } = req.body
    let errorsList: Array<{ href: string; text: string }> = []

    const referralUserAssignmentsRequest = {
      emails: caseworkers
        .map((item: { email_address?: string }) => item?.email_address)
        .filter((email: { email?: string }) => typeof email === 'string'),
    }

    try {
      const referralUserAssignmentsResponse = await this.referralService.submitReferralUserAssignments(
        referralId,
        referralUserAssignmentsRequest,
        username,
      )
      if (referralUserAssignmentsResponse.success) {
        req.session.assignmentResults = referralUserAssignmentsResponse as ReferralUserAssignmentsResponse
        return res.redirect(`/referral-details/${referralId}`)
      }
      req.session.assignmentResults = referralUserAssignmentsResponse as ReferralUserAssignmentsResponse
      return res.redirect(`/referral/${referralId}/assign`)
    } catch (error) {
      if (error.responseStatus === 400) {
        const referralUserAssignmentsResponse = error.data || {}
        const formattedCaseworkers = caseworkers.map((item: { email_address?: string }) => ({
          emailAddress: item?.email_address,
        }))

        const fieldErrors: Record<string, { text: string }> = {}
        referralUserAssignmentsResponse.failureList.forEach((failure: AssignmentFailureDto, index: number) => {
          if (!failure.reason?.trim()) {
            return
          }
          const key = `caseworkers[${index}][email_address]`
          fieldErrors[key] = { text: failure.reason.trim() }
          errorsList.push({
            href: `#caseworkers[${index}][email_address]`,
            text: failure.reason.trim(),
          })
        })

        return res.render('referral/assign', {
          referralId,
          caseworkers: formattedCaseworkers,
          errorsList,
          errors: fieldErrors,
        })
      }
      if (error.responseStatus === 404) {
        req.flash('referralIdError', `No referral with identifier '${referralId}' found`)
        errorsList = [{ href: '#referralIdError', text: `No referral with identifier '${referralId}' found` }]
      } else {
        req.flash('assignmentError', 'An unexpected error when assigning case workers. Please try again.')
        errorsList = [
          { href: '#assignmentError', text: `An unexpected error when assigning case workers. Please try again.` },
        ]
      }
      return res.render('referral/assign', { referralId, errorsList })
    }
  }

  async showAssignedCaseWorkersPage(req: Request, res: Response, next: NextFunction) {
    const { referralId } = req.params as { referralId: string }

    if (referralId) {
      return res.render('referral/assign', { referralId })
    }
    return res.render('referral/assign')
  }

  async showReferralProgressDetails(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }
    const { username } = res.locals.user
    const referralProgress = await this.referralService.getReferralProgress(caseReference, username)
    const presenter = new ProgressPresenter(referralProgress, caseReference)

    return presenter.renderPage(res)
  }
}

export default ReferralController

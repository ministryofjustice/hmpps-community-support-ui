import { Request, Response, NextFunction } from 'express'
import { ReferralUserAssignmentsResponse, AssignmentFailureDto } from '@community-support-api'
import ReferralService from '../services/referralService'
import PersonService from '../services/personService'
import CommunityServiceProviderService from '../services/communityServiceProviderService'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import FoundPersonPresenter from './foundPerson/foundPersonPresenter'
import logger from '../../logger'
import ReferralDetailsPresenter from './referralDetails/ReferralDetailsPresenter'
import ReferralProgressPresenter from './progress/referralProgressPresenter'
import { ErrorMiddlewareErrors } from '../@types/express'
import ConfirmPersonalDetailsPresenter from './confirmPersonalDetails/ConfirmPersonalDetailsPresenter'
import TaskListPresenter from './taskList/TaskListPresenter'
import RiskSummaryPresenter from './riskSummary/RiskSummaryPresenter'
import buildRiskInformationRequest from './riskSummary/buildRiskInformationRequest'
import EditRiskSummaryPresenter from './editRiskSummary/EditRiskSummaryPresenter'
import buildRiskInformationRequestFromForm from './editRiskSummary/buildRiskInformationRequestFromForm'
import PersonNeedsPresenter, { personNeedsFormData } from './personNeeds/PersonNeedsPresenter'
import buildPersonNeedsRequest, { PersonNeeds } from './personNeeds/buildPersonNeedsRequest'
import { validateRequestBodyAgainstSchema } from '../validation/validationUtils'
import { PersonNeedsSchema } from '../validation/PersonNeedsFormData'
import SelectAreaPresenter from './selectArea/SelectAreaPresenter'
import { SelectAreaSchema } from '../validation/SelectAreaFormData'
import ConfirmAnAreaForReferralPresenter from './confirmAnAreaForReferral/ConfirmAnAreaForReferralPresenter'

export default class ReferralController {
  private static readonly CRN_REGEX = /^[A-Za-z]\d{6}$/

  private static readonly PRISON_NUMBER_REGEX = /^[A-Z]\d{4}[A-Z]{2}$/

  constructor(
    private readonly referralService: ReferralService,
    private readonly personService: PersonService,
    private readonly communityServiceProviderService: CommunityServiceProviderService,
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

  async handlePostFindPersonRequest(req: Request, res: Response) {
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
      req.session.personId = foundPerson.personIdentifier
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

  async viewConfirmation(req: Request, res: Response): Promise<void> {
    const referralId = req.params.id as string
    const { username } = res.locals.user
    const referral = await this.referralService.getReferralById(referralId, username)

    const presenter = new ConfirmationPresenter(referral)

    return presenter.renderPage(res)
  }

  async showAssignCaseWorkersPage(req: Request, res: Response) {
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
    const { draftReferralId } = req.session
    if (!draftReferralId) {
      return res.redirect('/referral/new/find-a-person')
    }

    const taskListStatus = await this.referralService.getTaskListStatus(draftReferralId, username)
    const presenter = new TaskListPresenter(taskListStatus, draftReferralId)
    return presenter.renderPage(res)
  }

  async showConfirmPersonalDetails(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const draftReferralKey = req.session.draftReferralId

    if (draftReferralKey) {
      try {
        const data = await this.referralService.getPersonalDetails(draftReferralKey, username)
        const presenter = new ConfirmPersonalDetailsPresenter(data)
        return presenter.renderPage(res)
      } catch (e) {
        logger.error(e)
        req.flash('confirmPersonalDetailsError', 'something has gone wrong')
        return res.redirect('/referral/new/find-a-person')
      }
    }
    return res.redirect('/referral/new/find-a-person')
  }

  async confirmPersonalDetails(req: Request, res: Response) {
    const draftReferralId = req.session?.draftReferralId
    if (draftReferralId) {
      return res.redirect('/referral/task-list')
    }
    return res.redirect('/referral/new/find-a-person')
  }

  async showRiskSummary(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId

    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    const risk = await this.referralService.getRoshRisksByReferralId(draftReferralKey, username)
    const presenter = new RiskSummaryPresenter(risk, draftReferralKey)
    return presenter.renderPage(res)
  }

  async confirmRiskSummary(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId
    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    const risk = await this.referralService.getRoshRisksByReferralId(draftReferralKey, username)
    const riskInformation = buildRiskInformationRequest(risk)
    await this.referralService.saveRiskInformation(draftReferralKey, riskInformation, username)
    return res.redirect('/referral/task-list')
  }

  async showEditRiskSummary(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId

    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    const risk = await this.referralService.getRoshRisksByReferralId(draftReferralKey, username)
    const presenter = new EditRiskSummaryPresenter(risk)
    return presenter.renderPage(res)
  }

  async submitEditRiskSummary(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId
    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    const riskInformation = buildRiskInformationRequestFromForm(req.body)
    await this.referralService.saveRiskInformation(draftReferralKey, riskInformation, username)
    return res.redirect('/referral/task-list/view-risk-summary')
  }

  async showConfirmAnAreaForReferral(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId
    const providerId = req.session?.selectedProviderId
    const personDetails = req.session?.referralCreationDetails?.personDetails

    if (!draftReferralKey || !personDetails) {
      return res.redirect('/referral/new/find-a-person')
    }

    if (!providerId) {
      return res.redirect('/referral/task-list/select-an-area-for-referral')
    }

    const providerDetails = await this.communityServiceProviderService.getCommunityServiceProviderDetails(
      draftReferralKey,
      providerId,
      username,
    )
    const presenter = new ConfirmAnAreaForReferralPresenter(providerDetails, personDetails)
    return presenter.renderPage(res)
  }

  async submitConfirmAnAreaForReferral(req: Request, res: Response): Promise<void> {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId
    const providerId = req.session?.selectedProviderId

    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    if (!providerId) {
      return res.redirect('/referral/task-list/select-an-area-for-referral')
    }

    await this.communityServiceProviderService.saveCommunityServiceProvider(draftReferralKey, providerId, username)
    return res.redirect('/referral/task-list')
  }

  async communityServiceProviderPage(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralRequest = {
      personIdentifier: req.session.personId,
    }
    try {
      const draftReferral = await this.referralService.createReferral(referralRequest, username)
      delete req.session.personId
      req.session.draftReferralId = draftReferral.referralId
      res.redirect('/referral/task-list')
    } catch (e) {
      logger.error(e)
      res.redirect('/referral/new/find-a-person')
    }
  }

  async showPersonNeeds(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralId = req.session?.draftReferralId
    if (!draftReferralId) {
      return res.redirect('/referral/new/find-a-person')
    }

    let pageData: personNeedsFormData
    if (req.session.referralCreationDetails.personNeeds) {
      pageData = {
        referralId: draftReferralId,
        refereeName: {
          firstName: req.session.referralCreationDetails.personDetails.firstName,
          middleName: req.session.referralCreationDetails.personDetails.middleNames,
          lastName: req.session.referralCreationDetails.personDetails.lastName,
        },
      }
      if (req.session.referralCreationDetails.personNeeds.personNeedsCheckboxes) {
        pageData.hasAccommodationNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('accommodation')
        pageData.accommodationDetails = req.session.referralCreationDetails.personNeeds?.accommodationInput
        pageData.hasEmploymentEducationNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('employment')
        pageData.employmentEducationDetails = req.session.referralCreationDetails.personNeeds?.employmentInput
        pageData.hasFinancialNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('finances')
        pageData.financialDetails = req.session.referralCreationDetails.personNeeds?.financesInput
        pageData.hasPersonalRelationshipsCommunityNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('relationships')
        pageData.personalRelationshipsCommunityDetails =
          req.session.referralCreationDetails.personNeeds?.relationshipsInput
        pageData.hasDrugUseNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('drugUse')
        pageData.drugUseDetails = req.session.referralCreationDetails.personNeeds?.drugUseInput
        pageData.hasAlcoholUseNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('alcoholUse')
        pageData.alcoholUseDetails = req.session.referralCreationDetails.personNeeds?.alcoholUseInput
        pageData.hasHealthWellbeingNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('health')
        pageData.healthWellbeingDetails = req.session.referralCreationDetails.personNeeds?.healthInput
        pageData.hasThinkingBehavioursAttitudeNeeds =
          req.session.referralCreationDetails.personNeeds?.personNeedsCheckboxes.includes('thinking')
        pageData.thinkingBehavioursAttitudeDetails = req.session.referralCreationDetails.personNeeds?.thinkingInput
      }
    } else {
      try {
        pageData = await this.referralService.getPersonNeeds(draftReferralId, username)
      } catch {
        logger.info(
          `No criminogenic needs found for person identifier ${req.session.referralCreationDetails.personDetails.personIdentifier}`,
        )
        pageData = {
          referralId: draftReferralId,
          refereeName: {
            firstName: req.session.referralCreationDetails.personDetails.firstName,
            middleName: req.session.referralCreationDetails.personDetails.middleNames,
            lastName: req.session.referralCreationDetails.personDetails.lastName,
          },
        }
      }
    }
    const validationErrors = res.locals.errors

    const presenter = new PersonNeedsPresenter(pageData, validationErrors)
    return presenter.renderPage(res)
  }

  async recordPersonNeeds(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralId = req.session?.draftReferralId
    if (!draftReferralId) {
      return res.redirect('/referral/new/find-a-person')
    }
    const { referralCreationDetails } = req.session
    referralCreationDetails.personNeeds = req.body as PersonNeeds

    return validateRequestBodyAgainstSchema(PersonNeedsSchema, req, res, async () => {
      const personNeedsRequest = buildPersonNeedsRequest(req.body as PersonNeeds)
      await this.referralService.savePersonNeeds(draftReferralId, personNeedsRequest, username)
      delete req.session.referralCreationDetails.personNeeds
      return res.redirect('/referral/task-list')
    })
  }

  async showSelectArea(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferralKey = req.session?.draftReferralId

    if (!draftReferralKey) {
      return res.redirect('/referral/new/find-a-person')
    }

    if (req.method === 'POST') {
      return validateRequestBodyAgainstSchema(SelectAreaSchema, req, res, async form => {
        req.session.selectedProviderId = form.selectArea
        return res.redirect('/referral/task-list/confirm-an-area-for-referral')
      })
    }
    const validationErrors = res.locals.errors
    const locations = await this.referralService.getCommunitySupportServiceProviders(draftReferralKey, username)
    const presenter = new SelectAreaPresenter(
      req.session.referralCreationDetails.personDetails,
      locations,
      validationErrors,
      req.session.selectedProviderId,
    )
    return presenter.renderPage(res)
  }
}

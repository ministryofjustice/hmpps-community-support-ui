import { Request, Response } from 'express'
import { AdditionalSupportNeedsRequest, ServiceEndDatePageDto } from '@community-support-api'
import ReferralService from '../services/referralService'
import AdditionalSuportNeedsPresenter from './additionalSupportNeeds/AdditionalSupportNeedsPresenter'
import { formatDynamicErrorMessages, validateRequestBodyAgainstSchema } from '../validation/validationUtils'
import {
  AdditionalSuportNeedsFormData,
  AdditionalSuportNeedsFormDataSchemaBuilder,
} from '../validation/AdditionalSuportNeedsFormData'
import logger from '../../logger'
import NeedsAnInterpreterPresenter from './needsAnInterpreter/NeedsAnInterpreterPresenter'
import {
  NeedsAnInterpreterFormDataSchemaBuilder,
  NeedsAnInterpreterFormData,
} from '../validation/NeedsAnInterpreterFormDataSchema'
import { ErrorMiddlewareErrors } from '../@types/express'
import additionalSupportNeedsResolver from './additionalSupportNeeds/additionalSupportNeedsResolver'
import { ServiceDaysFormData, ServiceDaysSchema } from '../validation/ServiceDaysFormData'
import ServiceDaysPagePresenter from './serviceDays/ServiceDaysPagePresenter'
import { ServiceEndDateSchema, ServiceEndDateFormData } from '../validation/ServiceEndDateFormData'
import ServiceEndDatePagePresenter from './serviceEndDate/ServiceEndDatePagePresenter'
import AdditionalInformationForTheDeliveryPartnerPresenter from './additionalInformationForTheDeliveryPartner /AdditionalInformationForTheDeliveryPartnerPresenter'

const findAPersonURL = '/referral/new/find-a-person' as const
const taskListURL = '/referral/task-list' as const
const additionalSupportNeedsURL = '/referral/task-list/additional-support-needs' as const
const needsInterpreterURL = '/referral/task-list/needs-an-interpreter' as const
const serviceEndDateURL = '/referral/task-list/service-end-date' as const
const serviceDaysURL = '/referral/task-list/service-days' as const
const checkOffenceURL = '/referral/task-list/check-offence' as const

const additionalSupportNeedsBodyLookup: Record<string, keyof AdditionalSupportNeedsRequest> = {
  Anything: 'anythingElse',
  Caring: 'caringResponsibilities',
  Diversity: 'diversity',
  Employment: 'employmentResponsibilities',
  Location: 'locationTravel',
  Mental: 'mentalEmotionalHealth',
  Neurodiversity: 'neurodiversity',
  Physical: 'physicalHealth',
}

const buildDateStringFromForm = (form: ServiceEndDateFormData): string => {
  const day = Number.parseInt(form['target_service_completion_date-day'], 10)
  const month = Number.parseInt(form['target_service_completion_date-month'], 10)
  const year = Number.parseInt(form['target_service_completion_date-year'], 10)

  return new Date(year, month - 1, day).toISOString()
}

export default class DraftReferralController {
  constructor(private readonly referralService: ReferralService) {}

  async showAdditionalSupportNeeds(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (draftReferalId) {
      try {
        const postBodyDataRaw = req.flash('value').at(0)
        const postBodyData = JSON.parse(postBodyDataRaw || '{}')
        const additionalSupportNeeds = await this.referralService.getAdditionalSupportNeeds(draftReferalId, username)
        const validationErrors: ErrorMiddlewareErrors = formatDynamicErrorMessages(
          res.locals.errors,
          '{{ firstname }}',
          additionalSupportNeeds.refereeName.firstName,
        )
        const resolvedData = additionalSupportNeedsResolver(postBodyData, additionalSupportNeeds)
        const presenter = new AdditionalSuportNeedsPresenter(resolvedData, validationErrors)
        return presenter.renderPage(res)
      } catch (e) {
        logger.error(e)
        req.flash('confirmPersonalDetailsError', 'something has gone wrong')
        return res.redirect(findAPersonURL)
      }
    }
    return res.redirect(findAPersonURL)
  }

  async additionalSupportNeeds(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (draftReferalId) {
      try {
        const additionalSupportNeeds = await this.referralService.getAdditionalSupportNeeds(draftReferalId, username)
        const schema = AdditionalSuportNeedsFormDataSchemaBuilder(additionalSupportNeeds.refereeName.firstName)
        return validateRequestBodyAgainstSchema(schema, req, res, async (data: AdditionalSuportNeedsFormData) => {
          const needsAdditionalSupport = !data.AdditionalNeeds.includes('none')
          const selectedData = Object.fromEntries(
            data.AdditionalNeeds.filter(selection => selection !== 'none').map(selection => [
              additionalSupportNeedsBodyLookup[selection],
              data[`${selection}Value`],
            ]),
          )
          const body = { needsAdditionalSupport, ...selectedData }
          await this.referralService.submitAdditionalSupportNeeds(body, draftReferalId, username)
          return res.redirect(needsInterpreterURL)
        })
      } catch (e) {
        logger.error(e)
        req.flash(`additionalSupportNeedsError`, `something went wrong`)
        return res.redirect(additionalSupportNeedsURL)
      }
    }
    return res.redirect(findAPersonURL)
  }

  async showNeedsAnInterpreter(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (!draftReferalId) {
      return res.redirect(findAPersonURL)
    }
    try {
      const pageData = await this.referralService.getNeedsInterpreterPageData(draftReferalId, username)
      const validationErrors: ErrorMiddlewareErrors = formatDynamicErrorMessages(
        res.locals.errors,
        '{{ firstname }}',
        pageData.refereeName.firstName,
      )
      const presenter = new NeedsAnInterpreterPresenter(pageData, validationErrors)
      return presenter.renderPage(res)
    } catch (e) {
      logger.error(e)
      return res.redirect(findAPersonURL)
    }
  }

  async needsAnInterpreter(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (draftReferalId) {
      try {
        const additionalSupportNeeds = await this.referralService.getAdditionalSupportNeeds(draftReferalId, username)
        const schema = NeedsAnInterpreterFormDataSchemaBuilder(additionalSupportNeeds.refereeName.firstName)
        return validateRequestBodyAgainstSchema(schema, req, res, async (data: NeedsAnInterpreterFormData) => {
          await this.referralService.submitNeedsAnInterpreter(data, draftReferalId, username)
          return res.redirect(taskListURL)
        })
      } catch (e) {
        logger.error(e)
        return res.redirect(findAPersonURL)
      }
    }
    return res.redirect(findAPersonURL)
  }

  async showServiceEndDatePage(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralId = req.session?.draftReferralId
    const formData = req.session.serviceEndDateForm
    const validationErrors = res.locals.errors
    delete req.session.serviceEndDateForm

    let data: ServiceEndDatePageDto = {
      target_service_completion_date: undefined,
      target_service_completion_reason: undefined,
    }

    if (referralId) {
      try {
        data = await this.referralService.getServiceEndDatePage(referralId, username)
      } catch {
        logger.info(`No existing service end date found for referral ${referralId}`)
      }
    }

    res.locals.errors = validationErrors
    const presenter = new ServiceEndDatePagePresenter(
      data,
      formData
        ? {
            day: formData.target_service_completion_date_day,
            month: formData.target_service_completion_date_month,
            year: formData.target_service_completion_date_year,
            reason: formData.target_service_completion_reason,
          }
        : undefined,
    )
    return presenter.renderPage(res)
  }

  async updateServiceEndDatePage(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralId = req.session?.draftReferralId

    if (!referralId) {
      return res.redirect(taskListURL)
    }

    req.session.serviceEndDateForm = {
      target_service_completion_date_day: req.body['target_service_completion_date-day'],
      target_service_completion_date_month: req.body['target_service_completion_date-month'],
      target_service_completion_date_year: req.body['target_service_completion_date-year'],
      target_service_completion_reason: req.body.target_service_completion_reason,
    }

    return validateRequestBodyAgainstSchema(ServiceEndDateSchema, req, res, async (form: ServiceEndDateFormData) => {
      try {
        const updateData: ServiceEndDatePageDto = {
          target_service_completion_date: buildDateStringFromForm(form),
          target_service_completion_reason: form.target_service_completion_reason.trim(),
        }

        await this.referralService.updateServiceEndDatePage(referralId, updateData, username)
        delete req.session.serviceEndDateForm
        return res.redirect(serviceDaysURL)
      } catch (e) {
        logger.error(e)
        const updateErrorMessage =
          (res.locals.content as Record<string, string>)?.updateError ||
          'Something has gone wrong updating the service end date'
        req.flash('serviceEndDateError', updateErrorMessage)
        return res.redirect(serviceEndDateURL)
      }
    })
  }

  async showServiceDaysPage(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralId = req.session?.draftReferralId
    const postFormDataRaw = req.flash('value').at(0)
    const formData = JSON.parse(postFormDataRaw || '{}')
    const validationErrors = res.locals.errors

    if (!referralId) {
      return res.redirect(taskListURL)
    }

    try {
      const data = await this.referralService.getServiceDaysPage(referralId, username)
      const presenter = new ServiceDaysPagePresenter(data, validationErrors, formData)
      return presenter.renderPage(res)
    } catch (error) {
      logger.error('Error retrieving service days page:', error)
      req.flash('serviceDaysError', 'Failed to load service days page')
      return res.redirect(taskListURL)
    }
  }

  async updateServiceDaysPage(req: Request, res: Response) {
    const { username } = res.locals.user
    const referralId = req.session?.draftReferralId

    if (!referralId) {
      return res.redirect(taskListURL)
    }

    return validateRequestBodyAgainstSchema(ServiceDaysSchema, req, res, async (form: ServiceDaysFormData) => {
      try {
        const updateData = {
          service_days: form.serviceDays,
        }

        await this.referralService.updateServiceDaysPage(referralId, updateData, username)
        return res.redirect(checkOffenceURL)
      } catch (e) {
        logger.error(e)
        const updateErrorMessage =
          (res.locals.content as Record<string, string>)?.updateError ||
          'Something has gone wrong updating the service days'
        req.flash('serviceDaysError', updateErrorMessage)
        return res.redirect(serviceDaysURL)
      }
    })
  }

  async showAdditionalInformationForDeliveryPartner(req: Request, res: Response) {
    const { username } = res.locals.user
    const draftReferalId = req.session?.draftReferralId
    if (!draftReferalId) {
      return res.redirect(findAPersonURL)
    }
    try {
      const pageData = await this.referralService.getAdditionalInformationForDeliveryPartner(draftReferalId, username)
      const validationErrors: ErrorMiddlewareErrors = formatDynamicErrorMessages(
        res.locals.errors,
        '{{ firstname }}',
        pageData.refereeName.firstName,
      )
      const presenter = new AdditionalInformationForTheDeliveryPartnerPresenter(pageData, validationErrors)
      return presenter.renderPage(res)
    } catch (e) {
      logger.error(e)
      return res.redirect(findAPersonURL)
    }
  }

  additionalInformationForDeliveryPartner(req: Request, res: Response) {
    res.json(req.body)
  }
}

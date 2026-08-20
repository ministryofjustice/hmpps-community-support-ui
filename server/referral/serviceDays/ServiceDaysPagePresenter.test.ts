import { Response } from 'express'
import { ServiceDaysPageDto } from '@community-support-api'
import ServiceDaysPagePresenter from './ServiceDaysPagePresenter'
import { ErrorMiddlewareErrors } from '../../@types/express'
import loadContentData from '../../testutils/loadContentData'

const content = loadContentData('/referral/task-list/service-days')

describe('ServiceDaysPagePresenter', () => {
  describe('buildViewModel', () => {
    const res = {
      locals: {
        content,
      },
    } as unknown as Response

    const noErrors: ErrorMiddlewareErrors = { list: [], messages: {} }

    test('builds view model from DTO when no form data is provided', () => {
      const dto: ServiceDaysPageDto = { service_days: 20 }

      const presenter = new ServiceDaysPagePresenter(dto, noErrors)
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.pageTitle).toBe(content.pageTitle)
      expect(viewModel.pageHeader).toBe(content.pageHeader)
      expect(viewModel.hint).toBe(content.hint)
      expect(viewModel.backLink.href).toBe(content.backLink)
      expect(viewModel.button.text).toBe(content.continueButton)
      expect(viewModel.input.value).toBe('20')
      expect(viewModel.input.errorMessage).toBeNull()
    })

    test('prefers form data over DTO value', () => {
      const dto: ServiceDaysPageDto = { service_days: 20 }

      const presenter = new ServiceDaysPagePresenter(dto, noErrors, { serviceDays: '35' })
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.input.value).toBe('35')
    })

    test('renders empty input when DTO has no service_days and no form data', () => {
      const dto: ServiceDaysPageDto = {}

      const presenter = new ServiceDaysPagePresenter(dto, noErrors)
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.input.value).toBe('')
    })

    test('renders empty input when form data serviceDays is undefined', () => {
      const dto: ServiceDaysPageDto = {}

      const presenter = new ServiceDaysPagePresenter(dto, noErrors, {})
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.input.value).toBe('')
    })

    test('sets error message when validation error is present', () => {
      const dto: ServiceDaysPageDto = {}
      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: { serviceDays: { text: 'Enter the number of days you will use for this service' } },
      }

      const presenter = new ServiceDaysPagePresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.input.errorMessage).toEqual({ text: 'Enter the number of days you will use for this service' })
    })
  })

  describe('getTemplatePath', () => {
    test('returns the correct template path', () => {
      const presenter = new ServiceDaysPagePresenter({}, { list: [], messages: {} })
      expect(presenter.getTemplatePath()).toBe('referral/service-days')
    })
  })
})

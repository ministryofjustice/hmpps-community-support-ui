import { Response } from 'express'
import { ServiceDaysPageDto } from '@community-support-api'
import ServiceDaysPagePresenter from './ServiceDaysPagePresenter'
import { ErrorMiddlewareErrors } from '../../@types/express'
import loadContentData from '../../testutils/loadContentData'

const content = loadContentData('/referral/task-list/service-days')
const pageContent = {
  pageTitle: 'How many days will you use for this service?  - Community Support',
  h2: 'How many days will you use for this service?',
  bodyText1:
    'Enter the maximum number of days you want to use for this service. Any unused days will be given back. For community orders or suspended sentences, consider how many RAR days to allocate.',
  bodyText2: 'Sessions delivered in the community are enforceable.',
  continueButton: 'Save and continue',
}
const errorMessage = {
  nothingEntered: 'Enter the number of days you will use for this service',
} as const

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

      expect(viewModel.pageTitle).toBe(pageContent.pageTitle)
      expect(viewModel.pageHeader).toBe(pageContent.h2)
      expect(viewModel.bodyText1).toBe(pageContent.bodyText1)
      expect(viewModel.backLink.href).toBe(content.backLink)
      expect(viewModel.button.text).toBe(pageContent.continueButton)
      expect(viewModel.input.label.text).toBe(pageContent.bodyText2)
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

      const presenter = new ServiceDaysPagePresenter(dto, noErrors, undefined)
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
        messages: { serviceDays: { text: errorMessage.nothingEntered } },
      }

      const presenter = new ServiceDaysPagePresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.input.errorMessage).toEqual({ text: errorMessage.nothingEntered })
    })
  })

  describe('getTemplatePath', () => {
    test('returns the correct template path', () => {
      const presenter = new ServiceDaysPagePresenter({}, { list: [], messages: {} })
      expect(presenter.getTemplatePath()).toBe('referral/service-days')
    })
  })
})

import { Response } from 'express'
import ServiceEndDatePagePresenter from './ServiceEndDatePagePresenter'
import { ServiceEndDatePageContent } from './ServiceEndDatePageModel'

describe('ServiceEndDatePagePresenter', () => {
  test('should build view model with page content and data', () => {
    const content: ServiceEndDatePageContent = {
      pageTitle: 'Service End Date',
      pageHeader: 'Set the target service completion date',
      hint: 'This is the date by which the service should be completed.',
      dateLabel: 'Target service completion date',
      reasonLabel: 'Reason for this date',
      reasonHint: 'Explain why this date was chosen',
      backLink: '/referral/task-list',
      continueButton: 'Continue',
    }

    const res = {
      locals: {
        content,
      },
    } as unknown as Response

    const data = {
      target_service_completion_date: '2026-12-31',
      target_service_completion_reason: 'Test reason',
    }

    const presenter = new ServiceEndDatePagePresenter(data)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.pageTitle).toBe('Service End Date')
    expect(viewModel.pageHeader).toBe('Set the target service completion date')
    expect(viewModel.hint).toBe('This is the date by which the service should be completed.')
    expect(viewModel.dateLabel).toBe('Target service completion date')
    expect(viewModel.reasonLabel).toBe('Reason for this date')
    expect(viewModel.reasonHint).toBe('Explain why this date was chosen')
    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.targetServiceCompletionDate).toBe('2026-12-31')
    expect(viewModel.targetServiceCompletionReason).toBe('Test reason')
  })

  test('should handle missing optional data fields', () => {
    const content: ServiceEndDatePageContent = {
      pageTitle: 'Service End Date',
      pageHeader: 'Set the target service completion date',
      hint: 'This is the date by which the service should be completed.',
      dateLabel: 'Target service completion date',
      reasonLabel: 'Reason for this date',
      reasonHint: 'Explain why this date was chosen',
      backLink: '/referral/task-list',
      continueButton: 'Continue',
    }

    const res = {
      locals: {
        content,
      },
    } as unknown as Response

    const data = {}

    const presenter = new ServiceEndDatePagePresenter(data)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.targetServiceCompletionDate).toBeUndefined()
    expect(viewModel.targetServiceCompletionReason).toBeUndefined()
  })
})

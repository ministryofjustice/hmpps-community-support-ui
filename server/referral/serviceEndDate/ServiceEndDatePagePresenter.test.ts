import { Response } from 'express'
import ServiceEndDatePagePresenter from './ServiceEndDatePagePresenter'
import { ServiceEndDatePageContent } from './ServiceEndDatePageModel'

describe('ServiceEndDatePagePresenter', () => {
  test('should build view model with page content and data', () => {
    const content: ServiceEndDatePageContent = {
      pageTitle: 'Service End Date',
      pageHeader: 'What date does the service need to be completed by?',
      hint: 'This is the date by which the service should be completed.',
      dateLabel: 'Date',
      dateHint: 'For example, 31 3 2027',
      reasonLabel: 'Why does it need to be completed by this date?',
      reasonHint: 'Explain why this date was chosen',
      backLink: '/referral/task-list',
      continueButton: 'Save and continue',
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
    expect(viewModel.pageHeader).toBe('What date does the service need to be completed by?')
    expect(viewModel.hint).toBe('This is the date by which the service should be completed.')
    expect(viewModel.dateLabel).toBe('Date')
    expect(viewModel.dateHint).toBe('For example, 31 3 2027')
    expect(viewModel.reasonLabel).toBe('Why does it need to be completed by this date?')
    expect(viewModel.reasonHint).toBe('Explain why this date was chosen')
    expect(viewModel.continueButton).toBe('Save and continue')
    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.formValues.day).toBe('31')
    expect(viewModel.formValues.month).toBe('12')
    expect(viewModel.formValues.year).toBe('2026')
    expect(viewModel.formValues.reason).toBe('Test reason')
  })

  test('should handle missing optional data fields', () => {
    const content: ServiceEndDatePageContent = {
      pageTitle: 'Service End Date',
      pageHeader: 'What date does the service need to be completed by?',
      hint: 'This is the date by which the service should be completed.',
      dateLabel: 'Date',
      dateHint: 'For example, 31 3 2027',
      reasonLabel: 'Why does it need to be completed by this date?',
      reasonHint: 'Explain why this date was chosen',
      backLink: '/referral/task-list',
      continueButton: 'Save and continue',
    }

    const res = {
      locals: {
        content,
      },
    } as unknown as Response

    const data = {}

    const presenter = new ServiceEndDatePagePresenter(data)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.formValues.day).toBeUndefined()
    expect(viewModel.formValues.month).toBeUndefined()
    expect(viewModel.formValues.year).toBeUndefined()
    expect(viewModel.formValues.reason).toBeUndefined()
  })

  test('should prioritize explicit form values when provided', () => {
    const content: ServiceEndDatePageContent = {
      pageTitle: 'Service End Date',
      pageHeader: 'What date does the service need to be completed by?',
      hint: 'This is the date by which the service should be completed.',
      dateLabel: 'Date',
      dateHint: 'For example, 31 3 2027',
      reasonLabel: 'Why does it need to be completed by this date?',
      reasonHint: 'Explain why this date was chosen',
      backLink: '/referral/task-list',
      continueButton: 'Save and continue',
    }

    const res = {
      locals: {
        content,
      },
    } as unknown as Response

    const presenter = new ServiceEndDatePagePresenter(
      {
        target_service_completion_date: '2026-12-31',
        target_service_completion_reason: 'Saved reason',
      },
      {
        day: '99',
        month: '13',
        year: '2026',
        reason: 'Form reason',
      },
    )

    const viewModel = presenter.buildViewModel(res)
    expect(viewModel.formValues.day).toBe('99')
    expect(viewModel.formValues.month).toBe('13')
    expect(viewModel.formValues.year).toBe('2026')
    expect(viewModel.formValues.reason).toBe('Form reason')
  })
})

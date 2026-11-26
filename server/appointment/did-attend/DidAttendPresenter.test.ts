import type { Response } from 'express'
import type { IcsFeedbackAttendanceBffDto } from '@community-support-api'
import DidAttendPresenter, { RecordSessionAttendanceSessionData } from './DidAttendPresenter'
import { globalContent } from '../../../assets/content/GlobalContent'
import type { ErrorMiddlewareErrors } from '../../@types/express'

describe('DidAttendPresenter', () => {
  const caseRefId = 'case-ref-1'
  const content = globalContent.icsFeedback.id.didAttend
  const data: IcsFeedbackAttendanceBffDto = {
    referralFirstName: 'Alex',
    date: '2026-10-09',
    time: { hour: 2, minute: 30, amPm: 'pm' },
  }
  const noErrors: ErrorMiddlewareErrors = { list: [], messages: {} }

  const buildViewModel = (record: RecordSessionAttendanceSessionData = {}, errors = noErrors) =>
    new DidAttendPresenter(caseRefId, data, record).buildViewModel({
      locals: { content, errors },
    } as unknown as Response)

  it('builds the back link and button', () => {
    const viewModel = buildViewModel()

    expect(viewModel.backLink).toEqual({ href: `/ics-feedback/${caseRefId}/attendance` })
    expect(viewModel.buttonArgs).toEqual({ text: 'Continue' })
  })

  it('builds inline yes/no radios with the first name in the page-heading legend', () => {
    expect(buildViewModel().radioArgs).toEqual({
      name: 'didAttend',
      classes: 'govuk-radios--inline',
      fieldset: {
        attributes: { 'data-testid': 'fieldset-didAttend' },
        legend: {
          text: 'Did Alex come to the ICS?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      items: [
        { id: 'didAttend-Yes', value: 'Yes', text: 'Yes', checked: false },
        { id: 'didAttend-No', value: 'No', text: 'No', checked: false },
      ],
      errorMessage: undefined,
      attributes: { 'data-testid': 'didAttend' },
    })
  })

  it.each([
    [true, [true, false]],
    [false, [false, true]],
    [undefined, [false, false]],
  ])('checks the correct radio when didPersonAttend is %s', (didPersonAttend, expected) => {
    const { items } = buildViewModel({ didPersonAttend }).radioArgs

    expect(items.map(item => item.checked)).toEqual(expected)
  })

  it('passes the didAttend error message to the radios', () => {
    const error = { text: 'Select yes if they came to the appointment' }
    const errors: ErrorMiddlewareErrors = {
      list: [{ href: '#didAttend', text: error.text }],
      messages: { didAttend: error },
    }

    expect(buildViewModel({}, errors).radioArgs.errorMessage).toEqual(error)
  })

  it('uses the didAttend template', () => {
    const res = { locals: { content, errors: noErrors }, render: jest.fn() } as unknown as Response

    new DidAttendPresenter(caseRefId, data, {}).renderPage(res)

    expect(res.render).toHaveBeenCalledWith('appointment/didAttend', {
      content: expect.objectContaining({ backLink: { href: `/ics-feedback/${caseRefId}/attendance` } }),
    })
  })
})

import type { Response } from 'express'
import type { IcsFeedbackAttendanceBffDto } from '@community-support-api'
import RecordSessionAttendancePresenter, {
  RecordSessionAttendanceSessionData,
} from './RecordSessionAttendancePresenter'
import { globalContent } from '../../../assets/content/GlobalContent'
import type { ErrorMiddlewareErrors } from '../../@types/express'

describe('RecordSessionAttendancePresenter', () => {
  const caseRefId = 'X12345'
  const content = globalContent['/ics-feedback/:id/attendance']
  const data: IcsFeedbackAttendanceBffDto = {
    referralFirstName: 'Alex',
    date: '2026-10-09',
    time: { hour: 2, minute: 30, amPm: 'pm' },
  }
  const noErrors: ErrorMiddlewareErrors = { list: [], messages: {} }

  const buildViewModel = (record: RecordSessionAttendanceSessionData = {}, errors = noErrors) =>
    new RecordSessionAttendancePresenter(caseRefId, data, record).buildViewModel({
      locals: { content, errors },
    } as unknown as Response)

  it('builds the static page content, back link and submit href', () => {
    const viewModel = buildViewModel()

    expect(viewModel.pageHeader).toBe(content.pageHeader)
    expect(viewModel.description).toBe(content.description)
    expect(viewModel.backLink).toEqual({ href: `/progress/${caseRefId}` })
    expect(viewModel.submitHref).toBe(`/ics-feedback/${caseRefId}/attendance`)
    expect(viewModel.buttonArgs).toEqual({ text: 'Continue' })
  })

  it('builds the appointment details summary list', () => {
    const { appointment } = buildViewModel()

    expect(appointment.attributes).toEqual({ 'data-testid': 'appointment-details' })
    expect(appointment.rows).toHaveLength(2)
    expect(JSON.stringify(appointment.rows)).toContain('Date')
    expect(JSON.stringify(appointment.rows)).toContain('Start time')
  })

  it('builds inline yes/no radios with no selection or error by default', () => {
    const { radioArgs } = buildViewModel()

    expect(radioArgs).toEqual({
      name: 'happened',
      hint: { text: 'The session happened if something was delivered. ' },
      classes: 'govuk-radios--inline',
      fieldset: {
        attributes: { 'data-testid': 'fieldset-happened' },
        legend: { text: 'Did the session happen?', classes: 'govuk-fieldset__legend--m' },
      },
      items: [
        { id: 'happened-Yes', value: 'Yes', text: 'Yes', checked: false },
        { id: 'happened-No', value: 'No', text: 'No', checked: false },
      ],
      errorMessage: undefined,
      attributes: { 'data-testid': 'happened' },
    })
  })

  it.each([
    [true, [true, false]],
    [false, [false, true]],
    [undefined, [false, false]],
  ])('checks the correct radio when didSessionHappen is %s', (didSessionHappen, [yesChecked, noChecked]) => {
    const { items } = buildViewModel({ didSessionHappen }).radioArgs

    expect(items.map(item => item.checked)).toEqual([yesChecked, noChecked])
  })

  it('passes the happened error message to the radios', () => {
    const errors: ErrorMiddlewareErrors = {
      list: [{ href: '#happened', text: 'Select yes if the session happened' }],
      messages: { happened: { text: 'Select yes if the session happened' } },
    }

    expect(buildViewModel({}, errors).radioArgs.errorMessage).toEqual({ text: 'Select yes if the session happened' })
  })

  it('uses the recordSessionAttendance template', () => {
    const presenter = new RecordSessionAttendancePresenter(caseRefId, data, {})
    const res = { locals: { content, errors: noErrors }, render: jest.fn() } as unknown as Response

    presenter.renderPage(res)

    expect(res.render).toHaveBeenCalledWith('appointment/recordSessionAttendance', {
      content: expect.objectContaining({ submitHref: `/ics-feedback/${caseRefId}/attendance` }),
    })
  })
})

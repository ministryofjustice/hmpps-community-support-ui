import type { Response } from 'express'
import type { ErrorMiddlewareErrors } from '../../@types/express'
import HowTheyTriedToContactThePersonPresenter from './howTheyTriedToContactThePersonPresenter'

describe('HowTheyTriedToContactThePersonPresenter', () => {
  const caseRefId = 'case-ref-1'
  const noErrors: ErrorMiddlewareErrors = { list: [], messages: {} }

  it('builds the two non-attendance fields with their saved values', () => {
    const presenter = new HowTheyTriedToContactThePersonPresenter(caseRefId, 'Alex', {
      howTheyTriedToContactThePerson: 'Called twice',
      reasonsTheyDidNotAttend: 'They were unwell',
    })
    const viewModel = presenter.buildViewModel({ locals: { errors: noErrors } } as unknown as Response)

    expect(viewModel.pageHeading).toBe('Non-attendance details')
    expect(viewModel.backLink).toEqual({ href: `/ics-feedback/${caseRefId}/did-attend` })
    expect(viewModel.form.button).toEqual({ text: 'Continue' })
    expect(viewModel.form.contactAttemptsTextarea).toMatchObject({
      id: 'howTheyTriedToContactThePerson',
      name: 'howTheyTriedToContactThePerson',
      label: { text: 'How did you try to contact Alex?' },
      hint: { text: 'Include when you tried to contact them and how many times.' },
      value: 'Called twice',
    })
    expect(viewModel.form.reasonsForNonAttendanceTextarea).toMatchObject({
      id: 'reasonsTheyDidNotAttend',
      name: 'reasonsTheyDidNotAttend',
      label: { text: 'Reason they did not attend' },
      value: 'They were unwell',
    })
  })

  it('associates validation errors with the correct fields', () => {
    const errors: ErrorMiddlewareErrors = {
      list: [],
      messages: {
        howTheyTriedToContactThePerson: { text: 'Enter how you tried to contact them' },
        reasonsTheyDidNotAttend: { text: 'Enter a reason they did not attend' },
      },
    }
    const presenter = new HowTheyTriedToContactThePersonPresenter(caseRefId, 'Alex')
    const { form } = presenter.buildViewModel({ locals: { errors } } as unknown as Response)

    expect(form.contactAttemptsTextarea.value).toBe('')
    expect(form.contactAttemptsTextarea.errorMessage).toEqual(errors.messages.howTheyTriedToContactThePerson)
    expect(form.reasonsForNonAttendanceTextarea.value).toBe('')
    expect(form.reasonsForNonAttendanceTextarea.errorMessage).toEqual(errors.messages.reasonsTheyDidNotAttend)
  })
})

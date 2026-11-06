import { Response } from 'express'
import { globalContent } from '../../../../assets/content/GlobalContent'
import AppointmentCheckYourAnswersPresenter from './AppointmentCheckYourAnswersPresenter'

const content = globalContent['/referral/:id/create-an-appointment/check-your-answers']

const res = {
  locals: { content },
} as unknown as Response

describe('AppointmentCheckYourAnswersPresenter', () => {
  it.each([
    ['ICS', 'ICS'],
    ['CONTACT_SESSION', 'contact session'],
    ['PRE_RELEASE_SESSION', 'pre-release session'],
    ['POST_RELEASE_SESSION', 'post-release session'],
    ['HANDOVER_SESSION', 'handover session'],
  ])('uses booking wording in the title and heading for %s', (appointmentType, label) => {
    const presenter = new AppointmentCheckYourAnswersPresenter('AB1234CD', 'John', { appointmentType }, [])

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.pageTitle).toBe(`Check the details before booking the ${label}`)
    expect(viewModel.pageHeader).toBe(`Check the details before booking the ${label}`)
  })

  it('abbreviates the initial contact session heading but keeps the full summary card label', () => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      { appointmentType: 'ICS' },
      [],
      [{ value: 'ICS', name: 'Initial contact session' }],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.pageTitle).toBe('Check the details before booking the ICS')
    expect(viewModel.pageHeader).toBe('Check the details before booking the ICS')
    expect(viewModel.appointmentSummary.card.title.text).toBe('Initial contact session')
  })

  it('uses the selected pre-release appointment type in the page title and summary card', () => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'PRE_RELEASE_SESSION',
        date: '2026-10-16',
        startTime: '1:30pm',
        method: 'IN_PERSON_PROBATION_OFFICE',
        probationOfficeLocationId: '2',
        informedBy: ['informedByPhone', 'informedByEmail'],
      },
      [{ id: 2, name: 'Derbyshire: Buxton Probation Office' }],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.pageTitle).toBe('Check the details before booking the pre-release session')
    expect(viewModel.pageHeader).toBe('Check the details before booking the pre-release session')
    expect(viewModel.appointmentSummary.card.title.text).toBe('Pre-release session')
    expect(viewModel.appointmentSummary.card.actions.items[0].visuallyHiddenText).toBe('Pre-release session')
    expect(viewModel.appointmentSummary.rows.some(row => row.key.text === content.probationOfficeLabel)).toBe(true)
    expect(
      viewModel.appointmentSummary.rows.some(
        row => row.key.text === content.methodLabel && row.value.text === 'In person: probation office',
      ),
    ).toBe(true)
  })

  it('shows the reason instead of location details for a phone appointment', () => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'POST_RELEASE_SESSION',
        date: '2026-10-16',
        startTime: '1:30pm',
        method: 'PHONE',
        reasonSessionNotInPerson: 'The person is unwell and cannot attend in person',
        probationOfficeLocationId: '2',
        informedBy: ['informedByPhone'],
      },
      [{ id: 2, name: 'Derbyshire: Buxton Probation Office' }],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(
      viewModel.appointmentSummary.rows.some(row =>
        [content.probationOfficeLabel, content.appointmentAddressLabel].includes(row.key.text),
      ),
    ).toBe(false)
    expect(
      viewModel.appointmentSummary.rows.some(
        row =>
          row.key.text === content.reasonSessionNotInPersonLabel &&
          row.value.text === 'The person is unwell and cannot attend in person',
      ),
    ).toBe(true)
  })

  it.each(['PHONE', 'VIDEO'] as const)('shows the remote reason for a contact session by %s', method => {
    const viewModel = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      { appointmentType: 'CONTACT_SESSION', method, reasonSessionNotInPerson: 'The person cannot attend in person' },
      [],
    ).buildViewModel(res)
    expect(
      viewModel.appointmentSummary.rows.some(
        row =>
          row.key.text === content.reasonSessionNotInPersonLabel &&
          row.value.text === 'The person cannot attend in person',
      ),
    ).toBe(true)
  })

  it('shows the meet at the gate answer for a post-release session', () => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'POST_RELEASE_SESSION',
        date: '2026-10-16',
        startTime: '1:30pm',
        method: 'PHONE',
        meetAtTheGate: true,
        informedBy: ['informedByPhone'],
      },
      [{ id: 2, name: 'Derbyshire: Buxton Probation Office' }],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(
      viewModel.appointmentSummary.rows.some(
        row => row.key.text === content.meetAtTheGateLabel && row.value.text === 'Yes',
      ),
    ).toBe(true)
  })

  it('omits the informed-by row for a handover session', () => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'HANDOVER_SESSION',
        date: '2026-10-16',
        startTime: '1:30pm',
        method: 'IN_PERSON',
        informedBy: ['informedByPhone'],
      },
      [],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.appointmentSummary.rows.some(row => row.key.text === content.informedLabel)).toBe(false)
  })

  it('shows the entered address for an other-location appointment', () => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'PRE_RELEASE_SESSION',
        date: '2026-10-16',
        startTime: '1:30pm',
        method: 'IN_PERSON_OTHER_LOCATION',
        addressLines: ['14 High Street', 'Flat 2', 'Bath', 'Somerset', 'BA1 1AA'],
        informedBy: ['informedByPhone'],
      },
      [{ id: 2, name: 'Derbyshire: Buxton Probation Office' }],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(
      viewModel.appointmentSummary.rows.some(
        row =>
          row.key.text === content.appointmentAddressLabel &&
          row.value.html === '14 High Street<br>Flat 2<br>Bath<br>Somerset<br>BA1 1AA',
      ),
    ).toBe(true)
    expect(viewModel.appointmentSummary.rows.some(row => row.key.text === content.methodLabel)).toBe(true)
    expect(
      viewModel.appointmentSummary.rows.some(
        row => row.key.text === content.methodLabel && row.value.text === 'In person: another address',
      ),
    ).toBe(true)
  })

  it.each([
    ['PHONE', 'The person is unwell and cannot attend in person'],
    ['VIDEO', 'The person cannot travel to the probation office'],
  ] as const)('shows the reason the session is not in person for a %s appointment', (method, reason) => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'ICS',
        date: '2026-10-16',
        startTime: '1:30pm',
        method,
        reasonSessionNotInPerson: reason,
        informedBy: ['informedByPhone'],
      },
      [],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(
      viewModel.appointmentSummary.rows.some(
        row => row.key.text === content.reasonSessionNotInPersonLabel && row.value.text === reason,
      ),
    ).toBe(true)
  })
})

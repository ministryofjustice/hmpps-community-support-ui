import { Response } from 'express'
import { globalContent } from '../../../../assets/content/GlobalContent'
import AppointmentCheckYourAnswersPresenter from './AppointmentCheckYourAnswersPresenter'

const content = globalContent['/referral/:id/create-an-appointment/check-your-answers']

const res = {
  locals: { content },
} as unknown as Response

describe('AppointmentCheckYourAnswersPresenter', () => {
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

    expect(viewModel.pageTitle).toBe('Check the details before scheduling the pre-release session')
    expect(viewModel.pageHeader).toBe('Check the details before scheduling the pre-release session')
    expect(viewModel.appointmentSummary.card.title.text).toBe('Pre-release session details')
  })

  it('omits the location row when the appointment method no longer requires a location', () => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'POST_RELEASE_SESSION',
        date: '2026-10-16',
        startTime: '1:30pm',
        method: 'PHONE',
        probationOfficeLocationId: '2',
        informedBy: ['informedByPhone'],
      },
      [{ id: 2, name: 'Derbyshire: Buxton Probation Office' }],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.appointmentSummary.rows.some(row => row.key.text === content.locationLabel)).toBe(false)
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
        location: '14 High Street, Bristol, BS1 1AA',
        informedBy: ['informedByPhone'],
      },
      [{ id: 2, name: 'Derbyshire: Buxton Probation Office' }],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(
      viewModel.appointmentSummary.rows.some(
        row => row.key.text === content.locationLabel && row.value.text === '14 High Street, Bristol, BS1 1AA',
      ),
    ).toBe(true)
  })
})

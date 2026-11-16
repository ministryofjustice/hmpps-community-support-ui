import { Response } from 'express'
import nunjucks from 'nunjucks'
import { globalContent } from '../../../../assets/content/GlobalContent'
import AppointmentCheckYourAnswersPresenter from './AppointmentCheckYourAnswersPresenter'

const content = globalContent['/referral/:id/create-an-appointment/check-your-answers']

const res = {
  locals: { content },
} as unknown as Response

describe('AppointmentCheckYourAnswersPresenter', () => {
  describe('retrospective appointments', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 10, 4, 13, 30))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it.each([
      ['3/11/2026', '11:59pm', true],
      ['2026-11-04', '1:29pm', true],
      ['4/11/2026', '12:00am', true],
      ['4/11/2026', '12:00pm', true],
      ['4/11/2026', '1:30pm', false],
      ['4/11/2026', '1:31pm', false],
      ['5/11/2026', '12:00am', false],
      ['invalid', '1:00pm', false],
      ['4/11/2026', 'invalid', false],
      [undefined, '1:00pm', false],
      ['4/11/2026', undefined, false],
    ])('shows the next steps for %s at %s: %s', (date, startTime, expected) => {
      const viewModel = new AppointmentCheckYourAnswersPresenter(
        'AB1234CD',
        'John',
        { appointmentType: 'ICS', date, startTime },
        [],
      ).buildViewModel(res)

      expect(viewModel.whatHappensNext).toEqual(
        expected
          ? {
              heading: 'What happens next',
              text: "As you've entered a date and time in the past, we'll ask you to add appointment feedback.",
            }
          : undefined,
      )
      expect(viewModel.submitButtonText).toBe(expected ? 'Continue' : 'Submit')
    })

    it.each(['ICS', 'CONTACT_SESSION', 'PRE_RELEASE_SESSION', 'POST_RELEASE_SESSION', 'HANDOVER_SESSION'])(
      'shows the message for a past %s and not for a future appointment',
      appointmentType => {
        const pastViewModel = new AppointmentCheckYourAnswersPresenter(
          'AB1234CD',
          'John',
          { appointmentType, date: '3/11/2026', startTime: '1:00pm' },
          [],
        ).buildViewModel(res)
        const futureViewModel = new AppointmentCheckYourAnswersPresenter(
          'AB1234CD',
          'John',
          { appointmentType, date: '4/11/2026', startTime: '1:31pm' },
          [],
        ).buildViewModel(res)

        expect(pastViewModel.whatHappensNext).toEqual({
          heading: 'What happens next',
          text: "As you've entered a date and time in the past, we'll ask you to add appointment feedback.",
        })
        expect(futureViewModel.whatHappensNext).toBeUndefined()
        expect(pastViewModel.submitButtonText).toBe(appointmentType === 'ICS' ? 'Continue' : 'Submit')
        expect(futureViewModel.submitButtonText).toBe('Submit')
      },
    )

    it('does not show the message for an unknown appointment type', () => {
      const viewModel = new AppointmentCheckYourAnswersPresenter(
        'AB1234CD',
        'John',
        { appointmentType: 'UNKNOWN', date: '3/11/2026', startTime: '1:00pm' },
        [],
      ).buildViewModel(res)

      expect(viewModel.whatHappensNext).toBeUndefined()
      expect(viewModel.submitButtonText).toBe('Submit')
    })

    it('renders the message below the summary without a notification banner', () => {
      const environment = new nunjucks.Environment(
        new nunjucks.FileSystemLoader([
          'server/views',
          'node_modules/govuk-frontend/dist/',
          'node_modules/@ministryofjustice/frontend/',
        ]),
        { autoescape: true },
      )
      environment.addFilter('assetMap', (url: string) => url)
      const viewModel = new AppointmentCheckYourAnswersPresenter(
        'AB1234CD',
        'John',
        { appointmentType: 'ICS', date: '3/11/2026', startTime: '1:00pm' },
        [],
      ).buildViewModel(res)

      const html = environment.render('appointment/create-an-appointment/check-your-answers.njk', {
        applicationName: 'Community Support',
        content: viewModel,
      })

      expect(html).toMatch(/govuk-summary-card[\s\S]*<h2 class="govuk-heading-m">What happens next<\/h2>/)
      expect(html).toContain(
        'As you&#39;ve entered a date and time in the past, we&#39;ll ask you to add appointment feedback.',
      )
      expect(html).not.toContain('govuk-notification-banner')
      expect(html).not.toContain('role="alert"')
    })
  })

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

  it('shows the selected prison and omits stale informed-by data for a pre-release session', () => {
    const viewModel = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      {
        appointmentType: 'PRE_RELEASE_SESSION',
        method: 'IN_PERSON_PRISON',
        prisonCode: 'MDI',
        prisonName: 'Moorland (HMP & YOI)',
        informedBy: ['informedByPhone'],
        meetAtTheGate: true,
      },
      [],
    ).buildViewModel(res)

    expect(viewModel.appointmentSummary.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { text: content.methodLabel }, value: { text: 'In person: prison' } }),
        expect.objectContaining({ key: { text: content.prisonLabel }, value: { text: 'Moorland (HMP & YOI)' } }),
      ]),
    )
    expect(viewModel.appointmentSummary.rows.some(row => row.key.text.includes('informed about the session'))).toBe(
      false,
    )
    expect(viewModel.appointmentSummary.rows.some(row => row.key.text === content.meetAtTheGateLabel)).toBe(false)
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

  it.each([
    ['04/11/2026', '4 November 2026'],
    ['4/11/2026', '4 November 2026'],
    ['2026-11-04', '4 November 2026'],
    ['25/12/2026', '25 December 2026'],
  ])('formats the date %s as %s', (date, expected) => {
    const presenter = new AppointmentCheckYourAnswersPresenter(
      'AB1234CD',
      'John',
      { appointmentType: 'ICS', date, startTime: '1:30pm', method: 'PHONE', informedBy: ['informedByPhone'] },
      [],
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.appointmentSummary.rows.some(row => row.value.text === expected)).toBe(true)
  })
})

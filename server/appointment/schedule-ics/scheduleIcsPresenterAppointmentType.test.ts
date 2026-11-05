import { Response } from 'express'
import ScheduleIcsContentFactory from '../../testutils/factories/ScheduleIcsContent'
import ScheduleIcsPresenter from './scheduleIcsPresenter'
import { probationOfficesData, prisonsData } from '../../../integration_tests/mockData/referenceData'
import {
  referralInformationInCommunity,
  referralInformationInPrison,
} from '../../../integration_tests/mockData/referralInformationData'
import { SessionAppointmentType } from '../appointmentTypeRules'
import loadContentDataForTest from '../../testutils/loadContentDataForTest'
import { ScheduleIcsContent } from './scheduleIcsViewModel'
import { ErrorMiddlewareErrors } from '../../@types/express'

describe('ScheduleIcsPresenter with appointment type', () => {
  const caseReference = 'AB1234CD'
  const content = ScheduleIcsContentFactory.build({
    pageHeaders: {
      ICS: 'Book initial contact session (ICS)',
      CONTACT_SESSION: 'Schedule the contact session',
      PRE_RELEASE_SESSION: 'Schedule the pre-release session',
      POST_RELEASE_SESSION: 'Schedule the post-release session',
      HANDOVER_SESSION: 'Schedule the handover session',
    },
    meetAtTheGate: { label: 'Is this a meet at the gate session?', yes: 'Yes', no: 'No' },
    submitHref: '/referral/{{ caseRef }}/create-an-appointment/appointment-details',
    howSessionTakePlace: {
      ...ScheduleIcsContentFactory.build().howSessionTakePlace,
      radioItems: {
        ...ScheduleIcsContentFactory.build().howSessionTakePlace.radioItems,
        inPerson: { text: 'In-person meeting' },
      },
    },
  })
  const res = { locals: { content }, render: jest.fn() } as unknown as Response

  const build = (type: SessionAppointmentType, referral = referralInformationInCommunity, formData = {}) =>
    new ScheduleIcsPresenter(
      caseReference,
      probationOfficesData,
      prisonsData,
      referral,
      formData,
      undefined,
      type,
    ).buildViewModel(res)

  const radioValues = (type: SessionAppointmentType, referral = referralInformationInCommunity) =>
    build(type, referral).howWillTheSessionTakePlaceInput.items.map(item => item.value)

  test.each([
    ['ICS', ['ByPhone', 'ByVideo', 'InProbationOffice', 'InSomewhereElse']],
    ['CONTACT_SESSION', ['ByPhone', 'ByVideo', 'InProbationOffice', 'InSomewhereElse']],
    ['PRE_RELEASE_SESSION', ['ByPhone', 'ByVideo', 'InSomewhereElse']],
    ['POST_RELEASE_SESSION', ['ByPhone', 'ByVideo', 'InProbationOffice', 'InSomewhereElse']],
    ['HANDOVER_SESSION', ['ByPhone', 'ByVideo', 'InPerson']],
  ] as [SessionAppointmentType, string[]][])('%s shows the correct methods', (type, expected) => {
    expect(radioValues(type)).toEqual(expected)
  })

  test('handover session for a person in custody shows only phone, video and in-person', () => {
    expect(radioValues('HANDOVER_SESSION', referralInformationInPrison)).toEqual(['ByPhone', 'ByVideo', 'InPerson'])
  })

  test('post-release session in custody keeps the prison option', () => {
    expect(radioValues('POST_RELEASE_SESSION', referralInformationInPrison)).toContain('InPrison')
  })

  test.each([
    ['ICS', 'Book initial contact session (ICS)'],
    ['CONTACT_SESSION', 'Schedule the contact session'],
    ['PRE_RELEASE_SESSION', 'Schedule the pre-release session'],
    ['POST_RELEASE_SESSION', 'Schedule the post-release session'],
    ['HANDOVER_SESSION', 'Schedule the handover session'],
  ] as [SessionAppointmentType, string][])('%s page header and submit href', (type, header) => {
    const viewModel = build(type)
    expect(viewModel.pageHeader).toBe(header)
    expect(viewModel.submitHref).toBe(
      `/referral/${caseReference}/create-an-appointment/appointment-details?session=${type}`,
    )
  })

  test('meet at the gate is only shown for post-release sessions', () => {
    expect(build('POST_RELEASE_SESSION').meetAtTheGateInput).toBeDefined()
    expect(build('ICS').meetAtTheGateInput).toBeUndefined()
    expect(build('CONTACT_SESSION').meetAtTheGateInput).toBeUndefined()
    expect(build('PRE_RELEASE_SESSION').meetAtTheGateInput).toBeUndefined()
    expect(build('HANDOVER_SESSION').meetAtTheGateInput).toBeUndefined()
  })

  test('meet at the gate input reflects form data', () => {
    const viewModel = build('POST_RELEASE_SESSION', referralInformationInCommunity, { meetAtTheGate: 'yes' })
    expect(viewModel.meetAtTheGateInput).toMatchObject({
      name: 'meetAtTheGate',
      value: 'yes',
      items: [
        { value: 'yes', text: 'Yes' },
        { value: 'no', text: 'No' },
      ],
    })
  })

  test('informed question is hidden for handover sessions only', () => {
    expect(build('HANDOVER_SESSION').howWasTheyInformedAboutTheSessionInput).toBeUndefined()
    expect(build('ICS').howWasTheyInformedAboutTheSessionInput).toBeDefined()
    expect(build('CONTACT_SESSION').howWasTheyInformedAboutTheSessionInput).toBeDefined()
    expect(build('POST_RELEASE_SESSION').howWasTheyInformedAboutTheSessionInput).toBeDefined()
  })

  describe('with the appointment details page content', () => {
    const pageContent = loadContentDataForTest(
      '/referral/:id/create-an-appointment/appointment-details',
    ) as unknown as ScheduleIcsContent
    const pageRes = { locals: { content: pageContent }, render: jest.fn() } as unknown as Response

    const buildWithPageContent = (
      type: SessionAppointmentType,
      referral = referralInformationInCommunity,
      validationErrors?: ErrorMiddlewareErrors,
    ) =>
      new ScheduleIcsPresenter(
        caseReference,
        probationOfficesData,
        prisonsData,
        referral,
        {},
        validationErrors,
        type,
      ).buildViewModel(pageRes)

    const itemsSummary = (type: SessionAppointmentType, referral = referralInformationInCommunity) =>
      buildWithPageContent(type, referral).howWillTheSessionTakePlaceInput.items.map(item =>
        item.divider ? `divider:${item.divider}` : item.value,
      )

    test('ICS groups in-person options before remote options', () => {
      expect(itemsSummary('ICS')).toEqual([
        'divider:In person',
        'InProbationOffice',
        'InSomewhereElse',
        'divider:Remote',
        'ByPhone',
        'ByVideo',
      ])
    })

    test('ICS in custody shows the prison option under in person', () => {
      expect(itemsSummary('ICS', referralInformationInPrison)).toEqual([
        'divider:In person',
        'InPrison',
        'divider:Remote',
        'ByPhone',
        'ByVideo',
      ])
    })

    test('handover session groups the in-person meeting option', () => {
      expect(itemsSummary('HANDOVER_SESSION')).toEqual([
        'divider:In person',
        'InPerson',
        'divider:Remote',
        'ByPhone',
        'ByVideo',
      ])
    })

    test('ICS page content matches the design', () => {
      const viewModel = buildWithPageContent('ICS')
      const how = viewModel.howWillTheSessionTakePlaceInput
      expect(viewModel.pageHeader).toBe('Book initial contact session (ICS)')
      expect(viewModel.submitButton.text).toBe('Continue')
      expect(viewModel.dateInput.label.text).toBe('Session date')
      expect(viewModel.dateInput.hint.text).toBe('For example 10/7/2025')
      expect(viewModel.timeInput.fieldset.legend.text).toBe('Start time')
      expect(viewModel.timeInput.items.map(item => item.label)).toEqual(['Hours', 'Minutes'])
      expect(viewModel.timeInput.meridiemParams.label).toBe('am or pm')
      expect(how.classes).toBe('grouped-radio')
      expect(how.hint).toBeUndefined()
      expect(how.items.filter(item => !item.divider).map(item => item.text)).toEqual([
        'Probation office',
        'Another address',
        'Phone call',
        'Video call',
      ])
      expect(how.items.find(item => item.value === 'InProbationOffice').conditional.html).toContain(
        'Select probation office',
      )
      expect(how.items.find(item => item.value === 'ByPhone').conditional.html).toContain(
        'Reason the session is not in person',
      )
      const informed = viewModel.howWasTheyInformedAboutTheSessionInput
      expect(informed.fieldset.legend.text).toBe(
        `How was ${referralInformationInCommunity.firstName} informed about the session?`,
      )
      expect(informed.items.map(item => item.text)).toEqual(['Email', 'Phone call', 'Text message', 'Other'])
      expect(informed.items.at(3).conditional.html).toContain('Other contact method')
    })

    test.each(['sessionTime-hour', 'sessionTime-minute', 'sessionTime-meridiem'])(
      'shows the %s error against the start time field',
      key => {
        const viewModel = buildWithPageContent('ICS', referralInformationInCommunity, {
          list: [{ text: 'Start time error', href: `#${key}` }],
          messages: { [key]: { text: 'Start time error' } },
        })
        expect(viewModel.timeInput.errorMessage).toEqual({ text: 'Start time error' })
      },
    )

    const timeErrorHighlights = (key?: string) => {
      const { timeInput } = buildWithPageContent(
        'ICS',
        referralInformationInCommunity,
        key ? { list: [], messages: { [key]: { text: 'Start time error' } } } : undefined,
      )
      return {
        hour: timeInput.items[0].classes.includes('govuk-input--error'),
        minute: timeInput.items[1].classes.includes('govuk-input--error'),
        meridiem: timeInput.meridiemParams.classes === 'govuk-select--error',
      }
    }

    test.each([
      [undefined, { hour: false, minute: false, meridiem: false }],
      ['sessionTime', { hour: true, minute: true, meridiem: true }],
      ['sessionTime-hour', { hour: true, minute: false, meridiem: false }],
      ['sessionTime-minute', { hour: false, minute: true, meridiem: false }],
      ['sessionTime-meridiem', { hour: false, minute: false, meridiem: true }],
    ])('highlights the start time inputs in error for %s', (key, expected) => {
      expect(timeErrorHighlights(key)).toEqual(expected)
    })
  })
})

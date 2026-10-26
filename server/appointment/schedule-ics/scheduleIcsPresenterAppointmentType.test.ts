import { Response } from 'express'
import ScheduleIcsContentFactory from '../../testutils/factories/ScheduleIcsContent'
import ScheduleIcsPresenter from './scheduleIcsPresenter'
import { probationOfficesData, prisonsData } from '../../../integration_tests/mockData/referenceData'
import {
  referralInformationInCommunity,
  referralInformationInPrison,
} from '../../../integration_tests/mockData/referralInformationData'
import { SessionAppointmentType } from '../appointmentTypeRules'

describe('ScheduleIcsPresenter with appointment type', () => {
  const caseReference = 'AB1234CD'
  const content = ScheduleIcsContentFactory.build({
    pageHeaders: {
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
    expect(build('CONTACT_SESSION').howWasTheyInformedAboutTheSessionInput).toBeDefined()
    expect(build('POST_RELEASE_SESSION').howWasTheyInformedAboutTheSessionInput).toBeDefined()
  })
})

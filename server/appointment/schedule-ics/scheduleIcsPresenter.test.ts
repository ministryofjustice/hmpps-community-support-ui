import path from 'path'
import nunjucks from 'nunjucks'
import { Response } from 'express'
import { ProbationOffice } from '@community-support-api'
import { MojDatePicker } from '@moj-frontend'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import type { ScheduleFormData, ScheduleIcsViewModel } from './scheduleIcsViewModel'
import ScheduleIcsContentFactory from '../../testutils/factories/ScheduleIcsContent'
import ReferralInformationFactory from '../../testutils/factories/ReferralInformation'
import ScheduleIcsPresenter from './scheduleIcsPresenter'
import { buildInput, buildSelect } from '../../utils/utils'
import { ComponentsTimeInput } from '../../@types/components'
import {
  GovukFrontendCheckboxesWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import { prisonsData } from '../../../integration_tests/mockData/referenceData'

jest.useFakeTimers().setSystemTime(new Date('2026-06-18'))

beforeAll(() => {
  nunjucks.configure([
    path.join(__dirname, '../../views'),
    path.join(process.cwd(), 'node_modules/govuk-frontend/dist/'),
    path.join(process.cwd(), 'node_modules/@ministryofjustice/frontend/'),
  ])
})

describe('ScheduleIcsPresenter', () => {
  const probationOfficesData: ProbationOffice[] = [
    {
      probationOfficeId: 1,
      name: 'Derby: Derwent Centre',
      address: 'Derwent Centre, 1 Stuart Street, Derby, DE1 2EQ',
      probationRegionId: 'F',
      govUkUrl: 'https://www.gov.uk/guidance/derby-derwent-centre',
    },
    {
      probationOfficeId: 2,
      name: 'Derbyshire: Buxton Probation Office',
      address: 'Probation Office, Chesterfield House, 25 Hardwick Street, Buxton, Derbyshire, SK17 6DH',
      probationRegionId: 'F',
      govUkUrl: 'https://www.gov.uk/guidance/derbyshire-chesterfield-house',
      deliusCRSLocationId: 'CRS0032',
    },
  ]
  const probationOfficeItems = [
    {
      value: '',
      text: 'Select probation office',
    },
    {
      value: 'Derby: Derwent Centre',
      text: 'Derby: Derwent Centre',
    },
    {
      value: 'Derbyshire: Buxton Probation Office',
      text: 'Derbyshire: Buxton Probation Office',
    },
  ]

  const content = ScheduleIcsContentFactory.build()

  const caseReference = 'AB1234CD'
  const referralInformation = ReferralInformationFactory.build({ crn: 'A123456' })
  let res: Response
  beforeEach(() => {
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  const checkDate = (
    date: MojDatePicker,
    formData: Pick<ScheduleFormData, 'sessionDate'>,
    errorMessage: GovukFrontendErrorMessage | undefined,
  ) => {
    expect(date.label.text).toBe(content.date.label)
    expect(date.hint.text).toBe(content.date.hint)
    if (formData.sessionDate) {
      expect(date.value).toBe(formData.sessionDate)
    } else {
      expect(date.value).toBe('')
    }
    if (errorMessage) {
      expect(date.errorMessage.text).toBe(errorMessage.text)
    } else {
      expect(date.errorMessage).toBeUndefined()
    }
  }

  const checkTime = (
    time: ComponentsTimeInput,
    formData: Pick<ScheduleFormData, 'sessionTime-hour' | 'sessionTime-minute' | 'sessionTime-meridiem'>,
    errorMessage: GovukFrontendErrorMessage | undefined,
  ) => {
    expect(time.fieldset.legend.text).toBe(content.time.label)
    expect(time.hint.text).toBe(content.time.hint)
    if (errorMessage) {
      expect(time.errorMessage.text).toBe(errorMessage.text)
    } else {
      expect(time.errorMessage).toBeUndefined()
    }
    const hours = time.items.at(0)!
    expect(hours.name).toBe('hour')
    const minutes = time.items.at(1)!
    expect(minutes.name).toBe('minute')
    expect(time.meridiemParams.label).toBe('AM or PM')
    if (formData['sessionTime-hour']) {
      expect(hours.value).toBe(formData['sessionTime-hour'])
    } else {
      expect(hours.value).toBeFalsy()
    }
    if (formData['sessionTime-minute']) {
      expect(minutes.value).toBe(formData['sessionTime-minute'])
    } else {
      expect(minutes.value).toBeFalsy()
    }
    if (formData['sessionTime-meridiem']) {
      expect(time.meridiemParams.value).toBe(formData['sessionTime-meridiem'])
    } else {
      expect(time.meridiemParams.value).toBeFalsy()
    }
  }

  const checkHowSessionWillTakePlaceCommon = (
    how: GovukFrontendRadiosWithConditional,
    formData: Pick<ScheduleFormData, 'sessionTakePlace' | 'ByPhone' | 'ByVideo'>,
    errorMessages: {
      byPhone: GovukFrontendErrorMessage | undefined
      byVideo: GovukFrontendErrorMessage | undefined
    },
  ) => {
    expect(how.fieldset.legend.text).toBe('How will the session take place?')
    expect(how.fieldset.attributes).toStrictEqual({ 'data-testid': 'sessionTakePlace-fieldset' })
    expect(how.hint.text).toBe('Select one option.')
    expect(how.attributes).toStrictEqual({ 'data-testid': 'sessionTakePlace-radios' })
    if (formData.sessionTakePlace) {
      expect(how.value).toBe(formData.sessionTakePlace)
    } else {
      expect(how.value).toBe('')
    }

    expect(how.items.length).toBeGreaterThan(2)
    const firstHowItem = how.items.at(0)!
    expect(firstHowItem.text).toBe('Phone call')
    const firstHowConditional = buildInput({
      id: 'ByPhone',
      name: 'ByPhone',
      type: 'text',
      value: formData.ByPhone,
      errorMessage: errorMessages.byPhone,
      spellcheck: false,
      classes: 'govuk-!-width-full',
      label: {
        text: 'Why is this session not in person?',
      },
    })
    expect(firstHowItem.conditional.html).toBe(firstHowConditional)
    const secondHowItem = how.items.at(1)!
    expect(secondHowItem.text).toBe('Video call')
    const secondHowConditional = buildInput({
      id: 'ByVideo',
      name: 'ByVideo',
      type: 'text',
      value: formData.ByVideo,
      errorMessage: errorMessages.byVideo,
      spellcheck: false,
      classes: 'govuk-!-width-full',
      label: {
        text: 'Why is this session not in person?',
      },
    })
    expect(secondHowItem.conditional.html).toBe(secondHowConditional)
  }

  const checkHowSessionWillTakePlaceCommunity = (
    how: GovukFrontendRadiosWithConditional,
    formData: Pick<
      ScheduleFormData,
      'probationOffice' | 'addressLine1' | 'addressLine2' | 'addressTown' | 'addressCounty' | 'addressPostcode'
    >,
    errorMessages: {
      probationOfficeList: GovukFrontendErrorMessage | undefined
      addressLine1: GovukFrontendErrorMessage | undefined
      addressLine2: GovukFrontendErrorMessage | undefined
      addressTown: GovukFrontendErrorMessage | undefined
      addressCounty: GovukFrontendErrorMessage | undefined
      addressPostcode: GovukFrontendErrorMessage | undefined
    },
  ) => {
    expect(how.items).toHaveLength(4)
    const thirdHowItem = how.items.at(2)!
    expect(thirdHowItem.text).toBe('In-person meeting - probation office')
    expect(thirdHowItem.conditional.html).toBe(
      buildSelect({
        id: 'probationOfficeList',
        name: 'probationOfficeList',
        label: {},
        items: probationOfficeItems.map(item => {
          if (item.value === formData.probationOffice) {
            return { ...item, selected: true }
          }
          return item
        }),
        value: formData.probationOffice,
        errorMessage: errorMessages.probationOfficeList,
      }),
    )
    const fourthHowItem = how.items.at(3)!
    expect(fourthHowItem.text).toBe('In-person meeting - somewhere else')
    expect(fourthHowItem.conditional.html).toBe(
      buildInput({
        label: {
          text: 'Address line 1',
        },
        id: 'addressLine1',
        name: 'addressLine1',
        value: formData.addressLine1,
        errorMessage: errorMessages.addressLine1,
        autocomplete: 'address-line1',
      }) +
        buildInput({
          label: {
            text: 'Address line 2 (optional)',
          },
          id: 'addressLine2',
          name: 'addressLine2',
          value: formData.addressLine2,
          errorMessage: errorMessages.addressLine2,
          autocomplete: 'address-line2',
        }) +
        buildInput({
          label: {
            text: 'Town or city',
          },
          classes: 'govuk-!-width-two-thirds',
          id: 'addressTown',
          name: 'addressTown',
          value: formData.addressTown,
          errorMessage: errorMessages.addressTown,
          autocomplete: 'address-level2',
        }) +
        buildInput({
          label: {
            text: 'County (optional)',
          },
          classes: 'govuk-!-width-two-thirds',
          id: 'addressCounty',
          name: 'addressCounty',
          value: formData.addressCounty,
          errorMessage: errorMessages.addressCounty,
        }) +
        buildInput({
          label: {
            text: 'Postcode',
          },
          classes: 'govuk-input--width-10',
          id: 'addressPostcode',
          name: 'addressPostcode',
          value: formData.addressPostcode,
          errorMessage: errorMessages.addressPostcode,
          autocomplete: 'postal-code',
        }),
    )
  }

  const checkInformed = (
    informed: GovukFrontendCheckboxesWithConditional,
    formData: Pick<ScheduleFormData, 'informedMethod' | 'otherMethodOfContact'>,
    errorMessages: {
      informedMethod: GovukFrontendErrorMessage | undefined
      otherMethodOfContact: GovukFrontendErrorMessage | undefined
    },
  ) => {
    expect(informed.fieldset.legend.text).toBe('How was John informed about the session?')
    expect(informed.hint.text).toBe('Select all that apply.')
    if (errorMessages.informedMethod) {
      expect(informed.errorMessage.text).toBe(errorMessages.informedMethod.text)
    }

    const checked = formData.informedMethod || []

    const firstInformedItem = informed.items.at(0)!
    expect(firstInformedItem.text).toBe('Phone call')
    expect(firstInformedItem.value).toBe('informedByPhone')
    if (checked.includes('informedByPhone')) {
      expect(firstInformedItem.checked).toBe(true)
    }
    const secondInformedItem = informed.items.at(1)!
    expect(secondInformedItem.text).toBe('Text message')
    expect(secondInformedItem.value).toBe('informedByTextMessage')
    if (checked.includes('informedByTextMessage')) {
      expect(secondInformedItem.checked).toBe(true)
    }
    const thirdInformedItem = informed.items.at(2)!
    expect(thirdInformedItem.text).toBe('Email')
    expect(thirdInformedItem.value).toBe('informedByEmail')
    if (checked.includes('informedByEmail')) {
      expect(thirdInformedItem.checked).toBe(true)
    }
    const fourthInformedItem = informed.items.at(3)!
    expect(fourthInformedItem.text).toBe('Other')
    expect(fourthInformedItem.value).toBe('informedByOtherMethod')
    expect(fourthInformedItem.conditional.html).toBe(
      buildInput({
        id: 'otherMethodOfContact',
        name: 'otherMethodOfContact',
        value: formData.otherMethodOfContact,
        type: 'text',
        errorMessage: errorMessages.otherMethodOfContact,
        spellcheck: false,
        classes: 'govuk-!-width-full',
        label: {
          text: 'Other method of contact',
        },
      }),
    )
    if (formData.otherMethodOfContact) {
      expect(fourthInformedItem.checked).toBe(true)
    }
  }

  const checkContentInCommunity = (
    viewModel: ScheduleIcsViewModel,
    formData: ScheduleFormData,
    errorMessages: Record<string, GovukFrontendErrorMessage>,
  ) => {
    expect(viewModel.pageHeader).toBe(content.pageHeader)
    expect(viewModel.submitButton.text).toBe(content.submitButtonText)
    expect(viewModel.submitHref).toBe(`/referral/${caseReference}/appointment/schedule-ics`)
    expect(viewModel.backLink).toEqual({ href: `/progress/${caseReference}` })

    checkDate(viewModel.date, formData, errorMessages.sessionDate)
    checkTime(viewModel.time, formData, errorMessages.sessionTime)

    checkHowSessionWillTakePlaceCommon(viewModel.how, formData, {
      byPhone: errorMessages.ByPhone,
      byVideo: errorMessages.ByVideo,
    })
    checkHowSessionWillTakePlaceCommunity(viewModel.how, formData, {
      probationOfficeList: errorMessages.probationOfficeList,
      addressLine1: errorMessages.addressLine1,
      addressLine2: errorMessages.addressLine2,
      addressTown: errorMessages.addressTown,
      addressCounty: errorMessages.addressCounty,
      addressPostcode: errorMessages.addressPostcode,
    })

    checkInformed(viewModel.informed, formData, {
      informedMethod: errorMessages.informedMethod,
      otherMethodOfContact: errorMessages.otherMethodOfContact,
    })
  }

  test('renders the scheduleIcsAppointment template', () => {
    const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
    presenter.renderPage(res)
    expect(res.render).toHaveBeenCalledWith('appointment/scheduleIcsAppointment', expect.objectContaining({}))
  })

  describe('buildPageContent', () => {
    describe('no form data, no errors', () => {
      test('correct content when the identifier is a CRN', () => {
        const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, [], referralInformation)
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, {}, {})
      })
    })
    describe('with formData, no errors', () => {
      test('correct content when the identifier is a CRN - by phone', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'ByPhone',
          ByPhone: 'by phone reason',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          prisonsData,
          referralInformation,
          formData,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, {})
      })
      test('correct content when the identifier is a CRN - by video', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'ByVideo',
          ByVideo: 'by video reason',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          prisonsData,
          referralInformation,
          formData,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, {})
      })
      test('correct content when the identifier is a CRN - in person probation office', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'InProbationOffice',
          probationOffice: 'Derbyshire: Buxton Probation Office',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          prisonsData,
          referralInformation,
          formData,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, {})
      })
      test('correct content when the identifier is a CRN - in person somewhere else', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'InSomewhereElse',
          addressLine1: 'address1',
          addressLine2: 'address2',
          addressTown: 'town',
          addressCounty: 'county',
          addressPostcode: 'postcode',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          [],
          referralInformation,
          formData,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, {})
      })
    })
    describe('with formData, with errors', () => {
      test('correct content when the identifier is a CRN - by phone', () => {
        const formData: ScheduleFormData = {
          sessionTakePlace: 'ByPhone',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const errors = {
          list: [
            {
              href: '#sessionDate',
              text: 'Enter the date of the session',
            },
            {
              href: '#sessionTime',
              text: 'Enter the start time of the session',
            },
            {
              href: '#ByPhone',
              text: 'Enter why the session is not in person',
            },
          ],
          messages: {
            sessionDate: {
              text: 'Enter the date of the session',
            },
            sessionTime: {
              text: 'Enter the start time of the session',
            },
            ByPhone: {
              text: 'Enter why the session is not in person',
            },
          },
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          [],
          referralInformation,
          formData,
          errors,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, errors.messages)
      })
      test('correct content when the identifier is a CRN - by video', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'ByVideo',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const errors = {
          list: [
            {
              href: '#ByVideo',
              text: 'Enter why the session is not in person',
            },
          ],
          messages: {
            ByVideo: {
              text: 'Enter why the session is not in person',
            },
          },
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          [],
          referralInformation,
          formData,
          errors,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, errors.messages)
      })
      test('correct content when the identifier is a CRN - in person probation office', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'InProbationOffice',
          probationOffice: 'Derbyshire: Buxton Probation Office',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const errors = {
          list: [
            {
              href: '#probationOfficeList',
              text: 'Select probation office',
            },
          ],
          messages: {
            probationOfficeList: {
              text: 'Select probation office',
            },
          },
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          [],
          referralInformation,
          formData,
          errors,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, errors.messages)
      })
      test('correct content when the identifier is a CRN - in person somewhere else', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'InSomewhereElse',
          addressLine1: '',
          addressLine2: '???',
          addressTown: '',
          addressCounty: '???',
          addressPostcode: '',
          informedMethod: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'some other method'],
          otherMethodOfContact: 'some other method',
        }
        const error = {
          list: [
            {
              href: '#addressLine1',
              text: 'Enter an address line 1',
            },
            {
              href: '#addressLine2',
              text: 'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
            },
            {
              href: '#addressTown',
              text: 'Enter a town or city',
            },
            {
              href: '#addressCounty',
              text: 'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
            },
            {
              href: '#addressPostcode',
              text: 'Enter a postcode',
            },
          ],
          messages: {
            addressLine1: {
              text: 'Enter an address line 1',
            },
            addressLine2: {
              text: 'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
            },
            addressTown: {
              text: 'Enter a town or city',
            },
            addressCounty: {
              text: 'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
            },
            addressPostcode: {
              text: 'Enter a postcode',
            },
          },
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          [],
          referralInformation,
          formData,
          error,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, error.messages)
      })
      test('correct content when the identifier is a CRN - missing informed', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'InProbationOffice',
          probationOffice: 'Derbyshire: Buxton Probation Office',
          informedMethod: [],
          otherMethodOfContact: '',
        }
        const error = {
          list: [
            {
              href: '#informedMethod',
              text: 'Select how Omar was informed about the session',
            },
          ],
          messages: {
            informedMethod: {
              text: 'Select how Omar was informed about the session',
            },
          },
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          [],
          referralInformation,
          formData,
          error,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, error.messages)
      })
      test('correct content when the identifier is a CRN - missing informed other method', () => {
        const formData: ScheduleFormData = {
          sessionDate: '20-10-2026',
          'sessionTime-hour': '10',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': 'am',
          sessionTakePlace: 'InProbationOffice',
          probationOffice: 'Derbyshire: Buxton Probation Office',
          informedMethod: ['some other method'],
          otherMethodOfContact: '',
        }
        const error = {
          list: [
            {
              href: '#otherMethodOfContact',
              text: 'Enter the other method of contact',
            },
          ],
          messages: {
            otherMethodOfContact: {
              text: 'Enter the other method of contact',
            },
          },
        }
        const presenter = new ScheduleIcsPresenter(
          caseReference,
          probationOfficesData,
          [],
          referralInformation,
          formData,
          error,
        )
        const viewModel = presenter.buildPageContent(res)
        checkContentInCommunity(viewModel, formData, error.messages)
      })
    })
  })
})

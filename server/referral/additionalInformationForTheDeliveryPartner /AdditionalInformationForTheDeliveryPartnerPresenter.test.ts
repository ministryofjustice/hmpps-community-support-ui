import { Response } from 'express'
import { AdditionalInformationForTheDeliveryPartner } from '@community-support-api'
import { ErrorMiddlewareErrors } from '../../@types/express'
import loadContentDataForTest from '../../testutils/loadContentDataForTest'
import AdditionalInformationForTheDeliveryPartnerPresenter from './AdditionalInformationForTheDeliveryPartnerPresenter'

const firstName = 'Gavin' as const

const pageContent = {
  pageTitle: 'Is there anything else the delivery partner should know? - Community Support',
  h2: `Is there anything else the delivery partner should know about ${firstName}?`,
  detailsLink: 'What you should consider and include',
  reveal: {
    heading: 'You should consider letting the delivery partner know if:',
    bullets: [
      'there are any relevant registration flags on NDelius, for example, sexual or violent offences, racist behaviour or MAPPA',
      `${firstName} is a victim or perpetrator of domestic abuse or modern slavery`,
      `it is safe to contact ${firstName}, and if not, what the preferred contact methods are`,
      'there are any risks to staff, not already mentioned in the referral',
      'you think there is anything else important they should know',
    ],
  },
  radio1: {
    label: 'Yes',
    textareaLabel: 'Give details of anything else the delivery partner should know',
  },
  radio2: {
    label: 'No',
  },
  button: 'Save and continue',
} as const

const errorMessage = {
  nothingSelected: `Select yes if there is anything else the delivery partner should know`,
  nothingEntered: `Enter details of anything else the delivery partner should know`,
} as const

const content = loadContentDataForTest('/referral/task-list/additional-information-for-the-delivery-partner')

describe('AdditionalInformationForTheDeliveryPartnerPresenter', () => {
  describe('buildViewModel', () => {
    const res = {
      locals: {
        content,
      },
    } as unknown as Response

    test('buildViewModel creates radios with empty conditional text when no information is given', () => {
      const dto: AdditionalInformationForTheDeliveryPartner = {
        refereeName: { firstName, lastName: 'River' },
        details: { selected: 'Unanswered' },
      }

      const presenter = new AdditionalInformationForTheDeliveryPartnerPresenter(dto, { list: [], messages: {} })
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.backLink.href).toBe('/referral/task-list/offence-sentence')
      expect(viewModel.heading).toBe(pageContent.h2)
      expect(viewModel.radios.details.label.text).toBe(pageContent.radio1.textareaLabel)
      expect(viewModel.button).toStrictEqual({ text: pageContent.button })
      expect(viewModel.radios.main.name).toBe('additionalInformation')
      expect(viewModel.button.text).toBe(pageContent.button)
      expect(viewModel.radios.value.selected).toBe('Unanswered')
    })

    test('buildViewModel selects the yes option and preserves the saved informaiton', () => {
      const dto: AdditionalInformationForTheDeliveryPartner = {
        refereeName: { firstName, lastName: 'River' },
        details: { selected: 'Yes', value: '' },
      }

      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: {},
      }

      const presenter = new AdditionalInformationForTheDeliveryPartnerPresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.radios.value.selected).toBe('Yes')
    })

    test('buildViewModel displays the correct error message when nothing is selected', () => {
      const dto: AdditionalInformationForTheDeliveryPartner = {
        refereeName: { firstName, lastName: 'River' },
        details: { selected: 'Unanswered' },
      }

      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: { additionalInformation: { text: errorMessage.nothingEntered } },
      }

      const presenter = new AdditionalInformationForTheDeliveryPartnerPresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.radios.value.selected).toBe('Unanswered')
      expect(viewModel.radios.main.errorMessage.text).toBe(errorMessage.nothingEntered)
    })

    test('buildViewModel displays the correct error message when no details are given', () => {
      const dto: AdditionalInformationForTheDeliveryPartner = {
        refereeName: { firstName, lastName: 'River' },
        details: { selected: 'Yes', value: '' },
      }

      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: { details: { text: errorMessage.nothingEntered } },
      }

      const presenter = new AdditionalInformationForTheDeliveryPartnerPresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.radios.value.selected).toBe('Yes')
      expect(viewModel.radios.details.errorMessage.text).toBe(errorMessage.nothingEntered)
    })
  })
})

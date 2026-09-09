import { Response } from 'express'
import loadContentDataForTest from '../../testutils/loadContentDataForTest'
import OffenceSentencePresenter from './OffenceSentencePresenter'
import { components } from '../../@types/communitySupportApi/imported'
import { ErrorMiddlewareErrors } from '../../@types/express'

type OffenceSentenceInfoBffResponseDto = components['schemas']['OffenceSentenceInfoBffResponseDto']

const content = loadContentDataForTest('/referral/task-list/offence-sentence')
const pageContent = {
  pageTitle: 'Check offence and sentence information - Community Support',
  crnLabel: 'CRN',
  dateOfBirthLabel: 'Date of birth',
  pageSubHeader: 'Check offence and sentence information',
  bodyText: 'This is the offence associated with this referral.',
  offenceSentenceCard: {
    heading: 'Offence and sentence information',
    offenceLabel: 'Offence',
    offenceSubCategoryLabel: 'Offence subcategory',
    outcomeLabel: 'Outcome',
    sentenceEndDateLabel: 'Sentence end date',
    expectedReleaseDateLabel: 'Expected release date',
  },
  hasLicenceConditionsOrZonesLabel:
    'Are there any licence conditions or exclusion zones the delivery partner should know about?',
  yesOptionLabel: 'Yes',
  licenceConditionsOrZonesDetailsLabel: 'Give details of all relevant licence conditions or exclusion zones',
  noOptionLabel: 'No',
  notAvailableText: 'Not available',
  backLink: '/referral/task-list/service-days',
  continueButton: 'Save and continue',
} as const

const validationErrors: ErrorMiddlewareErrors = { list: [], messages: {} }

const baseResponseDto: OffenceSentenceInfoBffResponseDto = {
  firstName: 'Alex',
  lastName: 'Smith',
  crn: 'X123456',
  dateOfBirth: '20 April 1984 (42 years old)',
  offenceSentenceInfo: {
    offence: 'Robbery',
    offenceSubCategory: 'Aggravated robbery',
    outcome: 'Community order',
    hasLicenceConditionsOrZones: true,
    licenceConditionsOrZonesDetails: 'No contact with victim',
  },
}

const buildResponseDto = (
  overrides: Partial<OffenceSentenceInfoBffResponseDto> = {},
): OffenceSentenceInfoBffResponseDto => ({
  ...baseResponseDto,
  ...overrides,
  offenceSentenceInfo: {
    ...baseResponseDto.offenceSentenceInfo,
    ...overrides.offenceSentenceInfo,
  },
})

describe('OffenceSentencePresenter', () => {
  const res = { locals: { content } } as unknown as Response

  test('builds the offence sentence summary and radio selection from DTO values', () => {
    const responseDto = buildResponseDto({
      offenceSentenceInfo: {
        sentenceEndDate: '2025-12-15',
      },
    })

    const presenter = new OffenceSentencePresenter(responseDto, validationErrors)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.pageTitle).toBe(pageContent.pageTitle)
    expect(viewModel.heading).toBe('Alex Smith')
    expect(viewModel.crnLabel).toBe(pageContent.crnLabel)
    expect(viewModel.crn).toBe('X123456')
    expect(viewModel.dateOfBirthLabel).toBe(pageContent.dateOfBirthLabel)
    expect(viewModel.dateOfBirth).toBe('20 April 1984 (42 years old)')
    expect(viewModel.pageSubHeader).toBe(pageContent.pageSubHeader)
    expect(viewModel.bodyText).toBe(pageContent.bodyText)
    expect(viewModel.backLink.href).toBe(pageContent.backLink)
    expect(viewModel.button.text).toBe(pageContent.continueButton)
    expect(viewModel.offenceSentenceCardHeading).toBe(pageContent.offenceSentenceCard.heading)

    const { rows } = viewModel.offenceSentenceSummary
    expect(rows[0].value.text).toBe('Robbery')
    expect(rows[3].key.text).toBe(pageContent.offenceSentenceCard.sentenceEndDateLabel)
    expect(rows[3].value.text).toBe('15 December 2025')
    expect(rows).toHaveLength(4)

    const [yesRadio, noRadio] = viewModel.radios.items
    expect(yesRadio.checked).toBe(true)
    expect(yesRadio.conditional.html).toContain('No contact with victim')
    expect(noRadio.checked).toBe(false)
  })

  test('shows expected release date when sentence end date is not returned', () => {
    const responseDto = buildResponseDto({
      offenceSentenceInfo: {
        expectedReleaseDate: '2025-12-15',
      },
    })

    const presenter = new OffenceSentencePresenter(responseDto, validationErrors)
    const viewModel = presenter.buildViewModel(res)

    const { rows } = viewModel.offenceSentenceSummary
    expect(rows[3].key.text).toBe(pageContent.offenceSentenceCard.expectedReleaseDateLabel)
    expect(rows[3].value.text).toBe('15 December 2025')
    expect(rows).toHaveLength(4)
  })

  test('shows sentence end date when expected release date is not returned', () => {
    const responseDto = buildResponseDto({
      offenceSentenceInfo: {
        sentenceEndDate: '2025-12-15',
        expectedReleaseDate: undefined,
      },
    })

    const presenter = new OffenceSentencePresenter(responseDto, validationErrors)
    const viewModel = presenter.buildViewModel(res)

    const { rows } = viewModel.offenceSentenceSummary
    expect(rows[3].key.text).toBe(pageContent.offenceSentenceCard.sentenceEndDateLabel)
    expect(rows[3].value.text).toBe('15 December 2025')
    expect(rows).toHaveLength(4)
  })

  test('falls back to default text when offence sentence values are missing', () => {
    const responseDto = buildResponseDto({
      crn: undefined,
      dateOfBirth: undefined,
      offenceSentenceInfo: {
        offence: undefined,
        offenceSubCategory: undefined,
        outcome: undefined,
        hasLicenceConditionsOrZones: undefined,
        licenceConditionsOrZonesDetails: undefined,
      },
    })

    const presenter = new OffenceSentencePresenter(responseDto, validationErrors)
    const viewModel = presenter.buildViewModel(res)

    const { rows } = viewModel.offenceSentenceSummary
    expect(rows[0].value.text).toBe(pageContent.notAvailableText)
    expect(rows[1].value.text).toBe(pageContent.notAvailableText)
    expect(rows[2].value.text).toBe(pageContent.notAvailableText)
    expect(rows).toHaveLength(3)
    expect(viewModel.crn).toBe(pageContent.notAvailableText)
    expect(viewModel.dateOfBirth).toBe(pageContent.notAvailableText)

    const [yesRadio, noRadio] = viewModel.radios.items
    expect(yesRadio.checked).toBeNull()
    expect(noRadio.checked).toBeNull()
  })

  test('preserves a posted yes selection and shows the textarea error when details are blank', () => {
    const presenter = new OffenceSentencePresenter(
      buildResponseDto(),
      {
        list: [],
        messages: {
          licenceConditionsOrZonesDetails: {
            text: 'Enter details of all relevant licence conditions or exclusion zones',
          },
        },
      },
      {
        hasLicenceConditionsOrZones: 'Yes',
        licenceConditionsOrZonesDetails: '',
      },
    )
    const viewModel = presenter.buildViewModel(res)

    const [yesRadio, noRadio] = viewModel.radios.items
    expect(yesRadio.checked).toBe(true)
    expect(noRadio.checked).toBe(false)
    expect(yesRadio.conditional.html).toContain('Enter details of all relevant licence conditions or exclusion zones')
    expect(yesRadio.conditional.html).toContain('name="licenceConditionsOrZonesDetails"')
  })

  test('returns expected template path', () => {
    const presenter = new OffenceSentencePresenter(buildResponseDto(), validationErrors)

    expect(presenter.getTemplatePath()).toBe('referral/offenceSentence')
  })
})

import { Response } from 'express'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { OffenceSentencePageContent, OffenceSentencePageViewModel } from './OffenceSentencePageModel'
import { components } from '../../@types/communitySupportApi/imported'
import ViewUtils from '../../utils/viewUtils'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { buildTextarea, not, TriState } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'

type OffenceSentenceInfoBffResponseDto = components['schemas']['OffenceSentenceInfoBffResponseDto']
type OffenceSentenceDto = components['schemas']['OffenceSentenceDto']

type OffenceSentenceFormValues = {
  hasLicenceConditionsOrZones?: string
  licenceConditionsOrZonesDetails?: string
}

const formatDate = (dateValue: string | null | undefined): string | null => {
  if (!dateValue) return null

  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const selectionToTriState = (selection: boolean | null | undefined): TriState => {
  if (selection === true) return true
  if (selection === false) return false

  return null
}

const formSelectionToTriState = (selection: string | undefined): TriState => {
  if (selection === 'Yes') return true
  if (selection === 'No') return false

  return null
}

const buildConditional = (
  content: OffenceSentencePageContent,
  value: string,
  errorMessage: GovukFrontendErrorMessage | undefined,
): string =>
  buildTextarea({
    name: 'licenceConditionsOrZonesDetails',
    label: { text: content.licenceConditionsOrZonesDetailsLabel },
    value,
    spellcheck: true,
    rows: '5',
    errorMessage,
    attributes: { 'data-testid': 'licence-conditions-or-zones-details' },
  })

const resolveLicenceOrExclusionDetails = (
  offenceSentenceInfo: OffenceSentenceDto,
  formData: OffenceSentenceFormValues,
): string => {
  if (formData.licenceConditionsOrZonesDetails !== undefined) {
    return formData.licenceConditionsOrZonesDetails
  }

  if (offenceSentenceInfo.hasLicenceConditionsOrZones) {
    return offenceSentenceInfo.licenceConditionsOrZonesDetails || ''
  }

  return ''
}

const buildDateRows = (
  content: OffenceSentencePageContent,
  sentenceEndDate: string | null,
  expectedReleaseDate: string | null,
): ReturnType<typeof ViewUtils.summaryListRow>[] => {
  if (expectedReleaseDate) {
    return [ViewUtils.summaryListRow(content.offenceSentenceCard.expectedReleaseDateLabel, expectedReleaseDate)]
  }

  if (sentenceEndDate) {
    return [ViewUtils.summaryListRow(content.offenceSentenceCard.sentenceEndDateLabel, sentenceEndDate)]
  }

  return []
}

const buildRadios = (
  content: OffenceSentencePageContent,
  offenceSentenceInfo: OffenceSentenceDto,
  formData: OffenceSentenceFormValues,
  messages: Record<string, GovukFrontendErrorMessage>,
): GovukFrontendRadiosWithConditional => {
  const formSelection = formSelectionToTriState(formData.hasLicenceConditionsOrZones)
  const selection =
    formData.hasLicenceConditionsOrZones !== undefined
      ? formSelection
      : selectionToTriState(offenceSentenceInfo.hasLicenceConditionsOrZones)
  const licenceOrExclusionDetails = resolveLicenceOrExclusionDetails(offenceSentenceInfo, formData)

  return {
    name: 'hasLicenceConditionsOrZones',
    fieldset: {
      legend: {
        text: content.hasLicenceConditionsOrZonesLabel,
        classes: 'govuk-fieldset__legend--m',
      },
    },
    errorMessage: messages.hasLicenceConditionsOrZones,
    items: [
      {
        value: content.yesOptionLabel,
        text: content.yesOptionLabel,
        checked: selection,
        conditional: {
          html: buildConditional(content, licenceOrExclusionDetails, messages.licenceConditionsOrZonesDetails),
        },
      },
      {
        value: content.noOptionLabel,
        text: content.noOptionLabel,
        checked: not(selection),
      },
    ],
    attributes: { 'data-testid': 'has-licence-conditions-or-zones' },
  }
}

export default class OffenceSentencePresenter extends PresenterBase<
  OffenceSentencePageViewModel,
  OffenceSentencePageContent
> {
  constructor(
    private readonly data: OffenceSentenceInfoBffResponseDto,
    private readonly validationErrors: ErrorMiddlewareErrors,
    private readonly formData: OffenceSentenceFormValues = {},
  ) {
    super()
  }

  buildViewModel(res: Response): OffenceSentencePageViewModel {
    const content = this.buildStaticContent(res)
    const offenceSentenceInfo = this.data.offenceSentenceInfo || {}
    const valueOrDefault = (value: string | null | undefined): string => value || content.notAvailableText
    const sentenceEndDate = formatDate(offenceSentenceInfo.sentenceEndDate)
    const expectedReleaseDate = formatDate(offenceSentenceInfo.expectedReleaseDate)
    const dateRows = buildDateRows(content, sentenceEndDate, expectedReleaseDate)
    const heading = `${this.data.firstName} ${this.data.lastName}`.trim()

    return {
      pageTitle: content.pageTitle,
      heading,
      crnLabel: content.crnLabel,
      crn: valueOrDefault(this.data.crn),
      dateOfBirthLabel: content.dateOfBirthLabel,
      dateOfBirth: valueOrDefault(this.data.dateOfBirth),
      pageSubHeader: content.pageSubHeader,
      bodyText: content.bodyText,
      backLink: {
        href: content.backLink,
      },
      submitHref: content.submitHref,
      button: {
        text: content.continueButton,
      },
      offenceSentenceCardHeading: content.offenceSentenceCard.heading,
      offenceSentenceSummary: ViewUtils.summaryList([
        ViewUtils.summaryListRow(content.offenceSentenceCard.offenceLabel, valueOrDefault(offenceSentenceInfo.offence)),
        ViewUtils.summaryListRow(
          content.offenceSentenceCard.offenceSubCategoryLabel,
          valueOrDefault(offenceSentenceInfo.offenceSubCategory),
        ),
        ViewUtils.summaryListRow(content.offenceSentenceCard.outcomeLabel, valueOrDefault(offenceSentenceInfo.outcome)),
        ...dateRows,
      ]),
      radios: buildRadios(content, offenceSentenceInfo, this.formData, this.validationErrors.messages),
    }
  }

  getTemplatePath(): string {
    return 'referral/offenceSentence'
  }

  protected buildStaticContent(res: Response): OffenceSentencePageContent {
    const { content } = res.locals
    return content as OffenceSentencePageContent
  }
}

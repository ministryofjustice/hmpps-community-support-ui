import { Response } from 'express'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import { OffenceSentenceDto, OffenceSentenceInfoBffResponseDto, Selection } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { OffenceSentencePageContent, OffenceSentencePageViewModel } from './OffenceSentencePageModel'
import ViewUtils from '../../utils/viewUtils'
import { YesWithDetailOrNo } from '../../@types/govukFrontend/derived'
import { formatIsoDateOrNull } from '../../utils/dateFormat'
import { ErrorMiddlewareErrors } from '../../@types/express'
import type { OffenceSentenceFormInput } from '../../validation/OffenceSentenceFormData'
import formatFullName from '../../utils/presenterFormatters'

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

const toSelection = (option: 'Yes' | 'No' | undefined | boolean | string, value: string): Selection => {
  switch (option) {
    case true:
    case 'Yes':
    case 'yes':
      return { selected: 'Yes', value }
    case false:
    case 'No':
    case 'no':
      return { selected: 'No' }
    default:
      return { selected: 'Unanswered' }
  }
}

const mergeSelections = (original: Selection, updated: Selection): Selection => {
  if (updated.selected === 'Yes') {
    return updated
  }
  if (original.selected === 'Yes') {
    return original
  }
  if (updated.selected === 'No') {
    return updated
  }
  if (original.selected === 'No') {
    return original
  }
  return { selected: 'Unanswered' }
}

const buildRadios = (
  content: OffenceSentencePageContent,
  { hasLicenceConditionsOrZones, licenceConditionsOrZonesDetails }: OffenceSentenceDto,
  formData: Partial<OffenceSentenceFormInput>,
  messages: Record<string, GovukFrontendErrorMessage>,
): YesWithDetailOrNo => {
  const selection = toSelection(formData.hasLicenceConditionsOrZones, formData.licenceConditionsOrZonesDetails)
  const bffSelection = toSelection(hasLicenceConditionsOrZones, licenceConditionsOrZonesDetails)
  const value = mergeSelections(bffSelection, selection)

  return {
    details: {
      name: 'licenceConditionsOrZonesDetails',
      label: { text: content.licenceConditionsOrZonesDetailsLabel },
      spellcheck: true,
      rows: '5',
      errorMessage: messages.licenceConditionsOrZonesDetails,
      attributes: { 'data-testid': 'licence-conditions-or-zones-details' },
    },
    main: {
      name: 'hasLicenceConditionsOrZones',
      fieldset: {
        legend: {
          text: content.hasLicenceConditionsOrZonesLabel,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: messages.hasLicenceConditionsOrZones,
      attributes: { 'data-testid': 'has-licence-conditions-or-zones' },
    },
    value,
  }
}

export default class OffenceSentencePresenter extends PresenterBase<
  OffenceSentencePageViewModel,
  OffenceSentencePageContent
> {
  constructor(
    private readonly data: OffenceSentenceInfoBffResponseDto,
    private readonly validationErrors: ErrorMiddlewareErrors,
    private readonly formData: Partial<OffenceSentenceFormInput> = {},
  ) {
    super()
  }

  buildViewModel(res: Response): OffenceSentencePageViewModel {
    const content = this.buildStaticContent(res)
    const offenceSentenceInfo = this.data.offenceSentenceInfo || {}
    const valueOrDefault = (value: string | null | undefined): string => value || content.notAvailableText
    const sentenceEndDate = formatIsoDateOrNull(offenceSentenceInfo.sentenceEndDate)
    const expectedReleaseDate = formatIsoDateOrNull(offenceSentenceInfo.expectedReleaseDate)
    const dateRows = buildDateRows(content, sentenceEndDate, expectedReleaseDate)
    const heading = formatFullName(this.data.firstName, this.data.lastName)

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

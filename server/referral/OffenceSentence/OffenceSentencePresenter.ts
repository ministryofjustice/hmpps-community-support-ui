import { Response } from 'express'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import { OffenceSentenceDto, OffenceSentenceInfoBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { OffenceSentencePageContent, OffenceSentencePageViewModel } from './OffenceSentencePageModel'
import ViewUtils from '../../utils/viewUtils'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { booleanToTriState, buildTextarea, not, yesNoSelectionToTriState } from '../../utils/utils'
import { formatIsoDateOrNull } from '../../utils/dateFormat'
import { ErrorMiddlewareErrors } from '../../@types/express'
import type { OffenceSentenceFormInput } from '../../validation/OffenceSentenceFormData'
import formatFullName from '../../utils/presenterFormatters'

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
  formData: Partial<OffenceSentenceFormInput>,
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
  formData: Partial<OffenceSentenceFormInput>,
  messages: Record<string, GovukFrontendErrorMessage>,
): GovukFrontendRadiosWithConditional => {
  const formSelection = yesNoSelectionToTriState(formData.hasLicenceConditionsOrZones)
  const selection =
    formData.hasLicenceConditionsOrZones !== undefined
      ? formSelection
      : booleanToTriState(offenceSentenceInfo.hasLicenceConditionsOrZones)
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

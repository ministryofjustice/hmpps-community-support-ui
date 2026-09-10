import { Response } from 'express'
import { AdditionalInformationForTheDeliveryPartner, Selection } from '@community-support-api'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'

import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { buildTextarea, not, TriState, yesNoSelectionToTriState } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'
import {
  AdditionalInformationForTheDeliveryPartnerContent,
  AdditionalInformationForTheDeliveryPartnerViewModel,
  Details,
} from './AdditionalInformationForTheDeliveryPartnerViewModelModel'

const buildConditional = (
  content: AdditionalInformationForTheDeliveryPartnerContent,
  value: string | null,
  errorMessage: GovukFrontendErrorMessage | undefined,
): string =>
  buildTextarea({
    name: 'details',
    label: { text: content.yesConditional },
    value,
    spellcheck: true,
    rows: '5',
    errorMessage,
    attributes: { 'data-testid': 'details' },
  })

const isYesChecked = (selected: TriState, hasError: boolean): TriState => {
  switch (selected) {
    case null:
      return hasError ? true : null
    case false:
      return hasError
    case true:
      return true
    default:
      return null
  }
}

const buildRadiosWithSelection = (
  content: AdditionalInformationForTheDeliveryPartnerContent,
  selection: Selection,
  messages: Record<string, GovukFrontendErrorMessage>,
): GovukFrontendRadiosWithConditional => {
  const yesSelected: TriState = yesNoSelectionToTriState(selection.selected)
  const yesHasError: boolean = !!messages.details
  const yesChecked = isYesChecked(yesSelected, yesHasError)
  const text = selection.selected === 'Yes' ? selection.value : ''
  return {
    name: 'additionalInformation',
    errorMessage: messages.additionalInformation,
    items: [
      {
        value: content.yesOptionLabel,
        text: content.yesOptionLabel,
        checked: yesChecked,
        conditional: { html: buildConditional(content, text, messages.details) },
      },
      {
        value: content.noOptionLabel,
        checked: not(yesChecked),
        text: content.noOptionLabel,
      },
    ],
    attributes: { 'data-testid': 'additional-information' },
  }
}

const buildDetails = (content: AdditionalInformationForTheDeliveryPartnerContent, name: string): Details => ({
  summary: content.detailsLink,
  header: content.detailsHeader,
  items: content.detailsItems.map(item => item.replace('{{ firstName }}', name)),
})

export default class AdditionalInformationForTheDeliveryPartnerPresenter extends PresenterBase<
  AdditionalInformationForTheDeliveryPartnerViewModel,
  AdditionalInformationForTheDeliveryPartnerContent
> {
  constructor(
    private readonly data: AdditionalInformationForTheDeliveryPartner,
    private readonly validationErrors: ErrorMiddlewareErrors,
  ) {
    super()
  }

  buildViewModel(res: Response): AdditionalInformationForTheDeliveryPartnerViewModel {
    const content = this.buildStaticContent(res)
    const { firstName } = this.data.refereeName
    return {
      pageTitle: content.pageTitle,
      backLink: {
        href: content.backlink,
      },
      heading: content.pageHeader.replace('{{ firstName }}', firstName),
      details: buildDetails(content, firstName),
      radios: buildRadiosWithSelection(content, this.data.details, this.validationErrors.messages),
      button: {
        text: content.button,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/additionalInformationForTheDeliveryPartner'
  }
}

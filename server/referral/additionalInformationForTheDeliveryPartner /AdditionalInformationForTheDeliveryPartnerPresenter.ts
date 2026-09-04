import { Response } from 'express'
import { AdditionalInformationForTheDeliveryPartner, Selection } from '@community-support-api'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'

import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { buildTextarea, not, TriState } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'
import {
  AdditionalInformationForTheDeliveryPartnerContent,
  AdditionalInformationForTheDeliveryPartnerViewModel,
} from './AdditionalInformationForTheDeliveryPartnerViewModelModel'

const buildConditional = (
  content: AdditionalInformationForTheDeliveryPartnerContent,
  value: string | null,
  errorMessage: GovukFrontendErrorMessage | undefined,
): string =>
  buildTextarea({
    name: 'details',
    label: { text: content.yesCoditional },
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

const selectionToTriState = (selection: Selection): TriState => {
  switch (selection.selected) {
    case 'Unanswered':
      return null
    case 'No':
      return false
    case 'Yes':
      return true
    default:
      return null
  }
}

const buildRadiosWithSelection = (
  content: AdditionalInformationForTheDeliveryPartnerContent,
  selection: Selection,
  name: string,
  messages: Record<string, GovukFrontendErrorMessage>,
): GovukFrontendRadiosWithConditional => {
  const yesSelected: TriState = selectionToTriState(selection)
  const yesHasError: boolean = !!messages.details
  const yesChecked = isYesChecked(yesSelected, yesHasError)
  const text = selection.selected === 'Yes' ? selection.value : ''
  return {
    name: 'additionalInformation',
    fieldset: {
      legend: {
        text: content.pageHeader.replace('{{ firstName }}', name),
        isPageHeading: true,
        classes: 'govuk-fieldset__legend--l',
      },
      attributes: { 'data-testid': 'additional-information-legend' },
    },
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
      backLink: {
        href: content.backlink,
      },
      radios: buildRadiosWithSelection(content, this.data.details, firstName, this.validationErrors.messages),
      button: {
        text: content.button,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/needsAnInterpreter'
  }
}

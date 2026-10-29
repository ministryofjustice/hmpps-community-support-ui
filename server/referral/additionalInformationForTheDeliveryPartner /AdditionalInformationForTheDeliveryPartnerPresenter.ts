import { Response } from 'express'
import { AdditionalInformationForTheDeliveryPartner, Selection } from '@community-support-api'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { YesWithDetailOrNo } from '../../@types/govukFrontend/derived'
import { ErrorMiddlewareErrors } from '../../@types/express'
import {
  AdditionalInformationForTheDeliveryPartnerContent,
  AdditionalInformationForTheDeliveryPartnerViewModel,
  Details,
} from './AdditionalInformationForTheDeliveryPartnerViewModelModel'

const calculateValue = (selection: Selection, hasError: boolean): Selection => {
  if (hasError) {
    return { selected: 'Yes', value: '' }
  }
  return selection
}

const buildRadiosWithSelection2 = (
  content: AdditionalInformationForTheDeliveryPartnerContent,
  selection: Selection,
  messages: Record<string, GovukFrontendErrorMessage>,
): YesWithDetailOrNo => {
  const yesHasError: boolean = !!messages.details
  const value = calculateValue(selection, yesHasError)
  return {
    main: {
      name: 'additionalInformation',
      errorMessage: messages.additionalInformation,
      attributes: { 'data-testid': 'additional-information' },
    },
    details: {
      name: 'details',
      label: { text: content.yesConditional },
      spellcheck: true,
      rows: '5',
      errorMessage: messages.details,
      attributes: { 'data-testid': 'details' },
    },
    value,
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
      radios: buildRadiosWithSelection2(content, this.data.details, this.validationErrors.messages),
      button: {
        text: content.button,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/additionalInformationForTheDeliveryPartner'
  }
}

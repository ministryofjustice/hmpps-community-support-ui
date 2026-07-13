import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import {
  NeedsAnInterpreterContent,
  NeedsAnInterpreterDataModel,
  NeedsAnInterpreterViewModel,
} from './NeedsAnInterpreterModel'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { buildInput } from '../../utils/utils'

const buildConditional = (content: NeedsAnInterpreterContent, name: string): string =>
  buildInput({
    name: 'language',
    label: { text: content.yesCoditional.replace('{{ name }}', name) },
  })

const buildRadios = (content: NeedsAnInterpreterContent, name: string): GovukFrontendRadiosWithConditional => {
  return {
    name: 'needsInterpreter',
    fieldset: {
      legend: {
        text: content.radioHeader.replace('{{ name }}', name),
        isPageHeading: true,
        classes: 'govuk-fieldset__legend--l',
      },
    },
    items: [
      {
        value: content.yesOptionLabel,
        text: content.yesOptionLabel,
        conditional: { html: buildConditional(content, name) },
      },
      {
        value: content.noOptionLabel,
        text: content.noOptionLabel,
      },
    ],
  }
}

export default class NeedsAnInterpreterPresenter extends PresenterBase<
  NeedsAnInterpreterViewModel,
  NeedsAnInterpreterContent
> {
  constructor(private readonly data: NeedsAnInterpreterDataModel) {
    super()
  }

  buildPageContent(res: Response): NeedsAnInterpreterViewModel {
    const content = this.buildStaticContent(res)
    const { firstName, middleNames, lastName } = this.data
    const name = middleNames ? `${firstName} ${middleNames} ${lastName}` : `${firstName} ${lastName}`
    return {
      heading: name,
      backLink: {
        href: content.backlink,
      },
      radios: buildRadios(content, firstName),
      button: {
        text: content.button,
      },
      postHref: content.url,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/needsAnInterpreter'
  }
}

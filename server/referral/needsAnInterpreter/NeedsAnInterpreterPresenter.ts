import { Response } from 'express'
import { NeedsInterpreterBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { NeedsAnInterpreterContent, NeedsAnInterpreterViewModel } from './NeedsAnInterpreterModel'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { buildInput } from '../../utils/utils'

type LanguageSelection = NeedsInterpreterBffResponseDto['language']

const buildConditional = (content: NeedsAnInterpreterContent, name: string, value: string | null): string =>
  buildInput({
    name: 'language',
    label: { text: content.yesCoditional.replace('{{ name }}', name) },
    value,
  })

const buildRadios = (
  content: NeedsAnInterpreterContent,
  selection: LanguageSelection,
  name: string,
): GovukFrontendRadiosWithConditional => {
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
        checked: selection.selected === 'Yes',
        conditional: { html: buildConditional(content, name, selection.selected === 'Yes' ? selection.value : '') },
      },
      {
        value: content.noOptionLabel,
        checked: selection.selected === 'No',
        text: content.noOptionLabel,
      },
    ],
  }
}

export default class NeedsAnInterpreterPresenter extends PresenterBase<
  NeedsAnInterpreterViewModel,
  NeedsAnInterpreterContent
> {
  constructor(private readonly data: NeedsInterpreterBffResponseDto) {
    super()
  }

  buildViewModel(res: Response): NeedsAnInterpreterViewModel {
    const content = this.buildStaticContent(res)
    const { firstName, middleName, lastName } = this.data.refereeName
    const name = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`
    return {
      heading: name,
      backLink: {
        href: content.backlink,
      },
      radios: buildRadios(content, this.data.language, firstName),
      button: {
        text: content.button,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/needsAnInterpreter'
  }
}

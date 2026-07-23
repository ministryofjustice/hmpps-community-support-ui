import { Response } from 'express'
import { NeedsInterpreterBffResponseDto, Selection } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { NeedsAnInterpreterContent, NeedsAnInterpreterViewModel } from './NeedsAnInterpreterModel'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { buildTextArea } from '../../utils/utils'

const buildConditional = (content: NeedsAnInterpreterContent, name: string, value: string | null): string =>
  buildTextArea({
    name: 'language',
    label: { text: content.yesCoditional.replace('{{ name }}', name) },
    value,
    spellcheck: true,
    rows: '3',
  })

const buildRadios = (content: NeedsAnInterpreterContent, name: string): GovukFrontendRadiosWithConditional => {
  return {
    name: 'needsInterpreter',
    fieldset: {
      legend: {
        text: content.pageHeader.replace('{{ name }}', name),
        isPageHeading: true,
        classes: 'govuk-fieldset__legend--l',
      },
      attributes: { 'test-id': 'needs-interpreter-legend' },
    },
    items: [
      {
        value: content.yesOptionLabel,
        text: content.yesOptionLabel,
        conditional: { html: buildConditional(content, name, '') },
      },
      {
        value: content.noOptionLabel,
        text: content.noOptionLabel,
      },
    ],
    attributes: { 'test-id': 'needs-interpreter' },
  }
}

const buildRadiosWithSelection = (
  content: NeedsAnInterpreterContent,
  selection: Selection,
  name: string,
): GovukFrontendRadiosWithConditional => {
  return {
    name: 'needsInterpreter',
    fieldset: {
      legend: {
        text: content.pageHeader.replace('{{ name }}', name),
        isPageHeading: true,
        classes: 'govuk-fieldset__legend--l',
      },
      attributes: { 'test-id': 'needs-interpreter-legend' },
    },
    items: [
      {
        value: content.yesOptionLabel,
        text: content.yesOptionLabel,
        checked: selection.selected,
        conditional: { html: buildConditional(content, name, selection.value) },
      },
      {
        value: content.noOptionLabel,
        checked: !selection.selected,
        text: content.noOptionLabel,
      },
    ],
    attributes: { 'test-id': 'needs-interpreter' },
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
    const { firstName } = this.data.refereeName
    const selection = this.data.language
    return {
      backLink: {
        href: content.backlink,
      },
      radios: selection ? buildRadiosWithSelection(content, selection, firstName) : buildRadios(content, firstName),
      button: {
        text: content.button,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/needsAnInterpreter'
  }
}

import { Response } from 'express'
import { NeedsInterpreterBffResponseDto } from '@community-support-api'
import { GovukFrontendErrorMessage } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { NeedsAnInterpreterContent, NeedsAnInterpreterViewModel } from './NeedsAnInterpreterModel'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { buildTextarea, not, TriState } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'

type LanguageSelection = NeedsInterpreterBffResponseDto['language']

const buildConditional = (
  content: NeedsAnInterpreterContent,
  name: string,
  value: string | null,
  errorMessage: GovukFrontendErrorMessage | undefined,
): string =>
  buildTextarea({
    name: 'language',
    label: { text: content.yesCoditional.replace('{{ name }}', name) },
    value,
    spellcheck: true,
    rows: '5',
    errorMessage,
    attributes: { 'data-testid': 'language' },
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

const selectionToTriState = (selection: LanguageSelection): TriState => {
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
  content: NeedsAnInterpreterContent,
  selection: LanguageSelection,
  name: string,
  messages: Record<string, GovukFrontendErrorMessage>,
): GovukFrontendRadiosWithConditional => {
  const yesSelected: TriState = selectionToTriState(selection)
  const yesHasError: boolean = !!messages.language
  const yesChecked = isYesChecked(yesSelected, yesHasError)
  const languageText = selection.selected === 'Yes' ? selection.value : ''
  return {
    name: 'needsInterpreter',
    fieldset: {
      legend: {
        text: content.pageHeader.replace('{{ name }}', name),
        isPageHeading: true,
        classes: 'govuk-fieldset__legend--l',
      },
      attributes: { 'data-testid': 'needs-interpreter-legend' },
    },
    errorMessage: messages.needsInterpreter,
    items: [
      {
        value: content.yesOptionLabel,
        text: content.yesOptionLabel,
        checked: yesChecked,
        conditional: { html: buildConditional(content, name, languageText, messages.language) },
      },
      {
        value: content.noOptionLabel,
        checked: not(yesChecked),
        text: content.noOptionLabel,
      },
    ],
    attributes: { 'data-testid': 'needs-interpreter' },
  }
}

export default class NeedsAnInterpreterPresenter extends PresenterBase<
  NeedsAnInterpreterViewModel,
  NeedsAnInterpreterContent
> {
  constructor(
    private readonly data: NeedsInterpreterBffResponseDto,
    private readonly validationErrors: ErrorMiddlewareErrors,
  ) {
    super()
  }

  buildViewModel(res: Response): NeedsAnInterpreterViewModel {
    const content = this.buildStaticContent(res)
    const { firstName } = this.data.refereeName
    return {
      backLink: {
        href: content.backlink,
      },
      radios: buildRadiosWithSelection(content, this.data.language, firstName, this.validationErrors.messages),
      button: {
        text: content.button,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/needsAnInterpreter'
  }
}

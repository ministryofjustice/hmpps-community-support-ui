import { Response } from 'express'
import { GovukFrontendCheckboxesItem, GovukFrontendErrorMessage } from '@govuk-frontend'
import { AdditionalSupportNeedsDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  ItemContent,
  AdditionalSuportNeedsContent,
  AdditionalSuportNeedsViewModel,
} from './AdditionalSupportNeedsModel'
import { GovukFrontendCheckboxesWithConditional, WithConditional } from '../../@types/govukFrontend/derived'
import { buildTextarea, not } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'

type FieldData = Omit<AdditionalSupportNeedsDto, 'refereeName' | 'needsAdditionalSupport'>
type TriState = boolean | null

const lookup: Record<string, keyof FieldData> = {
  Physical: 'physicalHealth',
  Mental: 'mentalEmotionalHealth',
  Neurodiversity: 'neurodiversity',
  Location: 'locationTravel',
  Caring: 'caringResponsibilities',
  Employment: 'employmentResponsibilities',
  Diversity: 'diversity',
  Anything: 'anythingElse',
}

const buildItem =
  (firstName: string, data: FieldData, messages: Record<string, GovukFrontendErrorMessage>) =>
  ({ label, hint, detailsLabel }: ItemContent): WithConditional<GovukFrontendCheckboxesItem> => {
    const option = label.split(' ').at(0)
    const selection = data[lookup[option]]
    return {
      value: option,
      text: label,
      hint: { text: hint },
      checked: selection.selected === 'Yes',
      conditional: {
        html: buildTextarea({
          name: `${option}Value`,
          label: { text: detailsLabel.replace('{{ firstName }}', firstName) },
          rows: '5',
          spellcheck: true,
          errorMessage: messages[`${option}Value`],
          attributes: { 'data-testid': label },
          value: selection.selected === 'Yes' ? selection.value : '',
        }),
      },
    }
  }

const buildItems = (
  { items, defaultItemLabel }: AdditionalSuportNeedsContent,
  data: FieldData,
  firstName: string,
  needsAdditionalSupport: TriState,
  messages: Record<string, GovukFrontendErrorMessage>,
): WithConditional<GovukFrontendCheckboxesItem>[] => {
  return items.map(buildItem(firstName, data, messages)).concat([
    { divider: 'or', value: '' },
    {
      value: 'none',
      text: defaultItemLabel.replace('{{ firstName }}', firstName),
      checked: not(needsAdditionalSupport),
      behaviour: 'exclusive',
    },
  ])
}

const buildChecklist = (
  content: AdditionalSuportNeedsContent,
  data: FieldData,
  firstName: string,
  needsAdditionalSupport: TriState,
  messages: Record<string, GovukFrontendErrorMessage>,
): GovukFrontendCheckboxesWithConditional => ({
  name: 'AdditionalNeeds',
  attributes: { 'data-testid': 'additional-needs' },
  fieldset: {
    legend: {
      text: content.header.replace('{{ firstName }}', firstName),
      isPageHeading: true,
      classes: 'govuk-fieldset__legend--l',
    },
    attributes: { 'data-testid': 'additional-needs-legend' },
  },
  errorMessage: messages.AdditionalNeeds,
  hint: { text: content.hint },
  items: buildItems(content, data, firstName, needsAdditionalSupport, messages),
})

export default class AdditionalSuportNeedsPresenter extends PresenterBase<
  AdditionalSuportNeedsViewModel,
  AdditionalSuportNeedsContent
> {
  constructor(
    private readonly data: AdditionalSupportNeedsDto,
    private readonly validationErrors: ErrorMiddlewareErrors,
  ) {
    super()
  }

  buildViewModel(res: Response): AdditionalSuportNeedsViewModel {
    const content = this.buildStaticContent(res)
    const { firstName, lastName } = this.data.refereeName
    const name = `${firstName} ${lastName}`
    return {
      heading: name,
      checkList: buildChecklist(
        content,
        this.data,
        this.data.refereeName.firstName,
        this.data.needsAdditionalSupport,
        this.validationErrors.messages,
      ),
      button: { text: content.button },
      backLink: { href: content.backlink },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/additionalSupportNeeds'
  }
}

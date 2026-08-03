import { Response } from 'express'
import { GovukFrontendCheckboxes, GovukFrontendCheckboxesItem } from '@govuk-frontend'
import { AdditionalSupportNeedsDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  ItemContent,
  AdditionalSuportNeedsContent,
  AdditionalSuportNeedsViewModel,
} from './AdditionalSupportNeedsModel'
import { WithConditional } from '../../@types/govukFrontend/derived'
import { buildInput } from '../../utils/utils'

const buildItem =
  (firstName: string) =>
  ({ label, hint, detailsLabel }: ItemContent): WithConditional<GovukFrontendCheckboxesItem> => ({
    value: label.replace('{{ firstName }}', firstName),
    text: label.replace('{{ firstName }}', firstName),
    hint: { text: hint },
    conditional: {
      html: buildInput({
        name: label,
        label: { text: detailsLabel.replace('{{ firstName }}', firstName) },
      }),
    },
  })

const buildItems = (
  { items, defaultItemLabel }: AdditionalSuportNeedsContent,
  firstName: string,
): WithConditional<GovukFrontendCheckboxesItem>[] =>
  items.map(buildItem(firstName)).concat([
    { divider: 'or', value: '' },
    { value: defaultItemLabel, text: defaultItemLabel.replace('{{ firstName }}', firstName), behaviour: 'exclusive' },
  ])

const buildChecklist = (content: AdditionalSuportNeedsContent, firstName: string): GovukFrontendCheckboxes => ({
  name: 'additional-needs',
  attributes: { 'test-id': 'additional-needs' },
  fieldset: {
    legend: {
      text: content.header.replace('{{ firstName }}', firstName),
      isPageHeading: true,
      classes: 'govuk-fieldset__legend--l',
    },
  },
  hint: { text: content.hint },
  items: buildItems(content, firstName),
})

export default class AdditionalSuportNeedsPresenter extends PresenterBase<
  AdditionalSuportNeedsViewModel,
  AdditionalSuportNeedsContent
> {
  constructor(private readonly data: AdditionalSupportNeedsDto) {
    super()
  }

  buildViewModel(res: Response): AdditionalSuportNeedsViewModel {
    const content = this.buildStaticContent(res)
    const { firstName, lastName } = this.data.refereeName
    const name = `${firstName} ${lastName}`
    return {
      heading: name,
      checkList: buildChecklist(content, firstName),
      postHref: '#',
    }
  }

  protected getTemplatePath(): string {
    return 'referral/additionalSupportNeeds'
  }
}

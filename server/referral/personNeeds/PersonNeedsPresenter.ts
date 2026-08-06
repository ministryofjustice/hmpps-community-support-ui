import { Response } from 'express'
import { GovukFrontendCheckboxesItem } from '@govuk-frontend'
import type { ReferralCriminogenicNeedsDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { PersonNeedsContent, PersonNeedsViewModel } from './PersonNeedsViewModel'
import { GovukFrontendCheckboxesWithConditional, WithConditional } from '../../@types/govukFrontend/derived'
import { buildTextarea } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { checkboxItemNames } from './buildPersonNeedsRequest'

export type personNeedsFormData = Omit<ReferralCriminogenicNeedsDto, 'id' | 'updatedAt' | 'updatedBy'>

export default class PersonNeedsPresenter extends PresenterBase<PersonNeedsViewModel, PersonNeedsContent> {
  constructor(
    private readonly data?: personNeedsFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
    this.data = data
  }

  private buildCheckboxItem(
    name: checkboxItemNames,
    content: PersonNeedsContent,
    checked: boolean,
    value: string,
  ): WithConditional<GovukFrontendCheckboxesItem> {
    return {
      value: name,
      text: content.checkboxes[`${name}Label`],
      checked,
      conditional: {
        html: buildTextarea({
          id: `${name}Input`,
          name: `${name}Input`,
          value,
          errorMessage: this.validationErrors?.messages[`${name}Input`] ?? null,
          spellcheck: false,
          classes: 'govuk-!-width-full',
          label: {
            text: content.checkboxes[`${name}Hint`].replace('{{ firstName }}', this.data.refereeName.firstName),
          },
        }),
      },
    }
  }

  private buildCheckboxes(content: PersonNeedsContent): GovukFrontendCheckboxesWithConditional {
    return {
      name: 'personNeedsCheckboxes',
      fieldset: {
        legend: {
          text: content.pageHeader,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--l',
        },
      },
      hint: {
        text: content.hint,
      },
      items: [
        this.buildCheckboxItem(
          'accommodation',
          content,
          this.data.hasAccommodationNeeds,
          this.data.accommodationDetails || '',
        ),
        this.buildCheckboxItem(
          'employment',
          content,
          this.data.hasEmploymentEducationNeeds,
          this.data.employmentEducationDetails || '',
        ),
        this.buildCheckboxItem('finances', content, this.data.hasFinancialNeeds, this.data.financialDetails || ''),
        this.buildCheckboxItem(
          'relationships',
          content,
          this.data.hasPersonalRelationshipsCommunityNeeds,
          this.data.personalRelationshipsCommunityDetails || '',
        ),
        this.buildCheckboxItem('drugUse', content, this.data.hasDrugUseNeeds, this.data.drugUseDetails || ''),
        this.buildCheckboxItem('alcoholUse', content, this.data.hasAlcoholUseNeeds, this.data.alcoholUseDetails || ''),
        this.buildCheckboxItem(
          'health',
          content,
          this.data.hasHealthWellbeingNeeds,
          this.data.healthWellbeingDetails || '',
        ),
        this.buildCheckboxItem(
          'thinking',
          content,
          this.data.hasThinkingBehavioursAttitudeNeeds,
          this.data.thinkingBehavioursAttitudeDetails || '',
        ),
      ],
    }
  }

  buildViewModel(res: Response): PersonNeedsViewModel {
    const content = this.buildStaticContent(res)
    return {
      heading: `${this.data.refereeName.firstName} ${this.data.refereeName.lastName}`,
      backLink: {
        href: content.backLink,
      },
      checkboxes: this.buildCheckboxes(content),
      submitButton: {
        text: content.submitButton,
      },
      submitHref: '/referral/task-list/select-person-needs',
    }
  }

  protected getTemplatePath(): string {
    return 'referral/personNeeds'
  }
}

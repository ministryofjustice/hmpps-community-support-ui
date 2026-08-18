import { Response } from 'express'
import { CommunitySupportServicesProvider, Person } from '@community-support-api'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendRadiosItem,
} from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { SelectAreaContent, SelectAreaViewModel } from './SelectAreaViewModel'

export default class SelectAreaPresenter extends PresenterBase<SelectAreaViewModel, SelectAreaContent> {
  buildViewModel(res: Response) {
    const content = this.buildStaticContent(res)
    return {
      heading: content.heading.replace(
        '{{ personName }}',
        `${this.personalDetails.firstName} ${this.personalDetails.lastName}`,
      ),
      pageCaption: content.pageCaption
        .replace('{{ CRN }}', this.personalDetails.personIdentifier)
        .replace('{{ DOB }}', this.personalDetails.dateOfBirth),
      radioArgs: this.buildRadios(content),
      backLinkArgs: this.generateBackLink(content),
      buttonArgs: this.generateButton(content),
    }
  }

  getTemplatePath(): string {
    return 'referral/selectArea'
  }

  constructor(
    private readonly personalDetails: Person,
    private readonly locations: CommunitySupportServicesProvider,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  generateBackLink(content: SelectAreaContent): GovukFrontendBackLink {
    return {
      text: content.backLinkText,
      href: content.backLinkHref,
    }
  }

  generateButton(content: SelectAreaContent): GovukFrontendButton {
    return { text: content.buttonText, preventDoubleClick: true }
  }

  generateRadioItems() {
    const radioItems: GovukFrontendRadiosItem[] = []
    Object.entries(this.locations.communitySupportServices).forEach(([region, areas]) => {
      radioItems.push({
        divider: region,
        value: '',
      })
      areas.forEach(area => {
        radioItems.push({
          value: `${area.id}`,
          text: `${area.area}`,
          hint: {
            text: `${area.pdus.join(', ')}`,
          },
        })
      })
    })
    return radioItems
  }

  buildRadios(content: SelectAreaContent): GovukFrontendRadios {
    return {
      name: 'selectArea',
      fieldset: {
        legend: {
          text: content.areaLabel,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      items: this.generateRadioItems(),
      classes: 'area-radio',
      errorMessage: this.validationErrors?.messages.selectArea ?? null,
    }
  }
}

import type { CommunitySupportServiceProviders } from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendRadios, GovukFrontendRadiosItem } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { CommunityServiceProviderContent2, CommunityServiceProviderViewModel2 } from './communityServiceProvidersModel2'

export default class CommunityServiceProviderPresenter2 extends PresenterBase<
  CommunityServiceProviderViewModel2,
  CommunityServiceProviderContent2
> {
  constructor(private readonly communitySupportServiceProviders: CommunitySupportServiceProviders[]) {
    super()
  }

  private buildItems(): GovukFrontendRadiosItem[] {
    return this.communitySupportServiceProviders.map(item => ({
      value: item.id,
      text: item.name,
    }))
  }

  private buildRadios(content: CommunityServiceProviderContent2): GovukFrontendRadios {
    return {
      name: 'service',
      fieldset: {
        legend: {
          text: content.pageHeader,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      items: this.buildItems(),
    }
  }

  buildViewModel(res: Response): CommunityServiceProviderViewModel2 {
    const content = this.buildStaticContent(res)
    return {
      backLink: { href: `/referral/new/find-a-person` },
      radios: this.buildRadios(content),
      button: {
        text: content.continueButtonText,
      },
    }
  }

  getTemplatePath(): string {
    return 'communityServiceProviders/providers2'
  }
}

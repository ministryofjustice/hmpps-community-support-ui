import type { CommunitySupportServiceProviders } from '@community-support-api'
import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { CommunityServiceProviderContent, CommunityServiceProviderViewModel } from './communityServiceProvidersModel'
import ViewUtils from '../../utils/viewUtils'

export default class CommunityServiceProviderPresenter extends PresenterBase<
  CommunityServiceProviderViewModel,
  CommunityServiceProviderContent
> {
  constructor(private readonly communitySupportServiceProviders: Array<CommunitySupportServiceProviders>) {
    super()
  }

  protected override buildPageContent(res: Response): CommunityServiceProviderViewModel {
    const content = this.buildStaticContent(res)
    const viewModel = {} as CommunityServiceProviderViewModel
    viewModel.content = content

    const providerSummaryRows = this.communitySupportServiceProviders.map(provider => {
      return [
        {
          key: { text: content.regionLabel },
          value: { text: provider.region },
        },
        {
          key: { text: content.providerLabel },
          value: { text: provider.providerName },
        },
      ]
    })
    viewModel.serviceProviderItems = providerSummaryRows.map((rows, index) => {
      return {
        url: `/referral/check-referral-information/${this.communitySupportServiceProviders[index].id}`,
        title: this.communitySupportServiceProviders[index].name,
        truncatedDescription: this.truncateDescription(this.communitySupportServiceProviders[index].description),
        summary: ViewUtils.summaryList(
          rows,
          { showBorders: true },
          { 'data-testid': 'community-service-provider-summary' },
        ),
      }
    })
    return viewModel
  }

  getTemplatePath(): string {
    return 'communityServiceProviders/providers'
  }

  private truncateDescription(description: string): string {
    // take just the first line of the description, up to a maximum of 500 characters
    const firstLine = description.split('\n')[0]
    return `${firstLine.substring(0, 500)}${firstLine.length > 500 ? '...' : ''}`
  }
}

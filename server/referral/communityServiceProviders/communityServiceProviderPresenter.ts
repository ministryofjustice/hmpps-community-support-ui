import type { CommunitySupportServiceProviders } from '@community-support-api'
import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { CommunityServiceProviderContent, CommunityServiceProviderViewModel } from './communityServiceProvidersModel'
import ViewUtils from '../../utils/viewUtils'

const truncateDescription = (description: string): string => {
  // take just the first line of the description, up to a maximum of 500 characters
  const firstLine = description.split('\n')[0]
  return `${firstLine.substring(0, 500)}${firstLine.length > 500 ? '...' : ''}`
}

export default class CommunityServiceProviderPresenter extends PresenterBase<
  CommunityServiceProviderViewModel,
  CommunityServiceProviderContent
> {
  constructor(private readonly communitySupportServiceProviders: Array<CommunitySupportServiceProviders>) {
    super()
  }

  protected override buildViewModel(res: Response): CommunityServiceProviderViewModel {
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
        url: `/referral/task-list`,
        title: this.communitySupportServiceProviders[index].name,
        truncatedDescription: truncateDescription(this.communitySupportServiceProviders[index].description),
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
}

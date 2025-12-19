import type { CommunitySupportServiceProviders } from '@community-support-api'
import { SummaryListItem } from '../../utils/summaryList'

export default class CommunityServiceProviderPresenter {
  constructor(private readonly communitySupportServiceProvider: CommunitySupportServiceProviders) {}

  get title(): string {
    return this.communitySupportServiceProvider.name
  }

  get hrefReferralStart(): string {
    return `/community-service-provider/${this.communitySupportServiceProvider.id}/refer`
  }

  get hrefInterventionDetails(): string {
    return `/community-service-provider/intervention/${this.communitySupportServiceProvider.id}`
  }

  get description(): string {
    return this.communitySupportServiceProvider.description
  }

  get truncatedDescription(): string {
    // take just the first line of the description, up to a maximum of 500 characters
    const firstLine = this.communitySupportServiceProvider.description.split('\n')[0]
    return `${firstLine.substring(0, 500)}${firstLine.length > 500 ? '...' : ''}`
  }

  get summary(): SummaryListItem[] {
    const summary = [
      {
        key: 'Location',
        lines: [this.communitySupportServiceProvider.region],
      },
      {
        key: 'Delivery Partner',
        lines: [this.communitySupportServiceProvider.providerName],
      },
    ]
    return summary
  }
}

import type { CommunitySupportServiceProviders } from '@community-support-api'
import { GovukFrontendSummaryListRow } from '../../@types/govukFrontend'

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

  get summary(): GovukFrontendSummaryListRow[] {
    const summary = [
      {
        key: { text: 'Location' },
        value: { text: this.communitySupportServiceProvider.region },
      },
      {
        key: { text: 'Delivery Partner' },
        value: { text: this.communitySupportServiceProvider.providerName },
      },
    ]
    return summary
  }
}

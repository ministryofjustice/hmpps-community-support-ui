import { GovukFrontendSummaryList } from '@govuk-frontend'

export type CommunityServiceProviderViewModel = {
  content: CommunityServiceProviderContent
  serviceProviderItems: Array<serviceProviderItem>
}

export type serviceProviderItem = {
  serviceProviderId: string
  url: string
  title: string
  truncatedDescription: string
  summary: GovukFrontendSummaryList
}

export type CommunityServiceProviderContent = {
  pageHeader: string
  regionLabel: string
  providerLabel: string
}

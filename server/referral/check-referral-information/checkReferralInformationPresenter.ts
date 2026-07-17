import { Person, ReferralInformation } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { CheckReferralInformationContent, CheckReferralInformationViewModel } from './checkReferralInformationViewModel'
import { resolveIdentifierRow } from '../personIdentifierUtils'

const resolveName = (person: Person): string =>
  [person.firstName, person.middleNames, person.lastName].filter(Boolean).join(' ')

export default class CheckReferralInformationPresenter extends PresenterBase<
  CheckReferralInformationViewModel,
  CheckReferralInformationContent
> {
  constructor(
    private readonly referralInformation: ReferralInformation,
    private readonly personDetails: Person,
  ) {
    super()
  }

  buildViewModel(res: Response): CheckReferralInformationViewModel {
    const viewModel = {} as CheckReferralInformationViewModel
    const content = this.buildStaticContent(res)
    viewModel.pageHeader = content.pageHeader
    viewModel.submitButtonText = content.submitButtonText
    viewModel.personalDetailsSummary = this.buildPersonalDetailsSummary()
    viewModel.referralDetailsSummary = this.buildReferralDetailsSummary()
    viewModel.backLink = { href: '/referral/new/find-a-person' }
    viewModel.submitHref = `/referral/${this.referralInformation.referralId}/submit-referral-information`
    return viewModel
  }

  getTemplatePath(): string {
    return `referral/checkReferralInformation`
  }

  private buildPersonalDetailsSummary(): GovukFrontendSummaryList {
    const { personDetails } = this
    const identifierRow = resolveIdentifierRow(personDetails)

    const summary = [
      {
        key: { text: 'Name' },
        value: { text: resolveName(personDetails) },
      },
      ...(identifierRow
        ? [
            {
              key: { text: identifierRow.label },
              value: { text: identifierRow.value },
            },
          ]
        : []),
      {
        key: { text: 'Date of birth' },
        value: { text: personDetails.dateOfBirth || '' },
      },
      {
        key: { text: 'Sex' },
        value: { text: personDetails.sex || '' },
      },
    ]
    return {
      card: {
        title: {
          text: 'Personal details',
        },
        attributes: { 'data-testid': 'personal-details' },
      },
      rows: summary,
    }
  }

  private buildReferralDetailsSummary(): GovukFrontendSummaryList {
    const summary = [
      {
        key: { text: 'Community Support Service' },
        value: { text: this.referralInformation.communityServiceProviderName },
      },
      {
        key: { text: 'Location' },
        value: { text: this.referralInformation.region },
      },
      {
        key: { text: 'Delivery Partner' },
        value: { text: this.referralInformation.deliveryPartner },
      },
    ]
    return {
      card: {
        title: {
          text: 'Referral details',
        },
        attributes: { 'data-testid': 'referral-details' },
      },
      rows: summary,
    }
  }
}

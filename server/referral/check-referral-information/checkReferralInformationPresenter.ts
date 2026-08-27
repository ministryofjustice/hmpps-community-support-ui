import { CheckDraftReferralDetailsDto } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { CheckReferralInformationContent, CheckReferralInformationViewModel } from './checkReferralInformationViewModel'
import { IdentifierRow } from '../personIdentifierUtils'

const resolveName = (name: { firstName: string; middleName?: string | null; lastName: string }): string =>
  [name.firstName, name.middleName, name.lastName].filter(Boolean).join(' ')

export default class CheckReferralInformationPresenter extends PresenterBase<
  CheckReferralInformationViewModel,
  CheckReferralInformationContent
> {
  constructor(private readonly draftReferralDetails: CheckDraftReferralDetailsDto) {
    super()
  }

  buildViewModel(res: Response): CheckReferralInformationViewModel {
    const viewModel = {} as CheckReferralInformationViewModel
    const content = this.buildStaticContent(res)
    viewModel.pageTitle = content.pageTitle
    viewModel.pageHeader = resolveName(this.draftReferralDetails.personDetailsTableData.name)
    viewModel.pageSubHeader = content.pageSubHeader
    viewModel.personalDetailsHeader = `About ${this.draftReferralDetails.personDetailsTableData.name.firstName}`
    viewModel.personalDetailsSummary = this.buildPersonalDetailsSummary()
    viewModel.referralDetailsHeader = content.referralDetailsHeader
    viewModel.referralDetailsSummary = this.buildReferralDetailsSummary()
    viewModel.referralContactDetailsHeader = content.referralContactDetailsHeader
    viewModel.backLink = { href: content.backLink }
    viewModel.submitButton = { text: content.submitButtonText, classes: 'govuk-!-margin-top-6' }

    viewModel.submitHref = `/referral/${this.draftReferralDetails.id}/submit-referral-information`
    return viewModel
  }

  getTemplatePath(): string {
    return `referral/checkReferralInformation`
  }

  private buildPersonalDetailsSummary(): GovukFrontendSummaryList {
    const { personDetailsTableData } = this.draftReferralDetails
    let identifierRow: IdentifierRow | null = null
    if (personDetailsTableData.crn) {
      identifierRow = { label: 'CRN', value: personDetailsTableData.crn }
    } else if (personDetailsTableData.prisonNumbers) {
      identifierRow = { label: 'Prison number', value: personDetailsTableData.prisonNumbers }
    }

    const summary = [
      {
        key: { text: 'Name' },
        value: { text: resolveName(personDetailsTableData.name) },
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
        value: { text: personDetailsTableData.dateOfBirth || '' },
      },
      {
        key: { text: 'Sex' },
        value: { text: this.draftReferralDetails.equalityDetailsTableData.sex || '' },
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
        value: { text: '' },
      },
      {
        key: { text: 'Location' },
        value: { text: this.draftReferralDetails.referralAreaTableData.area || '' },
      },
      {
        key: { text: 'Delivery Partner' },
        value: { text: '' },
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

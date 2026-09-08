import { CheckDraftReferralDetailsDto } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import { format } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import ViewUtils from '../../utils/viewUtils'
import { components } from '../../@types/communitySupportApi/imported'
import {
  CheckReferralInformationContent,
  CheckReferralInformationViewModel,
  PersonalDetailsCard,
} from './checkReferralInformationViewModel'

type IdentifierRow = {
  label: string
  value: string
}

const labelWithLastUpdated = (label: string, lastUpdatedLabel: string, lastUpdated: string): string =>
  `<b>${label}</b>\n<div class="govuk-hint govuk-!-font-size-16">${lastUpdatedLabel}: ${lastUpdated}</div>`

const getLatestUpdatedAt = (list: { updatedAt?: string }[] = [], notAvailable: string): string => {
  try {
    return format(new Date(Math.max(...list.map(e => new Date(e.updatedAt)).map(Number))), 'd MMMM yyyy')
  } catch {
    return notAvailable
  }
}

const formatPersonalCircumstances = (
  list: components['schemas']['PersonalCircumstance'][],
  notAvailable: string,
): string => {
  const circumstanceOrder = ['Relationship', 'Employment', 'Dependents']
  const circumstances = new Map<string, string[]>()

  list.forEach(circumstance => {
    const subDescription = ViewUtils.escape(circumstance.subDescription) || notAvailable
    circumstances.set(circumstance.description, [
      ...(circumstances.get(circumstance.description) || []),
      subDescription,
    ])
  })

  return circumstanceOrder
    .map(
      description =>
        `<div>${ViewUtils.escape(description)}: ${(circumstances.get(description) || [notAvailable]).join(', ')}</div>`,
    )
    .join('')
}

const formatDisabilities = (list: components['schemas']['Disability'][], notAvailable: string): string => {
  if (list && list.length > 0) return list.map(d => `<div>${ViewUtils.escape(d.description)}</div>`).join('')
  return notAvailable
}

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
    viewModel.personalDetailsSummary = this.buildPersonalDetailsSummary(content.personalDetailsCard, content.notAvailable)
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

  private buildPersonalDetailsSummary(cardContent: PersonalDetailsCard, notAvailable: string): GovukFrontendSummaryList {
    const { personDetailsTableData } = this.draftReferralDetails
    let identifierRow: IdentifierRow | null = null
    if (personDetailsTableData.crn) {
      identifierRow = { label: cardContent.crnLabel, value: personDetailsTableData.crn }
    } else if (personDetailsTableData.prisonNumber) {
      identifierRow = { label: cardContent.prisonNumberLabel, value: personDetailsTableData.prisonNumber }
    }

    const summary = [
      {
        key: { text: cardContent.nameLabel },
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
        key: { text: cardContent.locationLabel },
        // Current location is not yet returned by the API.
        value: { text: notAvailable },
      },
      {
        key: { text: cardContent.dobLabel },
        value: { text: personDetailsTableData.dateOfBirth || '' },
      },
      {
        key: { text: cardContent.languageLabel },
        value: { text: personDetailsTableData.preferredLanguage || '' },
      },
      {
        key: {
          html: labelWithLastUpdated(
            cardContent.currentCircumstancesLabel,
            cardContent.lastUpdatedLabel,
            getLatestUpdatedAt(personDetailsTableData.personalCircumstances, notAvailable),
          ),
        },
        value: { html: formatPersonalCircumstances(personDetailsTableData.personalCircumstances, notAvailable) },
      },
      {
        key: {
          html: labelWithLastUpdated(
            cardContent.disabilitiesLabel,
            cardContent.lastUpdatedLabel,
            getLatestUpdatedAt(personDetailsTableData.disabilities, notAvailable),
          ),
        },
        value: { html: formatDisabilities(personDetailsTableData.disabilities, notAvailable) },
      },
    ]
    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'personal-details' },
      },
      rows: summary,
    }
  }

  private buildReferralDetailsSummary(): GovukFrontendSummaryList {
    const summary = [
      {
        key: { text: 'Location' },
        value: { text: this.draftReferralDetails.referralAreaTableData.area || '' },
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

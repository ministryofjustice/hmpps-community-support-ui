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

// Current location is not yet returned by the API.
const PLACEHOLDER_VALUE = 'Not available'

const labelWithLastUpdated = (label: string, lastUpdatedLabel: string, lastUpdated: string): string =>
  `<b>${label}</b>\n<div class="govuk-hint govuk-!-font-size-16">${lastUpdatedLabel}: ${lastUpdated}</div>`

const getLatestUpdatedAt = (list: { updatedAt?: string }[] = []): string => {
  try {
    return format(new Date(Math.max(...list.map(e => new Date(e.updatedAt)).map(Number))), 'd MMMM yyyy')
  } catch {
    return PLACEHOLDER_VALUE
  }
}

const formatPersonalCircumstances = (list: components['schemas']['PersonalCircumstance'][]): string => {
  if (list && list.length > 0) {
    return list
      .map(
        c => `<div>${ViewUtils.escape(c.description)}: ${ViewUtils.escape(c.subDescription) || PLACEHOLDER_VALUE}</div>`,
      )
      .join('')
  }
  return PLACEHOLDER_VALUE
}

const formatDisabilities = (list: components['schemas']['Disability'][]): string => {
  if (list && list.length > 0) return list.map(d => `<div>${ViewUtils.escape(d.description)}</div>`).join('')
  return PLACEHOLDER_VALUE
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
    viewModel.personalDetailsSummary = this.buildPersonalDetailsSummary(content.personalDetailsCard)
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

  private buildPersonalDetailsSummary(cardContent: PersonalDetailsCard): GovukFrontendSummaryList {
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
        value: { text: PLACEHOLDER_VALUE },
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
            getLatestUpdatedAt(personDetailsTableData.personalCircumstances),
          ),
        },
        value: { html: formatPersonalCircumstances(personDetailsTableData.personalCircumstances) },
      },
      {
        key: {
          html: labelWithLastUpdated(
            cardContent.disabilitiesLabel,
            cardContent.lastUpdatedLabel,
            getLatestUpdatedAt(personDetailsTableData.disabilities),
          ),
        },
        value: { html: formatDisabilities(personDetailsTableData.disabilities) },
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

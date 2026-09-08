import { CheckDraftReferralDetailsDto } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import { format, differenceInYears } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import ViewUtils, { govFrontendSummaryListRow } from '../../utils/viewUtils'
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

const getLatestUpdatedAt = (list: { updatedAt?: string }[], notAvailable: string): string => {
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

  return circumstanceOrder
    .flatMap(description => {
      const matches = list.filter(circumstance => circumstance.description === description)
      if (matches.length === 0) return [`<div>${ViewUtils.escape(description)}: ${notAvailable}</div>`]
      return matches.map(
        circumstance => `<div>${ViewUtils.escape(description)}: ${ViewUtils.escape(circumstance.subDescription)}</div>`,
      )
    })
    .join('')
}

const formatDisabilities = (list: components['schemas']['Disability'][], notAvailable: string): string => {
  if (list && list.length > 0) return list.map(d => `<div>${ViewUtils.escape(d.description)}</div>`).join('')
  return notAvailable
}

const resolveName = (name: { firstName: string; middleName?: string | null; lastName: string }): string =>
  [name.firstName, name.middleName, name.lastName].filter(Boolean).join(' ')

const formatDateOfBirth = (dateOfBirth: string, notAvailable: string): string => {
  if (!dateOfBirth) return notAvailable
  const dobDate = new Date(dateOfBirth)
  const age = differenceInYears(new Date(), dobDate)
  return `${format(dobDate, 'd MMM yyyy')} (${age} years old)`
}

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
    viewModel.personalDetailsSummary = this.buildPersonalDetailsSummary(
      content.personalDetailsCard,
      content.notAvailable,
    )
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

  private buildPersonalDetailsSummary(
    cardContent: PersonalDetailsCard,
    notAvailable: string,
  ): GovukFrontendSummaryList {
    const { personDetailsTableData } = this.draftReferralDetails
    let identifierRow: IdentifierRow | null = null
    if (personDetailsTableData.crn) {
      identifierRow = { label: cardContent.crnLabel, value: personDetailsTableData.crn }
    } else if (personDetailsTableData.prisonNumber) {
      identifierRow = { label: cardContent.prisonNumberLabel, value: personDetailsTableData.prisonNumber }
    }

    const summary = [
      govFrontendSummaryListRow(cardContent.nameLabel, resolveName(personDetailsTableData.name)),
      ...(identifierRow ? [govFrontendSummaryListRow(identifierRow.label, identifierRow.value)] : []),
      govFrontendSummaryListRow(cardContent.locationLabel, notAvailable),
      govFrontendSummaryListRow(
        cardContent.dobLabel,
        formatDateOfBirth(personDetailsTableData.dateOfBirth, notAvailable),
      ),
      govFrontendSummaryListRow(cardContent.languageLabel, personDetailsTableData.preferredLanguage || notAvailable),
      govFrontendSummaryListRow(
        {
          html: labelWithLastUpdated(
            cardContent.currentCircumstancesLabel,
            cardContent.lastUpdatedLabel,
            getLatestUpdatedAt(personDetailsTableData.personalCircumstances, notAvailable),
          ),
        },
        { html: formatPersonalCircumstances(personDetailsTableData.personalCircumstances, notAvailable) },
      ),
      govFrontendSummaryListRow(
        {
          html: labelWithLastUpdated(
            cardContent.disabilitiesLabel,
            cardContent.lastUpdatedLabel,
            getLatestUpdatedAt(personDetailsTableData.disabilities, notAvailable),
          ),
        },
        { html: formatDisabilities(personDetailsTableData.disabilities, notAvailable) },
      ),
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
    const summary = [govFrontendSummaryListRow('Location', this.draftReferralDetails.referralAreaTableData.area || '')]
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

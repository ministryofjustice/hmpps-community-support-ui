import { CheckDraftReferralDetailsDto } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import { format, differenceInYears } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import formatFullName from '../../utils/presenterFormatters'
import ViewUtils, { escapeSpecialHtmlCharacters, govFrontendSummaryListRow } from '../../utils/viewUtils'
import { components } from '../../@types/communitySupportApi/imported'
import {
  CheckReferralInformationContent,
  CheckReferralInformationViewModel,
  EqualityMonitoringCard,
  PersonalDetailsCard,
  RiskInformationCard,
  ContactDetailsCard,
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
    .map(description => {
      const matches = list.filter(circumstance => circumstance.description === description)
      if (matches.length === 0) return `<div>${ViewUtils.escape(description)}: ${notAvailable}</div>`

      const values = matches.map(m => (m.subDescription ? ViewUtils.escape(m.subDescription) : '')).filter(Boolean)

      if (values.length === 0) return `<div>${ViewUtils.escape(description)}: ${notAvailable}</div>`

      return `<div>${ViewUtils.escape(description)}: ${values.join(', ')}</div>`
    })
    .join('')
}

const formatDisabilities = (list: components['schemas']['Disability'][], notAvailable: string): string => {
  if (list && list.length > 0) return list.map(d => `<div>${ViewUtils.escape(d.description)}</div>`).join('')
  return notAvailable
}

const formatAddress = (
  addressData: {
    noFixedAbode?: boolean
    noFixedAbodeText?: string
    address?: string | null
    addressType?: string | null
    startDate?: string | null
    notes?: string | null
  },
  typeLabel: string,
  startDateLabel: string,
  notesLabel: string,
  notAvailable: string,
): string => {
  const address = addressData.noFixedAbode ? addressData.noFixedAbodeText : addressData.address
  return `<div>${escapeSpecialHtmlCharacters(address) || notAvailable}</div>
<br/>
<div class="govuk-summary-list__key">${typeLabel}</div>
<div>${escapeSpecialHtmlCharacters(addressData.addressType) || notAvailable}</div>
<br/>
<div class="govuk-summary-list__key">${startDateLabel}</div>
<div>${addressData.startDate || notAvailable}</div>
<br/>
<div class="govuk-summary-list__key">${notesLabel}</div>
<div>${escapeSpecialHtmlCharacters(addressData.notes) || notAvailable}</div>`
}

const resolveName = (name: { firstName: string; middleName?: string | null; lastName: string }): string =>
  formatFullName(name.firstName, name.lastName, name.middleName)

const formatDateOfBirth = (dateOfBirth: string, notAvailable: string): string => {
  if (!dateOfBirth) return notAvailable
  const dobDate = new Date(dateOfBirth)
  const age = differenceInYears(new Date(), dobDate)
  return `${format(dobDate, 'd MMM yyyy')} (${age} years old)`
}
const formatHomeOfficeInterest = (notes?: string): string => {
  if (notes) {
    return `<div>Yes</div><br/><div>${escapeSpecialHtmlCharacters(notes)}</div>`
  }
  return 'Yes'
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
    // compute last-updated values and pass label through
    const personalLastUpdated = content.lastUpdatedLabel
    viewModel.personalDetailsSummary = this.buildPersonalDetailsSummary(
      content.personalDetailsCard,
      content.notAvailable,
      personalLastUpdated,
    )
    viewModel.equalityMonitoringSummary = this.buildEqualityMonitoringSummary(
      content.equalityMonitoringCard,
      content.notAvailable,
    )
    viewModel.additionalInformationSummary = this.buildAdditionalInformationSummary(content.additionalInformationCard)
    viewModel.riskInformationSummary = this.buildRiskInformationSummary(
      content.riskInformationCard,
      content.notAvailable,
    )
    viewModel.referralDetailsHeader = content.referralDetailsHeader
    viewModel.referralDetailsSummary = this.buildReferralDetailsSummary()
    if (content.contactDetailsCard) {
      const contactLastUpdatedLabel = content.lastUpdatedLabel
      viewModel.contactDetailsSummary = this.buildContactDetailsSummary(
        content.contactDetailsCard,
        content.notAvailable,
        contactLastUpdatedLabel,
      )
    }
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
    lastUpdatedLabel: string,
  ): GovukFrontendSummaryList {
    const { personDetailsTableData } = this.draftReferralDetails
    let identifierRow: IdentifierRow | null = null
    if (personDetailsTableData.crn) {
      identifierRow = { label: cardContent.crnLabel, value: personDetailsTableData.crn }
    } else if (personDetailsTableData.prisonNumber) {
      identifierRow = { label: cardContent.prisonNumberLabel, value: personDetailsTableData.prisonNumber }
    }

    const rows = [
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
            lastUpdatedLabel,
            getLatestUpdatedAt(personDetailsTableData.personalCircumstances, notAvailable),
          ),
        },
        { html: formatPersonalCircumstances(personDetailsTableData.personalCircumstances, notAvailable) },
      ),
      govFrontendSummaryListRow(
        {
          html: labelWithLastUpdated(
            cardContent.disabilitiesLabel,
            lastUpdatedLabel,
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
      rows,
    }
  }

  private buildRiskInformationSummary(
    cardContent: RiskInformationCard,
    notAvailable: string,
  ): GovukFrontendSummaryList {
    const data = this.draftReferralDetails.riskInformationDetailsTableData || {}

    const rows = [
      govFrontendSummaryListRow(cardContent.whoIsAtRiskLabel, data.whoIsAtRisk || notAvailable),
      govFrontendSummaryListRow(cardContent.riskNatureLabel, data.natureOfRisk || notAvailable),
      govFrontendSummaryListRow(cardContent.riskCircumstancesLabel, data.riskImminence || notAvailable),
      govFrontendSummaryListRow(cardContent.riskOfSelfHarmLabel, data.riskOfSelfHarm || notAvailable),
      govFrontendSummaryListRow(cardContent.riskOfSuicideLabel, data.riskOfSuicide || notAvailable),
      govFrontendSummaryListRow(
        cardContent.concernsCopingInApprovedPremisesLabel,
        data.riskToSelfHostelSetting || notAvailable,
      ),
      govFrontendSummaryListRow(cardContent.concernsVulnerabilityLabel, data.riskToSelfVulnerability || notAvailable),
      govFrontendSummaryListRow(
        cardContent.additionalInformationLabel,
        data.additionalInformation || cardContent.noAdditionalInformationText,
      ),
    ]

    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'risk-information' },
      },
      rows,
    }
  }

  private buildReferralDetailsSummary(): GovukFrontendSummaryList {
    const rows = [govFrontendSummaryListRow('Location', this.draftReferralDetails.referralAreaTableData.area || '')]
    return {
      card: {
        title: {
          text: 'Referral details',
        },
        attributes: { 'data-testid': 'referral-details' },
      },
      rows,
    }
  }

  private buildEqualityMonitoringSummary(
    cardContent: EqualityMonitoringCard,
    notAvailable: string,
  ): GovukFrontendSummaryList {
    const equality = this.draftReferralDetails.equalityDetailsTableData

    const rows = [
      govFrontendSummaryListRow(cardContent.nationalityLabel, equality.nationality || notAvailable),
      govFrontendSummaryListRow(cardContent.ethnicityLabel, equality.ethnicity || notAvailable),
      govFrontendSummaryListRow(cardContent.religionOrBeliefLabel, equality.religionOrBelief || notAvailable),
      govFrontendSummaryListRow(cardContent.sexLabel, equality.sex || notAvailable),
    ]

    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'equality-monitoring' },
      },
      rows,
    }
  }

  private buildContactDetailsSummary(
    cardContent: ContactDetailsCard,
    notAvailable: string,
    lastUpdatedLabel: string,
  ): GovukFrontendSummaryList {
    const data = this.draftReferralDetails.contactDetailsTableData

    const formattedAddress = formatAddress(
      {
        noFixedAbode: data.noFixedAddress,
        noFixedAbodeText: cardContent.noFixedAbode,
        address: data.address,
        addressType: data.addressType,
        startDate: data.addressStartDate,
        notes: data.addressNotes,
      },
      cardContent.addressTypeLabel,
      cardContent.addressStartDateLabel,
      cardContent.addressNotesLabel,
      notAvailable,
    )
    const addressLabel = data.inCustody ? cardContent.lastKnownAddressLabel : cardContent.mainAddressLabel
    const rows = [
      govFrontendSummaryListRow(cardContent.phoneNumberLabel, data.phoneNumber || notAvailable),
      govFrontendSummaryListRow(cardContent.mobileNumberLabel, data.mobileNumber || notAvailable),
      govFrontendSummaryListRow(cardContent.emailAddressLabel, data.email || notAvailable),
      govFrontendSummaryListRow(
        { html: labelWithLastUpdated(addressLabel, lastUpdatedLabel, data.addressUpdatedAt || notAvailable) },
        { html: formattedAddress },
      ),
    ]

    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'contact-details' },
      },
      rows,
    }
  }

  private buildAdditionalInformationSummary(cardContent: {
    heading?: string
    homeOfficeInterestLabel: string
    opdPathwayLabel: string
  }): GovukFrontendSummaryList {
    const data = this.draftReferralDetails.additionalInformationDetailsTableData

    const rows = [
      data.ofHomeOfficeInterest
        ? govFrontendSummaryListRow(cardContent.homeOfficeInterestLabel, {
            html: formatHomeOfficeInterest(data.homeOfficeInterestNotes),
          })
        : null,
      data.offenderPersonalityDisorderPathway
        ? govFrontendSummaryListRow(cardContent.opdPathwayLabel, data.offenderPersonalityDisorderPathway)
        : null,
    ].filter(row => row !== null)
    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'additional-information' },
      },
      rows,
    }
  }
}

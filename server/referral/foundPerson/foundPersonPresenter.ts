import { Response } from 'express'
import { Person } from '@community-support-api'
import { format } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import { FoundPersonContent, FoundPersonViewModel } from './foundPersonViewModel'
import ViewUtils from '../../utils/viewUtils'
import { resolveIdentifierRow } from '../personIdentifierUtils'
import { components } from '../../@types/communitySupportApi/imported'
import isIdentifierACrn from '../../utils/isIdentifierACrn'

const resolveName = (person: Person): string =>
  [person.firstName, person.middleNames, person.lastName].filter(Boolean).join(' ')

const getLatestUpdatedAt = (list: { updatedAt?: string }[]): string => {
  try {
    return format(new Date(Math.max(...list.map(e => new Date(e.updatedAt)).map(Number))), 'd MMMM yyyy')
  } catch {
    return 'Not available'
  }
}

const formatPersonalCircumstances = (list: components['schemas']['PersonalCircumstance'][]): string => {
  // Order of circumstance types for sorting
  enum circumstanceType {
    Relationship,
    Employment,
    Dependants,
  }

  if (list && list.length > 0) {
    return list
      .filter(c => Object.values(circumstanceType).includes(c.description))
      .sort(
        (a, b) =>
          circumstanceType[a.description as keyof typeof circumstanceType] -
          circumstanceType[b.description as keyof typeof circumstanceType],
      )
      .map(c => `<div>${c.description}: ${c.subDescription}</div>`)
      .join('')
  }
  return 'Not available'
}

const formatDisabilities = (list: components['schemas']['Disability'][]): string => {
  if (list && list.length > 0) return list.map(d => `<div>${d.description}</div>`).join('')
  return 'Not available'
}

const formatHomeOfficeInterest = (notes?: string): string => {
  if (notes) {
    return `<div>Yes</div><br/><div>${notes}</div>`
  }
  return 'Yes'
}

const formatAddress = (address?: string, type?: string, startDate?: string, notes?: string): string => {
  if (!address) {
    return 'Not available'
  }

  let formattedStartDate
  try {
    formattedStartDate = format(new Date(startDate), 'd MMMM yyyy')
  } catch {
    formattedStartDate = 'Not available'
  }

  return `<div>${address}</div>
<br/>
<div class="govuk-summary-list__key">Type of address</div>
<div>${type || 'Not available'}</div>
<br/>
<div class="govuk-summary-list__key">Start date</div>
<div>${formattedStartDate}</div>
<br/>
<div class="govuk-summary-list__key">Notes</div>
<div>${notes || 'No notes'}</div>`
}

export default class FoundPersonPresenter extends PresenterBase<FoundPersonViewModel, FoundPersonContent> {
  constructor(private readonly foundPerson: Person) {
    super()
  }

  protected override buildViewModel(res: Response): FoundPersonViewModel {
    const { foundPerson } = this
    const identifierRow = resolveIdentifierRow(foundPerson)

    const currentCircumstancesLastUpdated = getLatestUpdatedAt(
      foundPerson.personDetailsAndCircumstances?.personalCircumstances,
    )
    const disabilitiesLastUpdated = getLatestUpdatedAt(foundPerson.personDetailsAndCircumstances?.disabilities)

    const viewModel = {} as FoundPersonViewModel
    viewModel.staticContent = this.buildStaticContent(res)
    viewModel.backLink = { href: viewModel.staticContent.backLink }

    const personSummaryItems = [
      ViewUtils.summaryListRow('Name', resolveName(foundPerson)),
      ...(identifierRow ? [ViewUtils.summaryListRow(identifierRow.label, identifierRow.value)] : []),
      ViewUtils.summaryListRow('Current location', 'Not available'),
      ViewUtils.summaryListRow('Date of birth', foundPerson.dateOfBirth || ''),
      ViewUtils.summaryListRow(
        'Preferred language',
        foundPerson.personDetailsAndCircumstances?.preferredLanguage || 'Not available',
      ),
      ViewUtils.summaryListRow(
        {
          html: `<b>Current circumstances</b>\n<div class="govuk-hint govuk-!-font-size-16">Last updated: ${currentCircumstancesLastUpdated}</div>`,
        },
        { html: formatPersonalCircumstances(foundPerson.personDetailsAndCircumstances?.personalCircumstances) },
      ),
      ViewUtils.summaryListRow(
        {
          html: `<b>Disabilities</b>\n<div class="govuk-hint govuk-!-font-size-16">Last updated: ${disabilitiesLastUpdated}</div>`,
        },
        { html: formatDisabilities(foundPerson.personDetailsAndCircumstances?.disabilities) },
      ),
    ]
    viewModel.personSummary = ViewUtils.summaryList(personSummaryItems, { showBorders: true }, 'Personal details', {
      'data-testid': 'personsummary',
    })

    const equalityMonitoringItems = [
      ViewUtils.summaryListRow(
        'Nationality',
        foundPerson.additionalDetails?.nationalities?.join(', ') || 'Not available',
      ),
      ViewUtils.summaryListRow('Ethnicity', foundPerson.additionalDetails?.ethnicity || 'Not available'),
      ViewUtils.summaryListRow('Religion or belief', foundPerson.additionalDetails?.religionOrBelief || 'No religion'),
      ViewUtils.summaryListRow('Sex', foundPerson.sex || ''),
    ]
    viewModel.equalityMonitoring = ViewUtils.summaryList(
      equalityMonitoringItems,
      { showBorders: true },
      'Equality monitoring',
      { 'data-testid': 'equalityMonitoring' },
    )

    const additionalInformationItems = [
      foundPerson.personDetailsAndCircumstances?.ofHomeOfficeInterest
        ? ViewUtils.summaryListRow('Home Office Interest', {
            html: formatHomeOfficeInterest(foundPerson.personDetailsAndCircumstances?.homeOfficeInterestNotes),
          })
        : null,
      foundPerson.personDetailsAndCircumstances?.offenderPersonalityDisorder
        ? ViewUtils.summaryListRow(
            'Offender personality disorder (OPD) pathway',
            foundPerson.personDetailsAndCircumstances?.offenderPersonalityDisorder,
          )
        : null,
    ].filter(x => x !== null)
    if (additionalInformationItems.length > 0) {
      viewModel.additionalInformation = ViewUtils.summaryList(
        additionalInformationItems,
        { showBorders: true },
        'Additional information',
        { 'data-testid': 'additionalInformation' },
      )
    }

    const inCustody = !isIdentifierACrn(foundPerson.personIdentifier)
    const contactDetailsItems = [
      ViewUtils.summaryListRow('Phone number', foundPerson.additionalDetails?.phoneNumber || 'Not available'),
      ViewUtils.summaryListRow('Mobile number', foundPerson.additionalDetails?.mobileNumber || 'Not available'),
      ViewUtils.summaryListRow('Email address', foundPerson.additionalDetails?.emailAddress || 'Not available'),
      ViewUtils.summaryListRow(
        {
          html: `<b>${inCustody ? 'Last known' : 'Main'} address</b>\n<div class="govuk-hint govuk-!-font-size-16">Last updated: Not available</div>`,
        },
        {
          html: formatAddress(
            foundPerson.additionalDetails?.address,
            foundPerson.additionalDetails?.addressType,
            foundPerson.additionalDetails?.addressStartDate,
            foundPerson.additionalDetails?.addressNotes,
          ),
        },
      ),
    ]
    viewModel.contactDetails = ViewUtils.summaryList(contactDetailsItems, { showBorders: true }, 'Contact details', {
      'data-testid': 'contactDetails',
    })

    return viewModel
  }

  protected override getTemplatePath(): string {
    return 'referral/foundPerson'
  }

  renderPage(res: Response): void {
    const pageContent = this.buildViewModel(res)
    return res.render(this.getTemplatePath(), {
      content: pageContent,
    })
  }
}

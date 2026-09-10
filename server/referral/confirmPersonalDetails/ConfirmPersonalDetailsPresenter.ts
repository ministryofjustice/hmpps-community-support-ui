import { Response } from 'express'
import { GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '@govuk-frontend'
import { differenceInYears } from 'date-fns'
import { ConfirmPersonDetailsBffDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import dateFormat from '../../utils/dateFormat'
import {
  ConfirmPersonalDetailsContent,
  ConfirmPersonalDetailsViewModel,
  ContactDetailsCard,
  EqualityMonitoringCard,
  PersonalDetailsCard,
} from './ConfirmPersonalDetailsViewModel'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'
import { formatFullName, trimOrDefault } from '../../utils/presenterFormatters'

type ContactAddress = ConfirmPersonDetailsBffDto['contactDetails']['address']

const formatUpdatedAt = (updatedAt: string | undefined | null): string =>
  (updatedAt ?? '').trim() !== '' ? dateFormat(new Date(updatedAt as string)) : 'Not available'

export default class ConfirmPersonalDetailsPresenter extends PresenterBase<
  ConfirmPersonalDetailsViewModel,
  ConfirmPersonalDetailsContent
> {
  constructor(private readonly data: ConfirmPersonDetailsBffDto) {
    super()
  }

  private buildPersonalDetails(cardContent: PersonalDetailsCard, defaultFieldValue: string): GovukFrontendSummaryList {
    const { crn, prisonNumbers, dateOfBirth, preferredLanguage, currentCircumstances, disabilities } =
      this.data.personalDetails
    const dobDate = new Date(dateOfBirth)
    const age = differenceInYears(new Date(), dobDate)
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'personal-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.nameLabel, trimOrDefault(this.getFullName(), defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.crnLabel, trimOrDefault(crn, defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.prisonLabel, trimOrDefault(prisonNumbers.join(', '), defaultFieldValue)),
        govFrontendSummaryListRow(
          cardContent.dobLabel,
          trimOrDefault(`${dateFormat(dobDate)} (${age} years old)`, defaultFieldValue),
        ),
        govFrontendSummaryListRow(cardContent.languageLabel, trimOrDefault(preferredLanguage, defaultFieldValue)),
        {
          key: {
            html: `${cardContent.circumstancesLabel}<br>
             <span class="govuk-body-s secondary-text govuk-!-font-weight-regular">
               Last updated: ${formatUpdatedAt(currentCircumstances.updatedAt)}
             </span>`,
          },
          value: { text: trimOrDefault(currentCircumstances.value, defaultFieldValue) },
        },
        {
          key: {
            html: `${cardContent.disabilitiesLabel}<br>
             <span class="govuk-body-s secondary-text govuk-!-font-weight-regular">
               Last updated: ${formatUpdatedAt(disabilities.updatedAt)}
             </span>`,
          },
          value: { text: trimOrDefault(disabilities.allDisabilities, defaultFieldValue) },
        },
      ],
    }
  }

  private buildEqualityDetails(
    cardContent: EqualityMonitoringCard,
    defaultFieldValue: string,
  ): GovukFrontendSummaryList {
    const { nationalities, ethnicity, religionOrBelief, sex } = this.data.equalityMonitoring
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'equality-details' },
      },
      rows: [
        govFrontendSummaryListRow(
          cardContent.nationalityLabel,
          trimOrDefault(nationalities.join(', '), defaultFieldValue),
        ),
        govFrontendSummaryListRow(cardContent.ethnicityLabel, trimOrDefault(ethnicity, defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.religionLabel, trimOrDefault(religionOrBelief, defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.sexLabel, trimOrDefault(sex, defaultFieldValue)),
      ],
    }
  }

  private buildAddressRow(address: ContactAddress, cardContent: ContactDetailsCard): GovukFrontendSummaryListRow {
    const hasNoFixedAbode = address.noFixedAbode
    const mainAddress = trimOrDefault(address.value, 'Not available')
    return {
      key: {
        html: `${cardContent.mainAddressLabel}<br>
        <span class="govuk-body-s secondary-text govuk-!-font-weight-regular">
            Last updated: ${formatUpdatedAt(address.updatedAt)}
        </span>`,
      },
      value: {
        html: hasNoFixedAbode
          ? 'No fixed abode'
          : `${mainAddress}<br>
              <p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <span class="govuk-summary-list__key govuk-!-padding-bottom-0">Type of address</span>
                <span>${trimOrDefault(address.type, 'Not available')}</span>
              </p>
              <p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <span class="govuk-summary-list__key govuk-!-padding-bottom-0">Start date</span>
                <span>${formatUpdatedAt(address.startAt)}</span>
              </p>
              <p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <span class="govuk-summary-list__key govuk-!-padding-bottom-0">Notes</span>
                <span>${trimOrDefault(address.notes, 'No notes')}</span>
              </p>`,
      },
    }
  }

  private buildContactDetails(cardContent: ContactDetailsCard, defaultFieldValue: string): GovukFrontendSummaryList {
    const { phoneNumber, mobileNumber, emailAddress, address } = this.data.contactDetails
    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'contact-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.phoneNumberLabel, trimOrDefault(phoneNumber, defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.mobileNumberLabel, trimOrDefault(mobileNumber, defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.emailAddressLabel, trimOrDefault(emailAddress, defaultFieldValue)),
        this.buildAddressRow(address, cardContent),
      ],
    }
  }

  private getFullName(): string {
    const { firstName, lastName, middleNames } = this.data.personalDetails
    return formatFullName(firstName, lastName, middleNames)
  }

  buildViewModel(res: Response): ConfirmPersonalDetailsViewModel {
    const content = this.buildStaticContent(res)
    return {
      heading: content.pageHeader.replace('{{ name }}', this.getFullName()),
      subheading: content.pageSubHeader,
      personal: this.buildPersonalDetails(content.personalDetailsCard, content.defaultFieldValue),
      equality: this.buildEqualityDetails(content.equalityMonitoringCard, content.defaultFieldValue),
      contact: this.buildContactDetails(content.contactDetailsCard, content.defaultFieldValue),
      backLink: { href: content.backLink.replace('{{ id }}', this.data.personalDetails.crn) },
      warning: { text: content.warningText, iconFallbackText: content.warningText },
      button: {
        text: content.buttonText,
        preventDoubleClick: true,
        type: 'submit',
      },
    }
  }

  getTemplatePath(): string {
    return 'referral/confirmPersonalDetails'
  }
}

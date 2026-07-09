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

const nonEmptyStringOrDefault = (str: string | undefined | null, defaultValue: string): string =>
  (str ?? '').trim() || defaultValue

type ContactAddress = ConfirmPersonDetailsBffDto['contactDetails']['address']

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
        govFrontendSummaryListRow(
          cardContent.nameLabel,
          nonEmptyStringOrDefault(this.getFullName(), defaultFieldValue),
        ),
        govFrontendSummaryListRow(cardContent.crnLabel, nonEmptyStringOrDefault(crn, defaultFieldValue)),
        govFrontendSummaryListRow(
          cardContent.prisonLabel,
          nonEmptyStringOrDefault(prisonNumbers.join(', '), defaultFieldValue),
        ),
        govFrontendSummaryListRow(
          cardContent.dobLabel,
          nonEmptyStringOrDefault(`${dateFormat(dobDate)} (${age} years old)`, defaultFieldValue),
        ),
        govFrontendSummaryListRow(
          cardContent.languageLabel,
          nonEmptyStringOrDefault(preferredLanguage, defaultFieldValue),
        ),
        {
          key: {
            html: `${cardContent.circumstancesLabel}<br>
            <span class="govuk-body-s secondary-text govuk-!-font-weight-regular" style="color: #505a5f;">
              Last updated ${dateFormat(new Date(currentCircumstances.updatedAt))}
            </span>`,
          },
          value: { text: currentCircumstances.value },
        },
        {
          key: {
            html: `${cardContent.disabilitiesLabel}<br>
            <span class="govuk-body-s secondary-text govuk-!-font-weight-regular" style="color: #505a5f;">
              Last updated ${dateFormat(new Date(disabilities.updatedAt))}
            </span>`,
          },
          value: { text: disabilities.allDisabilities },
        },
      ],
    }
  }

  private buildEqualityDetails(
    cardContent: EqualityMonitoringCard,
    defaultFieldValue: string,
  ): GovukFrontendSummaryList {
    const { nationalities, ethnicity, religionOrBelief, sex, genderIdentity, sexualOrientation, transgender } =
      this.data.equalityMonitoring
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'equality-details' },
      },
      rows: [
        govFrontendSummaryListRow(
          cardContent.nationalityLabel,
          nonEmptyStringOrDefault(nationalities.join(', '), defaultFieldValue),
        ),
        govFrontendSummaryListRow(cardContent.ethnicityLabel, nonEmptyStringOrDefault(ethnicity, defaultFieldValue)),
        govFrontendSummaryListRow(
          cardContent.religionLabel,
          nonEmptyStringOrDefault(religionOrBelief, defaultFieldValue),
        ),
        govFrontendSummaryListRow(cardContent.sexLabel, nonEmptyStringOrDefault(sex, defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.genderLabel, nonEmptyStringOrDefault(genderIdentity, defaultFieldValue)),
        govFrontendSummaryListRow(
          cardContent.sexualOrientationLabel,
          nonEmptyStringOrDefault(sexualOrientation, defaultFieldValue),
        ),
        govFrontendSummaryListRow(
          cardContent.transgenderLabel,
          nonEmptyStringOrDefault(transgender, defaultFieldValue),
        ),
      ],
    }
  }

  private buildAddressRow(address: ContactAddress, cardContent: ContactDetailsCard): GovukFrontendSummaryListRow {
    return {
      key: {
        html: `${cardContent.mainAddressLabel}<br>
        <span class="govuk-body-s secondary-text govuk-!-font-weight-regular" style="color: #505a5f;">
                Last updated ${dateFormat(new Date(address.updatedAt))}
              </span>`,
      },
      value: {
        html: `${address.value}<br>
              <p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <span class="govuk-summary-list__key govuk-!-padding-bottom-0">Type of address</span>
                <span>${address.type}</span>
              </p>
              <p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <span class="govuk-summary-list__key govuk-!-padding-bottom-0">Start date</span>
                <span>${dateFormat(new Date(address.startAt))}</span>
              </p>
              <p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <span class="govuk-summary-list__key govuk-!-padding-bottom-0">Notes</span>
                <span>${nonEmptyStringOrDefault(address.notes, 'No notes')}</span>
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
        govFrontendSummaryListRow(
          cardContent.phoneNumberLabel,
          nonEmptyStringOrDefault(phoneNumber, defaultFieldValue),
        ),
        govFrontendSummaryListRow(
          cardContent.mobileNumberLabel,
          nonEmptyStringOrDefault(mobileNumber, defaultFieldValue),
        ),
        govFrontendSummaryListRow(
          cardContent.emailAddressLabel,
          nonEmptyStringOrDefault(emailAddress, defaultFieldValue),
        ),
        this.buildAddressRow(address, cardContent),
      ],
    }
  }

  private getFullName(): string {
    const { firstName, lastName, middleNames } = this.data.personalDetails
    return `${firstName} ${middleNames || ''} ${lastName}`
  }

  buildPageContent(res: Response): ConfirmPersonalDetailsViewModel {
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
      postHref: content.postHref,
    }
  }

  getTemplatePath(): string {
    return 'referral/confirmPersonalDetails'
  }
}

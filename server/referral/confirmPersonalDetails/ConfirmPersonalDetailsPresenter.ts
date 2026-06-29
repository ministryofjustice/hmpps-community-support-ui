import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { ReferralDetailsResponseDto, ReferralUserAssignmentsResponse } from '@community-support-api'
import { differenceInYears } from 'date-fns'
import { MojSubNavigation, MojSubNavigationItem } from '@moj-frontend'
import PresenterBase from '../../presenter/presenterBase'
import dateFormat from '../../utils/dateFormat'
import {
  ConfirmPersonalDetailsContent,
  ConfirmPersonalDetailsViewModel,
  ContactDetailsCard,
  EqualityMonitoringCard,
  PersonalDetailsCard,
} from './ConfirmPersonalDetailsViewModel'
import { govFrontendSummaryListRow, createMailtoLink } from '../../utils/viewUtils'

const nonEmptyStringOrDefault = (str: string | undefined | null, defaultValue: string): string =>
  (str ?? '').trim() || defaultValue

export default class ConfirmPersonalDetailsPresenter extends PresenterBase<
  ConfirmPersonalDetailsViewModel,
  ConfirmPersonalDetailsContent
> {
  private readonly age: number

  constructor(private readonly referralDetails: ReferralDetailsResponseDto) {
    super()
    this.age = differenceInYears(new Date(), new Date(referralDetails.personDetailsTableData.dateOfBirth))
  }

  private buildPersonalDetails(cardContent: PersonalDetailsCard, defaultFieldValue: string): GovukFrontendSummaryList {
    const { personDetailsTableData } = this.referralDetails
    const { name, crn, dateOfBirth, preferredLanguage, disabilities } = personDetailsTableData
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'personal-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.nameLabel, nonEmptyStringOrDefault(name, defaultFieldValue)),
        govFrontendSummaryListRow(cardContent.crnLabel, nonEmptyStringOrDefault(crn, defaultFieldValue)),
        govFrontendSummaryListRow(
          cardContent.dobLabel,
          nonEmptyStringOrDefault(`${dateFormat(new Date(dateOfBirth))} (${this.age} years old)`, defaultFieldValue),
        ),
        govFrontendSummaryListRow(
          cardContent.currentCircumstances,
          nonEmptyStringOrDefault(preferredLanguage, defaultFieldValue),
        ),
        govFrontendSummaryListRow(
          cardContent.disabilitiesLabel,
          nonEmptyStringOrDefault(disabilities, defaultFieldValue),
        ),
      ],
    }
  }

  private buildEqualityDetails(
    cardContent: EqualityMonitoringCard,
    defaultFieldValue: string,
  ): GovukFrontendSummaryList {
    const { equalityDetailsTableData } = this.referralDetails
    const { ethnicity, religionOrBelief, sex, genderIdentity, sexualOrientation, transgender } =
      equalityDetailsTableData
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'equality-details' },
      },
      rows: [
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

  private buildContactDetails(cardContent: ContactDetailsCard, defaultFieldValue: string): GovukFrontendSummaryList {
    const { contactDetailsTableData } = this.referralDetails
    const { address, phoneNumber, mobileNumber, email } = contactDetailsTableData
    const phoneNumberValue = nonEmptyStringOrDefault(phoneNumber, defaultFieldValue)
    const mobileNumberValue = nonEmptyStringOrDefault(mobileNumber, defaultFieldValue)
    const emailValue = nonEmptyStringOrDefault(email, defaultFieldValue)
    const addressValue = nonEmptyStringOrDefault(address, defaultFieldValue)
    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'contact-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.phoneNumberLabel, phoneNumberValue),
        govFrontendSummaryListRow(cardContent.mobileNumberLabel, mobileNumberValue),
        govFrontendSummaryListRow(cardContent.emailAddressLabel, emailValue),
        govFrontendSummaryListRow(cardContent.mainAddressLabel, addressValue),
      ],
    }
  }

  buildPageContent(res: Response): ConfirmPersonalDetailsViewModel {
    const content = this.buildStaticContent(res)
    return {
      name: this.referralDetails.personDetailsTableData.name,
      personal: this.buildPersonalDetails(content.personalDetailsCard, content.defaultFieldValue),
      equality: this.buildEqualityDetails(content.equalityMonitoringCard, content.defaultFieldValue),
      contact: this.buildContactDetails(content.contactDetailsCard, content.defaultFieldValue),
      backLink: { href: '/unassigned-cases' },
    }
  }

  getTemplatePath(): string {
    return 'referral/referralDetails'
  }
}

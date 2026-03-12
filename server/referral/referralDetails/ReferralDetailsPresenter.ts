import { Response } from 'express'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { ReferralDetailsResponseDto } from '@community-support-api'
import { differenceInYears } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import dateFormat from '../../utils/dateFormat'
import {
  ContactDetailsCard,
  EqualityMonitoringCard,
  PersonalDetailsCard,
  ReferralDetailsCard,
  ReferralDetailsContent,
} from './ReferralDetailsViewModel'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'

export interface ReferralDetailsViewModel {
  name: string
  personal: GovukFrontendSummaryList
  equality: GovukFrontendSummaryList
  contact: GovukFrontendSummaryList
  referral: GovukFrontendSummaryList
}

const nonEmptyStringOrDefault = (str: string | undefined | null, defaultValue: string): string =>
  (str ?? '').trim() || defaultValue

export default class ReferralDetailsPresenter extends PresenterBase<ReferralDetailsViewModel> {
  private readonly assignReferalHref: string

  private readonly age: number

  readonly today: Date = new Date()

  constructor(private readonly referralDetails: ReferralDetailsResponseDto) {
    super()
    this.assignReferalHref = `/referral/${referralDetails.id}/assign`
    this.age = differenceInYears(this.today, new Date(referralDetails.personDetailsTableData.dateOfBirth))
  }

  buildStaticContent(res: Response): ReferralDetailsContent {
    const { content } = res.locals
    return content as ReferralDetailsContent
  }

  private buildPersonalDetails(cardContent: PersonalDetailsCard): GovukFrontendSummaryList {
    const { personDetailsTableData } = this.referralDetails
    const { name, CRN, dateOfBirth, preferredLanguage } = personDetailsTableData
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'personal-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.nameLabel, name),
        govFrontendSummaryListRow(cardContent.crnLabel, CRN),
        govFrontendSummaryListRow(cardContent.dobLabel, `${dateFormat(new Date(dateOfBirth))} (${this.age} years old)`),
        govFrontendSummaryListRow(cardContent.languageLabel, preferredLanguage),
        govFrontendSummaryListRow(
          cardContent.disabilitiesLabel,
          this.referralDetails.personDetailsTableData.disabilities,
        ),
      ],
    }
  }

  private buildEqualityDetails(cardContent: EqualityMonitoringCard): GovukFrontendSummaryList {
    const { equalityDetailsTableData } = this.referralDetails
    const { ethnicity, religionOrBelief, sex, genderIdentity, sexualOrientation, transgender } =
      equalityDetailsTableData
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'equality-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.ethnicityLabel, ethnicity),
        govFrontendSummaryListRow(cardContent.religionLabel, religionOrBelief),
        govFrontendSummaryListRow(cardContent.sexLabel, sex),
        govFrontendSummaryListRow(cardContent.genderLabel, genderIdentity),
        govFrontendSummaryListRow(cardContent.sexualOrientationLabel, sexualOrientation),
        govFrontendSummaryListRow(cardContent.transgenderLabel, transgender),
      ],
    }
  }

  private buildContactDetails(cardContent: ContactDetailsCard): GovukFrontendSummaryList {
    const { contactDetailsTableData } = this.referralDetails
    const { address, phoneNumber, mobileNumber, email } = contactDetailsTableData
    const phoneNumberValue = nonEmptyStringOrDefault(phoneNumber, cardContent.phoneNumberDefaultValue)
    const mobileNumberValue = nonEmptyStringOrDefault(mobileNumber, cardContent.mobileNumberDefaultValue)
    const emailValue = nonEmptyStringOrDefault(email, cardContent.emailAddressDefaultValue)
    const addressValue = nonEmptyStringOrDefault(address, cardContent.mainAddressDefaultValue)
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

  private buildReferralDetails(cardContent: ReferralDetailsCard): GovukFrontendSummaryList {
    const { referralDetailsTableData } = this.referralDetails
    const { referralDate, assignedTo } = referralDetailsTableData
    const assignedToArray = assignedTo || []
    const assignedToValue = assignedToArray.length > 0 ? assignedTo.join(', ') : cardContent.assignedToDefaultValue
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'referral-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.referralDateLabel, dateFormat(new Date(referralDate))),
        govFrontendSummaryListRow(cardContent.assignedToLabel, assignedToValue, [
          {
            text: cardContent.link,
            href: this.assignReferalHref,
          },
        ]),
      ],
    }
  }

  buildPageContent(res: Response): ReferralDetailsViewModel {
    const content = this.buildStaticContent(res)
    return {
      name: this.referralDetails.personDetailsTableData.name,
      personal: this.buildPersonalDetails(content.personalDetailsCard),
      equality: this.buildEqualityDetails(content.equalityMonitoringCard),
      contact: this.buildContactDetails(content.contactDetailsCard),
      referral: this.buildReferralDetails(content.referralDetailsCard),
    }
  }

  getTemplatePath(): string {
    return 'referral/referralDetails'
  }
}

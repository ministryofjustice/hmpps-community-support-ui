import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { ReferralDetailsResponseDto, ReferralUserAssignmentsResponse } from '@community-support-api'
import { differenceInYears } from 'date-fns'
import { MojSubNavigation, MojSubNavigationItem } from '@moj-frontend'
import PresenterBase from '../../presenter/presenterBase'
import dateFormat from '../../utils/dateFormat'
import {
  AssignmentSuccessBanner,
  ContactDetailsCard,
  EqualityMonitoringCard,
  PersonalDetailsCard,
  ReferralDetailsCard,
  ReferralDetailsContent,
} from './ReferralDetailsViewModel'
import { govFrontendSummaryListRow, createMailtoLink } from '../../utils/viewUtils'

export interface ReferralDetailsViewModel {
  name: string
  successBanner: AssignmentSuccessBanner | null
  subNav: MojSubNavigation
  personal: GovukFrontendSummaryList
  equality: GovukFrontendSummaryList
  contact: GovukFrontendSummaryList
  referral: GovukFrontendSummaryList
  backLink: GovukFrontendBackLink
}

const nonEmptyStringOrDefault = (str: string | undefined | null, defaultValue: string): string =>
  (str ?? '').trim() || defaultValue

export default class ReferralDetailsPresenter extends PresenterBase<ReferralDetailsViewModel, ReferralDetailsContent> {
  private readonly assignReferalHref: string

  private readonly age: number

  readonly today: Date = new Date()

  constructor(
    private readonly referralDetails: ReferralDetailsResponseDto,
    private readonly assignResult: ReferralUserAssignmentsResponse | null,
  ) {
    super()
    this.assignReferalHref = `/referral/${referralDetails.id}/assign`
    this.age = differenceInYears(this.today, new Date(referralDetails.personDetailsTableData.dateOfBirth))
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
          cardContent.languageLabel,
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

  private buildReferralDetails(cardContent: ReferralDetailsCard, defaultFieldValue: string): GovukFrontendSummaryList {
    const { referralDetailsTableData } = this.referralDetails
    const { referralDate, assignedTo } = referralDetailsTableData
    const assignedToArray = assignedTo || []
    const assignedToListIsPopulated = assignedToArray.length > 0
    const assignedToValue = assignedToListIsPopulated
      ? assignedTo.map(user => createMailtoLink(user.fullName, user.emailAddress)).join('<br>')
      : cardContent.assignedToDefaultValue
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'referral-details' },
      },
      rows: [
        govFrontendSummaryListRow(
          cardContent.referralDateLabel,
          nonEmptyStringOrDefault(dateFormat(new Date(referralDate)), defaultFieldValue),
        ),
        govFrontendSummaryListRow(cardContent.assignedToLabel, assignedToValue, [
          {
            text: assignedToListIsPopulated ? cardContent.linkChange : cardContent.link,
            href: this.assignReferalHref,
          },
        ]),
      ],
    }
  }

  private buildSuccessBanner(heading: string): AssignmentSuccessBanner {
    return {
      successBannerHeading: heading,
      successBannerMessage: this.assignResult.message,
    }
  }

  private buildSubNav(content: ReferralDetailsContent): MojSubNavigation {
    return {
      label: content.subNavTitle,
      items: this.buildSubNavItems(content),
    } as MojSubNavigation
  }

  private buildSubNavItems(content: ReferralDetailsContent): MojSubNavigationItem[] {
    return content.subNavItems.map(i => ({
      text: i.text,
      href: `${i.href}/${this.referralDetails.referenceNumber}`,
      active: i.text === 'Case details',
    }))
  }

  buildPageContent(res: Response): ReferralDetailsViewModel {
    const content = this.buildStaticContent(res)
    return {
      name: this.referralDetails.personDetailsTableData.name,
      subNav: this.buildSubNav(content),
      successBanner: this.assignResult ? this.buildSuccessBanner(content.successBannerHeading) : null,
      personal: this.buildPersonalDetails(content.personalDetailsCard, content.defaultFieldValue),
      equality: this.buildEqualityDetails(content.equalityMonitoringCard, content.defaultFieldValue),
      contact: this.buildContactDetails(content.contactDetailsCard, content.defaultFieldValue),
      referral: this.buildReferralDetails(content.referralDetailsCard, content.defaultFieldValue),
      backLink: { href: '/unassigned-cases' },
    }
  }

  getTemplatePath(): string {
    return 'referral/referralDetails'
  }
}

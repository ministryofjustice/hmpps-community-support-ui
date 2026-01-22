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
    const { name, crn, dateOfBirth, preferredLanguage } = personDetailsTableData
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'personal-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.nameLabel, name),
        govFrontendSummaryListRow(cardContent.crnLabel, crn),
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
    return {
      card: {
        title: {
          text: cardContent.heading,
        },
        attributes: { 'data-testid': 'contact-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.phoneNumberLabel, phoneNumber),
        govFrontendSummaryListRow(cardContent.mobileNumberLabel, mobileNumber),
        govFrontendSummaryListRow(cardContent.emailAddressLabel, email),
        govFrontendSummaryListRow(cardContent.mainAddressLabel, address),
      ],
    }
  }

  private buildReferralDetails(cardContent: ReferralDetailsCard): GovukFrontendSummaryList {
    const { referralDetailsTableData } = this.referralDetails
    const { referralDate, assignedTo } = referralDetailsTableData
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'referral-details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.referralDateLabel, dateFormat(new Date(referralDate))),
        govFrontendSummaryListRow(cardContent.assignedToLabel, assignedTo.join(', '), [
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

  renderPage(res: Response) {
    return res.render(this.getTemplatePath(), {
      content: this.buildPageContent(res),
    })
  }
}

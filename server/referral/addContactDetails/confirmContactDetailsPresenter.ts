import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { Person, UpdateProbationPractitionerDetailsRequest } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ConfirmContactDetailsContent, ConfirmContactDetailsViewModel } from './confirmContactDetailsViewModel'

export default class ConfirmContactDetailsPresenter extends PresenterBase<
  ConfirmContactDetailsViewModel,
  ConfirmContactDetailsContent
> {
  buildViewModel(res: Response) {
    const content = this.buildStaticContent(res)
    return {
      heading: content.heading.replace(
        '{{ personName }}',
        `${this.personalDetails.firstName} ${this.personalDetails.lastName}`,
      ),
      pageCaption: content.pageCaption
        .replace('{{ CRN }}', this.personalDetails.personIdentifier)
        .replace('{{ DOB }}', this.personalDetails.dateOfBirth),
      backLinkArgs: this.generateBackLink(content),
      buttonArgs: this.generateButton(content),
      subHeading: content.subHeading,
      summaryListArgs: this.generateSummaryList(content),
    }
  }

  getTemplatePath(): string {
    return 'referral/confirmContactDetails'
  }

  constructor(
    private readonly personalDetails: Person,
    private readonly ppDetails: UpdateProbationPractitionerDetailsRequest & {
      pduName: string
      probationOfficeName?: string
    },
    readonly isFromPP: boolean | null = false,
  ) {
    super()
  }

  generateBackLink(content: ConfirmContactDetailsContent): GovukFrontendBackLink {
    return {
      text: content.backLinkText,
      href: this.isFromPP ? `${content.backLinkHref}?fromPP=true` : content.backLinkHref,
    }
  }

  generateButton(content: ConfirmContactDetailsContent): GovukFrontendButton {
    return { text: content.buttonText, preventDoubleClick: true }
  }

  generateSummaryList(content: ConfirmContactDetailsContent): GovukFrontendSummaryList {
    return {
      card: {
        title: {
          text: content.summaryHeading,
        },
        actions: {
          items: [
            {
              href: this.isFromPP ? `${content.backLinkHref}?fromPP=true` : content.backLinkHref,
              text: content.changeLabel,
            },
          ],
        },
      },
      rows: [
        {
          key: {
            text: content.nameLabel,
          },
          value: {
            text: this.ppDetails.name,
          },
        },
        {
          key: {
            text: content.jobRoleLabel,
          },
          value: {
            text: this.ppDetails.jobRole !== '' ? this.ppDetails.jobRole : content.notEnteredText,
          },
        },
        {
          key: {
            text: content.emailAddressLabel,
          },
          value: {
            text: this.ppDetails.emailAddress,
          },
        },
        {
          key: {
            text: content.phoneNumberLabel,
          },
          value: {
            text: this.ppDetails.phoneNumber !== '' ? this.ppDetails.phoneNumber : content.notEnteredText,
          },
        },
        {
          key: {
            text: content.pduLabel,
          },
          value: {
            text: this.ppDetails.pduName,
          },
        },
        {
          key: {
            text: content.probationOfficeLabel,
          },
          value: {
            text: this.ppDetails.probationOfficeName ?? content.notEnteredText,
          },
        },
        {
          key: {
            text: content.teamPhoneNumberLabel,
          },
          value: {
            text: this.ppDetails.teamPhoneNumber !== '' ? this.ppDetails.teamPhoneNumber : content.notEnteredText,
          },
        },
      ],
    }
  }
}

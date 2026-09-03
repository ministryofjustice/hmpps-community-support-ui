import PresenterBase from '../../presenter/presenterBase'
import { CheckPPDetailsContent, CheckPPDetailsViewModel } from './checkPPDetailsViewModel'
import { Response } from 'express'
import { Person, ProbationPractitionerDetails } from '@community-support-api'
import { ErrorMiddlewareErrors } from '../../@types/express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendSummaryList,
} from '@govuk-frontend'

export default class CheckPPDetailsPresenter extends PresenterBase<CheckPPDetailsViewModel, CheckPPDetailsContent> {
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
      subHeading: content.subHeading,
      backLinkArgs: this.generateBackLink(content),
      buttonArgs: this.generateButton(content),
      insetText: content.insetText,
      summaryListArgs: this.generateSummaryList(content),
      radioArgs: this.generateRadioButtons(content)
    }
  }

  getTemplatePath(): string {
    return 'referral/checkPPDetails'
  }

  constructor(
    private readonly personalDetails: Person,
    private readonly probationPractitionerDetails: ProbationPractitionerDetails,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  generateBackLink(content: CheckPPDetailsContent): GovukFrontendBackLink {
    return {
      text: content.backLinkText,
      href: content.backLinkHref,
    }
  }

  generateButton(content: CheckPPDetailsContent): GovukFrontendButton {
    return { text: content.buttonText, preventDoubleClick: true }
  }

  generateSummaryList(content: CheckPPDetailsContent):GovukFrontendSummaryList {
    const ppDetails = this.probationPractitionerDetails
    return {
      card: {
        title: {
          text: "Contact details"
        }
      },
      rows: [
        {
          key: {
            text: content.nameLabel
          },
          value: {
            text: ppDetails.name ? ppDetails.name : 'Not available'
          },
        },
        {
          key: {
            text: content.jobRoleLabel
          },
          value: {
            text: ppDetails.jobRole ? ppDetails.jobRole : 'Not available'
          },
        },
        {
          key: {
            text: content.emailAddressLabel
          },
          value: {
            text: ppDetails.emailAddress ? ppDetails.emailAddress : 'Not available'
          },
        },
        {
          key: {
            text: content.pduLabel
          },
          value: {
            text: ppDetails.pdu ? ppDetails.pdu : 'Not available'
          },
        },
        {
          key: {
            text: content.probationOfficeLabel
          },
          value: {
            text: ppDetails.probationOffice ? ppDetails.probationOffice : 'Not available'
          },
        },
        {
          key: {
            text: content.teamPhoneNumberLabel
          },
          value: {
            text: ppDetails.teamPhoneNumber ? ppDetails.teamPhoneNumber : 'Not available'
          },
        }
      ]
    }
  }

  generateRadioButtons(content: CheckPPDetailsContent):GovukFrontendRadios {
    return {
      name: "detailsCorrect",
      fieldset: {
        legend: {
          text: content.radioQuestion,
            isPageHeading: false,
            classes: "govuk-fieldset__legend--m"
        }
      },
      errorMessage: this.validationErrors?.messages.detailsCorrect ?? null,
      items: [
        {
          value: "true",
          text: content.radioYes
        },
        {
          value: "false",
          text: content.radioNo
        }
      ]
    }
  }

}

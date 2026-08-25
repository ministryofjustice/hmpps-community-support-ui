import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendInput,
  GovukFrontendSelect,
  GovukFrontendSelectItem,
} from '@govuk-frontend'
import { Person, type ProbationOffice } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { AddContactDetailsContent, AddContactDetailsViewModel } from './addContactDetailsViewModel'
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class AddContactDetailsPresenter extends PresenterBase<
  AddContactDetailsViewModel,
  AddContactDetailsContent
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
      nameInputArgs: this.generateInputArgs(content.nameInputLabel, 'name'),
      emailInputArgs: this.generateInputArgs(content.emailAddressInputLabel, 'email'),
      jobRoleInputArgs: this.generateInputArgs(content.jobRoleInputLabel, 'jobRole'),
      phoneNumberInputArgs: this.generateInputArgs(content.phoneNumberInputLabel, 'phoneNumber'),
      pduSelectArgs: this.generateSelectArgs(
        content.pduInputLabel,
        content.hintText,
        'pdu',
        this.generateProbationOfficeOptions(),
      ),
      probationOfficeSelectArgs: this.generateSelectArgs(
        content.probationOfficeInputLabel,
        content.hintText,
        'probationOffice',
        this.generateProbationOfficeOptions(),
      ),
      teamPhoneNumberInputArgs: this.generateInputArgs(content.teamPhoneNumberInputLabel, 'teamPhoneNumber'),
      insetText: content.insetText,
    }
  }

  getTemplatePath(): string {
    return 'referral/addContactDetails'
  }

  constructor(
    private readonly personalDetails: Person,
    private readonly probationOffices: ProbationOffice[],
    private readonly validationErrors?: ErrorMiddlewareErrors,
    private readonly userInputData?: any,
  ) {
    super()
  }

  generateBackLink(content: AddContactDetailsContent): GovukFrontendBackLink {
    return {
      text: content.backLinkText,
      href: content.backLinkHref,
    }
  }

  generateButton(content: AddContactDetailsContent): GovukFrontendButton {
    return { text: content.buttonText, preventDoubleClick: true }
  }

  generateProbationOfficeOptions(): GovukFrontendSelectItem[] {
    return [
      { text: '', value: '' },
      ...this.probationOffices.map(office => ({
        text: office.name,
        value: `${office.probationOfficeId}`,
      })),
    ]
  }

  generateInputArgs(labelText: string, id: string): GovukFrontendInput {
    return {
      label: {
        text: labelText,
        classes: 'govuk-label--m ',
        isPageHeading: false,
      },
      id,
      name: id,
      classes: 'govuk-input--width-20',
      errorMessage: this.validationErrors?.messages[id] ?? null,
      value: this.userInputData?.[id] ?? '',
    }
  }

  generateSelectArgs(
    labelText: string,
    hintText: string,
    id: string,
    items: GovukFrontendSelectItem[],
  ): GovukFrontendSelect {
    return {
      id,
      name: id,
      label: {
        text: labelText,
        classes: 'govuk-label--m govuk-!-margin-bottom-0',
        isPageHeading: false,
      },
      hint: { text: hintText },
      items,
      errorMessage: this.validationErrors?.messages[id] ?? null,
      value: this.userInputData?.[id] ?? '',
    }
  }
}

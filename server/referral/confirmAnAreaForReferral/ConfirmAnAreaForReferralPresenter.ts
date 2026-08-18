import { Response } from 'express'
import { Person, AreaConfirmationBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ConfirmAnAreaForReferralContent, ConfirmAnAreaForReferralViewModel } from './ConfirmAnAreaForReferralViewModel'

const nonEmptyStringOrDefault = (str: string | undefined | null, defaultValue: string): string =>
  (str ?? '').trim() || defaultValue

export default class ConfirmAnAreaForReferralPresenter extends PresenterBase<
  ConfirmAnAreaForReferralViewModel,
  ConfirmAnAreaForReferralContent
> {
  constructor(
    private readonly providerDetails: AreaConfirmationBffResponseDto,
    private readonly personDetails: Person,
  ) {
    super()
  }

  private getFullName(): string {
    const { firstName, lastName } = this.personDetails
    return `${firstName} ${lastName}`
  }

  buildViewModel(res: Response): ConfirmAnAreaForReferralViewModel {
    const content = this.buildStaticContent(res)
    const crn = nonEmptyStringOrDefault(this.personDetails.personIdentifier, content.defaultFieldValue)
    const dateOfBirth = nonEmptyStringOrDefault(this.personDetails.dateOfBirth, content.defaultFieldValue)

    return {
      backLink: { href: content.backLink },
      heading: this.getFullName(),
      pageCaption: content.pageCaption.replace('{{ CRN }}', crn).replace('{{ DOB }}', dateOfBirth),
      submitHref: '/referral/task-list/confirm-an-area-for-referral',
      card: {
        heading: content.cardHeading,
        primaryAction: { text: content.buttonText },
        secondaryAction: {
          text: content.selectDifferentAreaText,
          href: content.selectDifferentAreaHref,
          style: 'link',
        },
      },
      deliveryPartnerLabel: content.deliveryPartnerLabel,
      deliveryPartner: nonEmptyStringOrDefault(this.providerDetails.deliveryPartner, content.defaultFieldValue),
      areaCoveredLabel: content.areaCoveredLabel,
      areaCovered: nonEmptyStringOrDefault(this.providerDetails.contractArea, content.defaultFieldValue),
      pdusLabel: content.pdusLabel,
      pdus: this.providerDetails.associatedPdus ?? [],
    }
  }

  getTemplatePath(): string {
    return 'referral/confirmAnAreaForReferral'
  }
}

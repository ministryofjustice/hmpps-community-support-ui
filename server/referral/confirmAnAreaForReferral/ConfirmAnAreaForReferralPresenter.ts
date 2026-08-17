import { Response } from 'express'
import { differenceInYears } from 'date-fns'
import { Person, AreaConfirmationBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import dateFormat from '../../utils/dateFormat'
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
    private readonly providerId: string,
  ) {
    super()
  }

  private getFullName(): string {
    const { firstName, lastName } = this.personDetails
    return `${firstName} ${lastName}`
  }

  buildViewModel(res: Response): ConfirmAnAreaForReferralViewModel {
    const content = this.buildStaticContent(res)
    const { crn, dateOfBirth } = this.providerDetails
    const dobDate = new Date(dateOfBirth)
    const age = differenceInYears(new Date(), dobDate)

    return {
      backLink: { href: content.backLink },
      heading: this.getFullName(),
      crnLabel: content.crnLabel,
      crn: nonEmptyStringOrDefault(crn, content.defaultFieldValue),
      dateOfBirthLabel: content.dateOfBirthLabel,
      dateOfBirth: `${dateFormat(dobDate)} (${age} years old)`,
      submitHref: `/referral/task-list/confirm-an-area-for-referral/${this.providerId}`,
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

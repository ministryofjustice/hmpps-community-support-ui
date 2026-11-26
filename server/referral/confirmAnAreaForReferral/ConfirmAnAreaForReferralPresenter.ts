import { Person, AreaConfirmationBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ConfirmAnAreaForReferralViewModel } from './ConfirmAnAreaForReferralViewModel'
import { trimOrDefault } from '../../utils/utils'
import formatFullName from '../../utils/presenterFormatters'

export default class ConfirmAnAreaForReferralPresenter extends PresenterBase<ConfirmAnAreaForReferralViewModel> {
  constructor(
    private readonly providerDetails: AreaConfirmationBffResponseDto,
    private readonly personDetails: Person,
  ) {
    super()
  }

  private getFullName(): string {
    const { firstName, lastName } = this.personDetails
    return formatFullName(firstName, lastName)
  }

  buildViewModel(): ConfirmAnAreaForReferralViewModel {
    const content = this.globalContent().referral.taskList.confirmAnAreaForReferral
    const crn = trimOrDefault(this.personDetails.personIdentifier, content.defaultFieldValue)
    const dateOfBirth = trimOrDefault(this.personDetails.dateOfBirth, content.defaultFieldValue)
    const areaCovered = trimOrDefault(this.providerDetails.contractArea, content.defaultFieldValue)

    return {
      backLink: { href: content.backLink },
      pageTitle: content.pageTitle.replace('{{ areaName }}', areaCovered),
      heading: this.getFullName(),
      pageCaption: content.pageCaption.replace('{{ CRN }}', crn).replace('{{ DOB }}', dateOfBirth),
      submitHref: '/referral/task-list/confirm-an-area-for-referral',
      card: {
        heading: content.cardHeading.replace('{{ areaName }}', areaCovered),
        primaryAction: { text: content.buttonText },
        secondaryAction: {
          text: content.selectDifferentAreaText,
          href: content.selectDifferentAreaHref,
          style: 'link',
        },
      },
      deliveryPartnerLabel: content.deliveryPartnerLabel,
      deliveryPartner: trimOrDefault(this.providerDetails.deliveryPartner, content.defaultFieldValue),
      pdusLabel: content.pdusLabel,
      pdus: this.providerDetails.associatedPdus ?? [],
    }
  }

  getTemplatePath(): string {
    return 'referral/confirmAnAreaForReferral'
  }
}

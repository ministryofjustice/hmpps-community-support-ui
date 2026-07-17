import { AppointmentIcsResponse } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { ViewChangeSessionDetailsViewModel } from './viewChangeSessionDetailsViewModel'
import dateFormat from '../../utils/dateFormat'
import timeFormat from '../../utils/timeFormat'
import { buildIcsSummaryRows, formatAddress } from '../icsDetailsSummaryBuilder'

type SessionMethodType = AppointmentIcsResponse['sessionMethod']['type']

const SESSION_METHOD_DISPLAY: Record<string, string> = {
  PHONE: 'Phone call',
  VIDEO: 'Video call',
  IN_PERSON_PROBATION_OFFICE: 'In person',
  IN_PERSON_OTHER_LOCATION: 'Other location',
  IN_PERSON_PRISON_ESTABLISMENT: 'In person',
}

const SESSION_COMMUNICATION_DISPLAY: Record<string, string> = {
  Phone: 'Phone call',
  Text: 'Text message',
  Email: 'Email',
}

const VIRTUAL_TYPES = new Set<string>(['PHONE', 'VIDEO'])
const IN_PERSON_PREFIX = 'IN_PERSON'

export default class ViewChangeSessionDetailsPresenter extends PresenterBase<
  ViewChangeSessionDetailsViewModel,
  object
> {
  constructor(
    private readonly appointmentIcsResponse: AppointmentIcsResponse,
    private readonly referralId: string,
    private readonly icsId: string,
  ) {
    super()
  }

  buildViewModel(_res: Response): ViewChangeSessionDetailsViewModel {
    return {
      pageHeader: 'View session details',
      backLink: { href: `/progress/${this.referralId}` },
      icsDetailsSummary: this.buildIcsDetailsSummary(),
    }
  }

  getTemplatePath(): string {
    return 'appointment/viewChangeSessionDetails'
  }

  private formatSessionMethod(type: SessionMethodType): string {
    return SESSION_METHOD_DISPLAY[type] ?? type
  }

  private formatSessionCommunication(input: string): string {
    return SESSION_COMMUNICATION_DISPLAY[input] ?? input
  }

  private isVirtualSession(type: SessionMethodType): boolean {
    return VIRTUAL_TYPES.has(type)
  }

  private isInPersonSession(type: SessionMethodType): boolean {
    return type.startsWith(IN_PERSON_PREFIX)
  }

  private buildIcsDetailsSummary(): GovukFrontendSummaryList {
    const { appointmentDate, appointmentTime, sessionMethod, sessionCommunications, referralFirstName } =
      this.appointmentIcsResponse

    const sessionType = sessionMethod.type as SessionMethodType
    const isVirtual = this.isVirtualSession(sessionType)
    const isInPerson = this.isInPersonSession(sessionType)

    const { whyNotInPersonReason } = sessionMethod as { whyNotInPersonReason?: string | null }

    let locationValue: { text: string } | { html: string } | undefined
    if (isInPerson) {
      locationValue =
        sessionType === 'IN_PERSON_PROBATION_OFFICE'
          ? { text: 'Probation office' }
          : {
              html: formatAddress(
                sessionMethod as {
                  addressLine1?: string | null
                  addressLine2?: string | null
                  townOrCity?: string | null
                  county?: string | null
                  postcode?: string | null
                },
              ),
            }
    }

    const rows = buildIcsSummaryRows({
      formattedDate: dateFormat(new Date(appointmentDate)),
      formattedTime: timeFormat(appointmentTime),
      methodDisplay: this.formatSessionMethod(sessionType),
      reason: isVirtual ? whyNotInPersonReason : null,
      locationValue,
      personFirstName: referralFirstName,
      communicationsDisplay: sessionCommunications.map(c => this.formatSessionCommunication(c)).join(', '),
    })

    return {
      card: {
        title: { text: 'ICS details' },
      },
      rows,
    }
  }
}

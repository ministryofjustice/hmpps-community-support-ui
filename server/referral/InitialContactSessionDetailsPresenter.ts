import { Response } from 'express'
import {
  GovukFrontendSummaryList,
  GovukFrontendBackLink,
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListCardActions,
} from '@govuk-frontend'
import { AppointmentIcsResponse } from '@community-support-api'
import nunjucks from 'nunjucks'
import PresenterBase from '../presenter/presenterBase'
import dateFormat from '../utils/dateFormat'
import timeFormat from '../utils/timeFormat'
import { govFrontendSummaryListRow } from '../utils/viewUtils'

export interface InitialContactSessionDetailsViewModel {
  backLink: GovukFrontendBackLink
  title: string
  heading: string
  icsDetails: GovukFrontendSummaryList
  historical: boolean
  reasonForChange: GovukFrontendSummaryList
}

interface IcsDetailsCard {
  heading: string
  changeLink: string
  dateLabel: string
  startTimeLabel: string
  methodLabel: string
  reasonLabel: string
  locationLabel: string
  informedLabel: string
}

interface ReasonForChangeCard {
  heading: string
  whoRequestedLabel: string
  reasonLabel: string
}

interface Links {
  change: string
  back: string
}

export interface InitialContactSessionDetailsContent {
  title: string
  heading: string
  icsDetails: IcsDetailsCard
  reasonForChange: ReasonForChangeCard
  links: Links
}

const locationFields: string[] = [
  'probationOfficeName',
  'addressLine1',
  'addressLine2',
  'townOrCity',
  'county',
  'postcode',
] as const

type SessionType =
  | 'IN_PERSON_PROBATION_OFFICE'
  | 'IN_PERSON_OTHER_LOCATION'
  | 'IN_PERSON_PRISON_ESTABLISMENT'
  | 'PHONE'
  | 'VIDEO'

const showSessionType = (sessionType: SessionType): string => {
  switch (sessionType) {
    case 'IN_PERSON_PROBATION_OFFICE':
      return 'In person - probation office'
    case 'IN_PERSON_OTHER_LOCATION':
      return 'In person - somewhere else'
    case 'IN_PERSON_PRISON_ESTABLISMENT':
      return 'In person - prison establishment'
    case 'PHONE':
      return 'Phone call'
    case 'VIDEO':
      return 'Video call'
    default:
      return ''
  }
}

const showSessionCommunication = (communication: string): string => {
  switch (communication) {
    case 'Phone':
      return 'Phone call'
    case 'Text':
      return 'Text message'
    default:
      return communication
  }
}

export default class InitialContactSessionDetailsPresenter extends PresenterBase<
  InitialContactSessionDetailsViewModel,
  InitialContactSessionDetailsContent
> {
  private readonly firstName: string

  private readonly lastName: string

  private readonly date: string

  private readonly time: string

  private readonly reason?: string

  private readonly locationLine: string

  private readonly sessionType: SessionType

  private readonly sessionCommunication: string

  private readonly changeRequestedBy?: string

  private readonly reasonForChange?: string

  constructor(
    {
      referralFirstName,
      referralLastName,
      appointmentDate,
      appointmentTime,
      sessionMethod,
      sessionCommunications,
      changeAppointmentDetails,
    }: AppointmentIcsResponse,
    private readonly caseRef: string,
    private readonly historical: boolean = false,
  ) {
    super()
    this.firstName = referralFirstName
    this.lastName = referralLastName
    this.date = appointmentDate
    this.time = timeFormat(appointmentTime)
    this.reason = sessionMethod.whyNotInPersonReason
    this.sessionType = sessionMethod.type
    this.sessionCommunication = `<ul class="govuk-list">
    ${sessionCommunications.map(str => `<li>${showSessionCommunication(str)}</li>`).join(`\n`)}
    </ul>`

    const sessionMethodKeys = Object.keys(sessionMethod)
    this.locationLine = locationFields
      .filter(field => sessionMethodKeys.includes(field))
      .map(field => sessionMethod[field])
      .map(str => (str ? `<p>${str}</p>` : ''))
      .join('\n')

    if (changeAppointmentDetails) {
      switch (changeAppointmentDetails.changeRequestedBy) {
        case 'DELIVERY_PARTNER':
          this.changeRequestedBy = 'Delivery partner'
          break
        case 'PROBATION_PRACTITIONER':
          this.changeRequestedBy = 'Probation practitioner'
          break
        case 'REFERRAL_USER':
          this.changeRequestedBy = `${this.firstName} ${this.lastName}`
          break
        default:
          break
      }
      this.reasonForChange = changeAppointmentDetails.reasonForChange
    }
  }

  private buildReasonRow(label: string): GovukFrontendSummaryListRow[] {
    return this.reason ? [govFrontendSummaryListRow(label, this.reason)] : []
  }

  private buildLocationRow(label: string): GovukFrontendSummaryListRow[] {
    return this.locationLine
      ? [
          govFrontendSummaryListRow(label, {
            html: this.locationLine,
          }),
        ]
      : []
  }

  private buildIcsDetails(cardContent: IcsDetailsCard, changeLink: string, name: string): GovukFrontendSummaryList {
    const informedLabel = nunjucks.renderString(cardContent.informedLabel, { name })
    const actions: GovukFrontendSummaryListCardActions = this.historical
      ? {}
      : { items: [{ href: changeLink, text: cardContent.changeLink }] }
    return {
      card: {
        title: { text: cardContent.heading },
        actions,
        attributes: { 'data-testid': 'details' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.dateLabel, dateFormat(new Date(this.date))),
        govFrontendSummaryListRow(cardContent.startTimeLabel, this.time),
        govFrontendSummaryListRow(cardContent.methodLabel, showSessionType(this.sessionType)),
      ]
        .concat(this.buildReasonRow(cardContent.reasonLabel))
        .concat(this.buildLocationRow(cardContent.locationLabel))
        .concat([govFrontendSummaryListRow(informedLabel, { html: this.sessionCommunication })]),
    }
  }

  private buildReasonForChange(cardContent: ReasonForChangeCard): GovukFrontendSummaryList {
    return {
      card: {
        title: { text: cardContent.heading },
        attributes: { 'data-testid': 'reasonForChange' },
      },
      rows: [
        govFrontendSummaryListRow(cardContent.whoRequestedLabel, this.changeRequestedBy),
        govFrontendSummaryListRow(cardContent.reasonLabel, this.reasonForChange),
      ],
    }
  }

  buildViewModel(res: Response): InitialContactSessionDetailsViewModel {
    const content = this.buildStaticContent(res)
    return {
      title: content.title,
      heading: content.heading,
      icsDetails: this.buildIcsDetails(
        content.icsDetails,
        content.links.change.replace('{{ id }}', this.caseRef),
        this.firstName,
      ),
      historical: this.historical,
      reasonForChange: this.buildReasonForChange(content.reasonForChange),
      backLink: { href: content.links.back.replace('{{ id }}', this.caseRef) },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/initialContactSessionDetails'
  }
}

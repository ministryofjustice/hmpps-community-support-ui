import { Response } from 'express'
import { GovukFrontendSummaryList, GovukFrontendBackLink, GovukFrontendSummaryListRow } from '@govuk-frontend'
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
  details: GovukFrontendSummaryList
}

interface DetailsCard {
  heading: string
  changeLink: string
  dateLabel: string
  startTimeLabel: string
  methodLabel: string
  reasonLabel: string
  locationLabel: string
  informedLabel: string
}

interface Links {
  change: string
  back: string
}

export interface InitialContactSessionDetailsContent {
  title: string
  heading: string
  details: DetailsCard
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
  private readonly name: string

  private readonly date: string

  private readonly time: string

  private readonly reason?: string

  private readonly locationLine: string

  private readonly sessionType: SessionType

  private readonly sessionCommunication: string

  constructor(
    {
      referralFirstName,
      appointmentDate,
      appointmentTime,
      sessionMethod,
      sessionCommunications,
    }: AppointmentIcsResponse,
    private readonly caseRef: string,
  ) {
    super()
    this.name = referralFirstName
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

  private buildDetails(cardContent: DetailsCard, changeLink: string, name: string): GovukFrontendSummaryList {
    const informedLabel = nunjucks.renderString(cardContent.informedLabel, { name })
    return {
      card: {
        title: { text: cardContent.heading },
        actions: {
          items: [
            {
              href: changeLink,
              text: cardContent.changeLink,
            },
          ],
        },
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

  buildPageContent(res: Response): InitialContactSessionDetailsViewModel {
    const content = this.buildStaticContent(res)
    return {
      title: content.title,
      heading: content.heading,
      details: this.buildDetails(content.details, content.links.change.replace('{{ id }}', this.caseRef), this.name),
      backLink: { href: content.links.back.replace('{{ id }}', this.caseRef) },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/initialContactSessionDetails'
  }
}

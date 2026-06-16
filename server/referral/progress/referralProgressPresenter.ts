import { Response } from 'express'
import {
  GovukFrontendNotificationBanner,
  GovukFrontendTable,
  GovukFrontendTableHeadElement,
  GovukFrontendTableRow,
} from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'
import { ReferralProgress, ReferralAppointmentHistory } from '@community-support-api'

import { formatDate, isPast } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import { ReferralProgressContent, ReferralProgressViewModel } from './referralProgressViewModel'
import { ReferralProgressBannerContent } from './ReferralProgressBannerContent'

type TabKey = 'caseDetails' | 'progress' | 'changeLog'
type StatusKey = ReferralAppointmentHistory['status'] | 'NOT_SCHEDULED'
type StatusConfig = { label: string; tagClass: string; actions: { label: string; href: string }[] }

const getStatusConfig = (
  caseReference: string,
  appointmentIcsId: string,
  isCurrent: boolean = false,
  rowIndex: string = '',
): Record<StatusKey, StatusConfig> => {
  const rescheduleActions = isCurrent
    ? [
        { label: 'Reschedule', href: `/referral/${caseReference}/appointment/schedule-ics` },
        { label: 'View feedback', href: `/ics-feedback/${caseReference}/session/${rowIndex}` },
      ]
    : [{ label: 'View feedback', href: `/ics-feedback/${caseReference}/session/${rowIndex}` }]
  return {
    NOT_SCHEDULED: {
      label: 'Not scheduled',
      tagClass: 'govuk-tag--grey',
      actions: [{ label: 'Schedule session', href: `/referral/${caseReference}/appointment/schedule-ics` }],
    },
    SCHEDULED: {
      label: 'Scheduled',
      tagClass: 'govuk-tag--blue',
      actions: [{ label: 'View or change details', href: `/referral-details/${caseReference}/ics-view-or-change` }],
    },
    NEEDS_FEEDBACK: {
      label: 'Needs feedback',
      tagClass: 'govuk-tag--red',
      actions: [{ label: 'Add attendance and feedback', href: `/ics-feedback/${caseReference}/attendance` }],
    },
    DID_NOT_HAPPEN: {
      label: 'Did not happen',
      tagClass: 'govuk-tag--purple',
      actions: rescheduleActions,
    },
    DID_NOT_ATTEND: {
      label: 'Did not attend',
      tagClass: 'govuk-tag--purple',
      actions: rescheduleActions,
    },
    CHANGED: {
      label: 'Changed',
      tagClass: 'govuk-tag--red',
      actions: [
        {
          label: 'View session details',
          href: `/referral-details/${caseReference}/changed-ics-details/${appointmentIcsId}`,
        },
      ],
    },
    COMPLETED: {
      label: 'Completed',
      tagClass: 'govuk-tag--green',
      actions: [{ label: 'View feedback', href: `/ics-feedback/${caseReference}/session/${rowIndex}` }],
    },
  }
}

type AppointmentStatus = ReferralAppointmentHistory['status']
const getAppointmentStatus = ({ status, dateTime }: ReferralAppointmentHistory): AppointmentStatus => {
  if (status !== 'SCHEDULED') {
    return status
  }
  return isPast(dateTime) ? 'NEEDS_FEEDBACK' : status
}

export default class ReferralProgressPresenter extends PresenterBase<
  ReferralProgressViewModel,
  ReferralProgressContent
> {
  private readonly name: string

  private readonly tabPaths: Record<TabKey, string>

  constructor(
    private readonly referralProgress: ReferralProgress,
    private readonly caseReference: string,
    private readonly bannerContent?: ReferralProgressBannerContent,
  ) {
    super()
    this.name = referralProgress.fullName
    this.tabPaths = {
      caseDetails: `/referral-details/${this.caseReference}`,
      progress: `/progress/${this.caseReference}`,
      changeLog: '#',
    }
  }

  buildPageContent(res: Response): ReferralProgressViewModel {
    const content = this.buildStaticContent(res)
    const [latestAppointment] = this.getAppointments()

    return {
      pageHeader: `${content.pageHeader} ${this.name}`,
      navBar: this.buildSubNav(content),
      actionLinkHref: '#',
      backLink: { href: '/cases-in-progress' },
      notificationBanner: this.getNotificationBanner(),
      icsAppointmentTable: this.buildIcsAppointmentTable(content, !!latestAppointment),
      historySummary: content.historySummary,
      icsAppointmentHistoryTable: this.buildIcsAppointmentHistoryTable(content),
    }
  }

  private buildSuccessBanner(heading: string, body: string): GovukFrontendNotificationBanner {
    const hasBody = body && body.trim() !== ''

    return {
      type: 'success',
      html: `
        <h3 class="govuk-notification-banner__heading">${heading}</h3>
        ${hasBody ? `<p class="govuk-body">${body}</p>` : ''}
      `,
    }
  }

  private getNotificationBanner(): GovukFrontendNotificationBanner | undefined {
    if (this.bannerContent?.caseReference !== this.caseReference) return undefined

    return this.buildSuccessBanner(this.bannerContent.heading, this.bannerContent.body)
  }

  protected getTemplatePath(): string {
    return 'referral/progress'
  }

  private buildSubNav(content: ReferralProgressContent): MojSubNavigation {
    return {
      label: content.progressSubNavTitle,
      items: this.buildSubNavItems(content),
    }
  }

  private buildSubNavItems(content: ReferralProgressContent) {
    return Object.keys(this.tabPaths).map(tabKey => ({
      text: content.subNavItems.find(i => i.id === tabKey)?.title ?? tabKey,
      href: this.tabPaths[tabKey as TabKey],
      active: tabKey === 'progress',
    }))
  }

  private buildIcsAppointmentTable(content: ReferralProgressContent, hasAppointment: boolean): GovukFrontendTable {
    const headers = hasAppointment ? content.progressActiveColumnHeaders : content.progressInactiveColumnHeaders

    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': 'referral-progress-table',
      },
      head: this.buildIcsAppointmentColumnHeaders(headers),
      rows: hasAppointment ? this.buildInProgressTableRow() : this.buildNotScheduledRow(),
    }
  }

  private buildIcsAppointmentHistoryTable(content: ReferralProgressContent): GovukFrontendTable {
    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': 'referral-history-table',
      },
      head: this.buildIcsAppointmentColumnHeaders(content.progressActiveColumnHeaders),
      rows: this.buildAppointmentHistoryTableRows(),
    }
  }

  private buildIcsAppointmentColumnHeaders(items: string[]): GovukFrontendTableHeadElement[] {
    return items.map(header => ({ text: header }))
  }

  private buildNotScheduledRow(): GovukFrontendTableRow[] {
    const configMap = getStatusConfig(this.caseReference, '')
    const config = configMap.NOT_SCHEDULED
    return [
      [
        { html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` },
        { html: this.renderActions(config.actions) },
      ],
    ]
  }

  private buildProgressTableRow(row: ReferralAppointmentHistory, isCurrent: boolean = false): GovukFrontendTableRow {
    const configMap = getStatusConfig(this.caseReference, row.appointmentIcsId, isCurrent)
    const appointementStatus = getAppointmentStatus(row)
    const config = configMap[appointementStatus] ?? configMap.NOT_SCHEDULED

    return [
      { text: formatDate(row.dateTime, "dd MMMM yyyy 'at' h:mmaaa") },
      { html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` },
      { html: this.renderActions(config.actions) },
    ]
  }

  private buildInProgressTableRow(): GovukFrontendTableRow[] {
    const [current] = this.getAppointments()
    return [this.buildProgressTableRow(current, true)]
  }

  private buildAppointmentHistoryTableRows(): GovukFrontendTableRow[] {
    const [, ...history] = this.getAppointments()

    return history.map(appointment => {
      return this.buildProgressTableRow(appointment)
    })
  }

  private renderActions(actions: { label: string; href: string }[]): string {
    return `
      <ul class="govuk-list govuk-!-margin-0">
        ${actions.map(a => `<li><a href="${a.href}" class="govuk-link">${a.label}</a></li>`).join('')}
      </ul>
    `
  }

  private getAppointments(): ReferralAppointmentHistory[] {
    const appointments = new Map<string, ReferralAppointmentHistory>()

    for (const appt of this.referralProgress.appointments ?? []) {
      const key = appt.appointmentIcsId ?? `unknown-${appt.dateTime}`
      appointments.set(key, appt)
    }

    return [...appointments.values()]
  }
}

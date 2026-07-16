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
import type { AuthSource } from '../../interfaces/hmppsUser'

type TabKey = 'caseDetails' | 'progress' | 'changeLog'
type StatusKey = ReferralAppointmentHistory['status'] | 'NOT_SCHEDULED'
type StatusConfig = { label: string; tagClass: string; actions: { label: string; href: string }[] }

const getStatusConfig = (
  caseReference: string,
  appointmentIcsId: string = '',
  icsFeedbackId: string = '',
  isCurrent: boolean = false,
  authSource?: AuthSource,
): Record<StatusKey, StatusConfig> => {
  const isProbationPractitioner = authSource === 'delius'
  const rescheduleActions = isProbationPractitioner
    ? [{ label: 'View feedback', href: `/ics-feedback/${caseReference}/session/${icsFeedbackId}` }]
    : buildRescheduleActions(caseReference, appointmentIcsId, icsFeedbackId, isCurrent)
  return {
    NOT_SCHEDULED: {
      label: 'Not scheduled',
      tagClass: 'govuk-tag--grey',
      actions: isProbationPractitioner
        ? []
        : [{ label: 'Schedule session', href: `/referral/${caseReference}/appointment/schedule-ics` }],
    },
    SCHEDULED: {
      label: 'Scheduled',
      tagClass: 'govuk-tag--blue',
      actions: isProbationPractitioner
        ? []
        : [{ label: 'View or change details', href: `/referral-details/${caseReference}/ics-view-or-change` }],
    },
    NEEDS_FEEDBACK: {
      label: 'Needs feedback',
      tagClass: 'govuk-tag--red',
      actions: isProbationPractitioner
        ? []
        : [{ label: 'Add attendance and feedback', href: `/ics-feedback/${caseReference}/attendance` }],
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
      actions: [{ label: 'View feedback', href: `/ics-feedback/${caseReference}/session/${icsFeedbackId}` }],
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

const buildRescheduleActions = (
  caseReference: string,
  appointmentIcsId: string,
  icsFeedbackId: string,
  isCurrent: boolean,
) => {
  return isCurrent
    ? [
        { label: 'Reschedule', href: `/referral/${caseReference}/appointment/schedule-ics` },
        { label: 'View feedback', href: `/ics-feedback/${caseReference}/session/${icsFeedbackId}` },
      ]
    : [{ label: 'View feedback', href: `/ics-feedback/${caseReference}/session/${icsFeedbackId}` }]
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
    private readonly authSource?: AuthSource,
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
    const showActions = this.currentRowActions(hasAppointment).length > 0

    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': 'referral-progress-table',
      },
      head: this.buildIcsAppointmentColumnHeaders(this.tableHeaders(headers, showActions)),
      rows: hasAppointment ? this.buildInProgressTableRow(showActions) : this.buildNotScheduledRow(showActions),
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

  private buildNotScheduledRow(showActions: boolean): GovukFrontendTableRow[] {
    const configMap = getStatusConfig(this.caseReference, '', '', false, this.authSource)
    const config = configMap.NOT_SCHEDULED
    const row: GovukFrontendTableRow = [{ html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` }]

    if (showActions) {
      row.push({ html: this.renderActions(config.actions) })
    }

    return [row]
  }

  private buildProgressTableRow(
    row: ReferralAppointmentHistory,
    showActions: boolean,
    isCurrent = false,
  ): GovukFrontendTableRow {
    const configMap = getStatusConfig(
      this.caseReference,
      row.appointmentIcsId,
      row.icsFeedbackId ?? '',
      isCurrent,
      this.authSource,
    )
    const appointementStatus = getAppointmentStatus(row)
    const config = configMap[appointementStatus] ?? configMap.NOT_SCHEDULED

    const tableRow: GovukFrontendTableRow = [
      { text: formatDate(row.dateTime, "dd MMMM yyyy 'at' h:mmaaa") },
      { html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` },
    ]

    if (showActions) {
      tableRow.push({ html: this.renderActions(config.actions) })
    }

    return tableRow
  }

  private buildInProgressTableRow(showActions: boolean): GovukFrontendTableRow[] {
    const [current] = this.getAppointments()
    return [this.buildProgressTableRow(current, showActions, true)]
  }

  private buildAppointmentHistoryTableRows(): GovukFrontendTableRow[] {
    const [, ...history] = this.getAppointments()

    return history.map(appointment => {
      return this.buildProgressTableRow(appointment, true, false)
    })
  }

  private tableHeaders(items: string[], showActions: boolean): string[] {
    if (showActions) {
      return items
    }

    return items.filter(header => header !== 'Action')
  }

  private currentRowActions(hasAppointment: boolean): { label: string; href: string }[] {
    const configMap = getStatusConfig(this.caseReference, '', '', false, this.authSource)

    if (!hasAppointment) {
      return configMap.NOT_SCHEDULED.actions
    }

    const [current] = this.getAppointments()
    const currentStatus = getAppointmentStatus(current)
    const statusConfig = getStatusConfig(
      this.caseReference,
      current.appointmentIcsId,
      current.icsFeedbackId ?? '',
      true,
      this.authSource,
    )
    return (statusConfig[currentStatus] ?? statusConfig.NOT_SCHEDULED).actions
  }

  private renderActions(actions: { label: string; href: string }[]): string {
    if (!actions.length) {
      return ''
    }

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
      const existing = appointments.get(key)
      if (!existing || appt.dateTime > existing.dateTime) {
        appointments.set(key, appt)
      }
    }

    return [...appointments.values()]
  }
}

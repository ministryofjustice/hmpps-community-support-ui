import { Response } from 'express'
import {
  GovukFrontendNotificationBanner,
  GovukFrontendTable,
  GovukFrontendTableHeadElement,
  GovukFrontendTableRow,
} from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'
import { ReferralProgress, ReferralAppointmentHistory } from '@community-support-api'

import { isPast } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import { ReferralProgressContent, ReferralProgressViewModel } from './referralProgressViewModel'
import { ReferralProgressBannerContent } from './ReferralProgressBannerContent'

type TabKey = 'caseDetails' | 'progress' | 'changeLog'
type StatusKey = ReferralAppointmentHistory['status'] | 'NOT_SCHEDULED'
type StatusConfig = { label: string; tagClass: string; actions: { label: string; href: string }[] }

const getStatusConfig = (caseReference: string, appointmentId: string = ''): Record<StatusKey, StatusConfig> => ({
  NOT_SCHEDULED: {
    label: 'Not scheduled',
    tagClass: 'govuk-tag--grey',
    actions: [{ label: 'Schedule session', href: `/referral/${caseReference}/appointment/schedule-ics` }],
  },
  SCHEDULED: {
    label: 'Scheduled',
    tagClass: 'govuk-tag--blue',
    actions: [{ label: 'View details', href: `/referral/${caseReference}/ics/${appointmentId}/view-session-details` }],
  },
  NEEDS_FEEDBACK: {
    label: 'Needs feedback',
    tagClass: 'govuk-tag--red',
    actions: [{ label: 'Add attendance and feedback', href: `/ics-feedback/${caseReference}/attendance` }],
  },
  DID_NOT_HAPPEN: {
    label: 'Did not happen',
    tagClass: 'govuk-tag--purple',
    actions: [
      { label: 'Reschedule', href: '#' },
      { label: 'View feedback', href: '#' },
    ],
  },
  DID_NOT_ATTEND: {
    label: 'Did not attend',
    tagClass: 'govuk-tag--purple',
    actions: [
      { label: 'Reschedule', href: '#' },
      { label: 'View feedback', href: '#' },
    ],
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    tagClass: 'govuk-tag--grey',
    actions: [{ label: 'View or change details', href: `/referral/${caseReference}/ics/${appointmentId}` }],
  },
  COMPLETED: {
    label: 'Completed',
    tagClass: 'govuk-tag--green',
    actions: [{ label: 'View feedback', href: '#' }],
  },
})

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
    const [latestAppointment] = this.getLatestAppointments()

    return {
      pageHeader: `${content.pageHeader} ${this.name}`,
      navBar: this.buildSubNav(content),
      actionLinkHref: '#',
      backLink: { href: '/cases-in-progress' },
      notificationBanner: this.getNotificationBanner(),
      icsAppointmentTable: this.buildIcsAppointmentTable(content, !!latestAppointment),
    }
  }

  private formatAppointmentDateTime(date: string): string {
    const [datePart, timePart] = date.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)

    const parsedDate = new Date(year, month - 1, day, hour, minute)

    const formattedDate = parsedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const formattedTime = parsedDate
      .toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(' ', '')
      .toLowerCase()

    return `${formattedDate} at ${formattedTime}`
  }

  private buildSuccessBanner(heading: string, body: string): GovukFrontendNotificationBanner {
    return {
      type: 'success',
      html: `
        <h3 class="govuk-notification-banner__heading">${heading}</h3>
        <p class="govuk-body">${body}</p>
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
      rows: hasAppointment ? this.buildInProgressTableRows() : this.buildNotScheduledRow(),
    }
  }

  private buildIcsAppointmentColumnHeaders(items: string[]): GovukFrontendTableHeadElement[] {
    return items.map(header => ({ text: header }))
  }

  private buildNotScheduledRow(): GovukFrontendTableRow[] {
    const configMap = getStatusConfig(this.caseReference)
    const config = configMap.NOT_SCHEDULED
    return [
      [
        { html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` },
        { html: this.renderActions(config.actions) },
      ],
    ]
  }

  private buildInProgressTableRows(): GovukFrontendTableRow[] {
    const latestAppointments = this.getLatestAppointments()

    return latestAppointments.map(appointment => {
      const configMap = getStatusConfig(this.caseReference, appointment.appointmentId)
      const appointmentStatus = getAppointmentStatus(appointment)
      const config = configMap[appointmentStatus] ?? configMap.NOT_SCHEDULED
      return [
        { text: this.formatAppointmentDateTime(appointment.dateTime) },
        { html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` },
        { html: this.renderActions(config.actions) },
      ]
    })
  }

  private renderActions(actions: { label: string; href: string }[]): string {
    return `
      <ul class="govuk-list govuk-!-margin-0">
        ${actions.map(a => `<li><a href="${a.href}" class="govuk-link">${a.label}</a></li>`).join('')}
      </ul>
    `
  }

  private getLatestAppointments(): ReferralAppointmentHistory[] {
    const latest = new Map<string, ReferralAppointmentHistory>()

    for (const appt of this.referralProgress.appointments ?? []) {
      const key = appt.appointmentId ?? `unknown-${appt.dateTime}`
      const existing = latest.get(key)

      if (!existing || appt.dateTime > existing.dateTime) {
        latest.set(key, appt)
      }
    }

    return [...latest.values()].sort((a, b) => b.dateTime.localeCompare(a.dateTime))
  }
}

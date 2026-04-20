import { Response } from 'express'
import {
  GovukFrontendNotificationBanner,
  GovukFrontendTable,
  GovukFrontendTableHeadElement,
  GovukFrontendTableRow,
} from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'
import { ReferralProgress, ReferralAppointmentHistory } from '@community-support-api'

import PresenterBase from '../../presenter/presenterBase'
import { ReferralProgressContent, ReferralProgressViewModel } from './progressViewModel'

type TabKey = 'caseDetails' | 'progress' | 'changeLog'
type StatusKey = ReferralAppointmentHistory['status'] | 'NOT_SCHEDULED'

type StatusConfig = {
  label: string
  tagClass: string
  action: string
  link: string
}

const getStatusConfig = (caseReference: string, appointmentId: string = ''): Record<StatusKey, StatusConfig> => ({
  NOT_SCHEDULED: {
    label: 'Not scheduled',
    tagClass: 'govuk-tag--grey',
    action: 'Schedule session',
    link: `/referral/${caseReference}/appointment/schedule-ics`,
  },
  SCHEDULED: {
    label: 'Scheduled',
    tagClass: 'govuk-tag--blue',
    action: 'View or change details',
    link: `/referral/${caseReference}/ics/${appointmentId}`,
  },
  NEEDS_FEEDBACK: {
    label: 'Needs feedback',
    tagClass: 'govuk-tag--red',
    action: 'Add attendance and feedback',
    link: '#',
  },
  DID_NOT_ATTEND: {
    label: 'Did not attend',
    tagClass: 'govuk-tag--purple',
    action: 'Reason for not attending',
    link: '#',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    tagClass: 'govuk-tag--grey',
    action: 'Reschedule Session',
    link: '#',
  },
  COMPLETED: {
    label: 'Completed',
    tagClass: 'govuk-tag--green',
    action: 'View feedback',
    link: '#',
  },
})

export default class ProgressPresenter extends PresenterBase<ReferralProgressViewModel, ReferralProgressContent> {
  private readonly name: string

  private readonly basePath: string

  private readonly tabPaths: Record<TabKey, string>

  constructor(
    private readonly referralProgress: ReferralProgress,
    private readonly caseReference: string,
    private readonly showSuccessBanner: boolean = false,
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
      backLink: { href: '/referral-dashboard' },
      notificationBanner:
        this.showSuccessBanner && latestAppointment && latestAppointment.status === 'SCHEDULED'
          ? this.buildIcsScheduledBanner(latestAppointment.dateTime)
          : undefined,
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

  private buildIcsScheduledBanner(date: string): GovukFrontendNotificationBanner {
    return {
      type: 'success',
      html: `
        <h3 class="govuk-notification-banner__heading">ICS scheduled</h3>
        <p class="govuk-body">The ICS has been scheduled for ${this.formatAppointmentDateTime(date)}.</p>
      `,
    }
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
        { html: `<a href="${config.link}" class="govuk-link">${config.action}</a>` },
      ],
    ]
  }

  private buildInProgressTableRows(): GovukFrontendTableRow[] {
    const latestAppointments = this.getLatestAppointments()

    const configMap = getStatusConfig(this.caseReference, latestAppointments.at(0)?.appointmentId)

    return latestAppointments.map(item => {
      const config = configMap[item.status]
      return [
        { text: this.formatAppointmentDateTime(item.dateTime) },
        { html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` },
        { html: `<a href="${config.link}" class="govuk-link">${config.action}</a>` },
      ]
    })
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

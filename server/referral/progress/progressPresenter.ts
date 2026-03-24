import { Response } from 'express'
import { GovukFrontendNotificationBanner, GovukFrontendTable } from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'
import { ReferralProgress } from '@community-support-api'

import PresenterBase from '../../presenter/presenterBase'
import { ReferralProgressContent, ReferralProgressViewModel } from './progressViewModel'

type TabKey = 'caseDetails' | 'progress' | 'changeLog'

const STATUS_CONFIG: Record<ReferralProgress['status'], { label: string; tagClass: string; action: string }> = {
  SCHEDULED: { label: 'Scheduled', tagClass: 'govuk-tag--blue', action: 'View or change details' },
  NEEDS_FEEDBACK: { label: 'Needs feedback', tagClass: 'govuk-tag--red', action: 'Add attendance and feedback' },
  COMPLETED: { label: 'Completed', tagClass: 'govuk-tag--green', action: 'View feedback' },
}

export default class ProgressPresenter extends PresenterBase<ReferralProgressViewModel> {
  private readonly tabPaths: Record<TabKey, string>

  private readonly basePath: string

  constructor(
    private readonly referralAppointments: ReferralProgress[],
    private readonly referralId: string,
    private readonly selectedTab: TabKey,
  ) {
    super()
    this.basePath = `/referral-details/${this.referralId}`
    this.tabPaths = {
      caseDetails: '#',
      progress: `${this.basePath}/progress`,
      changeLog: '#',
    }
  }

  buildPageContent(res: Response): ReferralProgressViewModel {
    const content = this.buildStaticContent(res)
    const viewModel: ReferralProgressViewModel = { staticContent: content } as ReferralProgressViewModel
    const sortedAppointments = this.getLatestAppointments()

    viewModel.staticContent.pageHeader = content.pageHeader
    viewModel.navBar = this.buildSubNav(viewModel.staticContent)
    viewModel.actionLinkHref = '#'
    viewModel.backlinkHref = '#'
    viewModel.hasIcsAppointment = sortedAppointments.length > 0

    if (viewModel.hasIcsAppointment) {
      const latestAppointment = sortedAppointments[0]
      if (latestAppointment.status === 'SCHEDULED') {
        viewModel.notificationBanner = this.buildIcsScheduledBanner(latestAppointment.appointmentDateTime)
      }
    }

    viewModel.icsAppointmentTable = this.buildIcsAppointmentTable(
      viewModel.staticContent,
      this.selectedTab,
      viewModel.hasIcsAppointment,
    )

    return viewModel
  }

  buildStaticContent(res: Response): ReferralProgressContent {
    const { content } = res.locals
    return content as ReferralProgressContent
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

  private buildSubNav(content: ReferralProgressContent): MojSubNavigation {
    let label: string

    switch (this.selectedTab) {
      case 'progress':
        label = content.progressSubNavTitle
        break
      case 'caseDetails':
        label = content.caseDetailsSubNavTitle
        break
      case 'changeLog':
        label = content.changeLogSubNavTitle
        break
      default:
        label = content.progressSubNavTitle
    }

    return {
      label,
      items: this.buildSubNavItems(content),
    }
  }

  private buildSubNavItems(content: ReferralProgressContent) {
    return Object.keys(this.tabPaths).map(tabKey => ({
      text: content.subNavItems.find(i => i.id === tabKey)?.title ?? tabKey,
      href: this.tabPaths[tabKey as TabKey],
      active: tabKey === this.selectedTab,
    }))
  }

  private buildIcsAppointmentTable(
    content: ReferralProgressContent,
    selectedTab: TabKey,
    hasAppointment: boolean,
  ): GovukFrontendTable {
    let headers: string[]
    let rows: Array<Array<{ text?: string; html?: string }>>

    switch (selectedTab) {
      case 'progress':
        if (hasAppointment) {
          headers = content.progressActiveColumnHeaders
          rows = this.buildInProgressTableRows()
        } else {
          headers = content.progressInactiveColumnHeaders
          rows = this.buildNotScheduledRow()
        }
        break

      default:
        throw new Error(`Unhandled tab: ${selectedTab}`)
    }

    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': 'case-list-table',
      },
      head: this.buildIcsAppointmentColumnHeaders(headers),
      rows,
    }
  }

  private buildNotScheduledRow() {
    return [
      [
        { html: `<span class="govuk-tag govuk-tag--grey">Not scheduled</span>` },
        { html: `<a href="/referral-details/${this.referralId}/progress" class="govuk-link">Schedule session</a>` },
      ],
    ]
  }

  private buildIcsAppointmentColumnHeaders(items?: string[]): { text: string }[] {
    return (items ?? []).map(header => ({ text: header }))
  }

  private buildInProgressTableRows() {
    return this.getLatestAppointments().map(item => {
      const config = STATUS_CONFIG[item.status]
      return [
        { text: this.formatAppointmentDateTime(item.appointmentDateTime) },
        { html: `<span class="govuk-tag ${config.tagClass}">${config.label}</span>` },
        { html: `<a href="${this.tabPaths.progress}" class="govuk-link">${config.action}</a>` },
      ]
    })
  }

  private getLatestAppointments(): ReferralProgress[] {
    const latestPerAppointment: Record<string, ReferralProgress> = this.referralAppointments.reduce(
      (accumulator, current) => {
        const appointmentId = current.appointmentId ?? `unknown-${current.appointmentDateTime}`
        const existing = accumulator[appointmentId]

        if (!existing || new Date(current.appointmentDateTime) > new Date(existing.appointmentDateTime)) {
          accumulator[appointmentId] = current
        }
        return accumulator
      },
      {} as Record<string, ReferralProgress>,
    )

    return Object.values(latestPerAppointment).sort(
      (a, b) => new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime(),
    )
  }
}

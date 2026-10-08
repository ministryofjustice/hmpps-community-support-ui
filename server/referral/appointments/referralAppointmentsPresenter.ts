import type { Response } from 'express'
import type { GovukFrontendTable } from '@govuk-frontend'
import type { MojSubNavigation } from '@moj-frontend'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import { formatDate } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import type { ReferralAppointmentsContent, ReferralAppointmentsViewModel } from './referralAppointmentsViewModel'

type ReferralTab = 'caseDetails' | 'progress' | 'appointments' | 'changeLog'

export default class ReferralAppointmentsPresenter extends PresenterBase<
  ReferralAppointmentsViewModel,
  ReferralAppointmentsContent
> {
  private readonly tabPaths: Record<ReferralTab, string>

  constructor(
    private readonly referralAppointments: ReferralAppointmentsBffResponseDto,
    private readonly caseReference: string,
  ) {
    super()
    this.tabPaths = {
      caseDetails: `/referral-details/${caseReference}`,
      progress: `/progress/${caseReference}`,
      appointments: `/referral/${caseReference}/appointments`,
      changeLog: '#',
    }
  }

  protected getTemplatePath(): string {
    return 'referral/appointments'
  }

  buildViewModel(res: Response): ReferralAppointmentsViewModel {
    const content = this.buildStaticContent(res)
    const { firstName, lastName } = this.referralAppointments.personDetails
    const { appointments } = this.referralAppointments

    return {
      pageHeader: `${content.pageHeader} ${firstName} ${lastName}`,
      navBar: this.buildSubNav(content),
      createAppointmentHref: `/referral/${this.caseReference}/appointment/select-type`,
      appointmentsTable: this.buildAppointmentsTable(content),
      hasAppointments: appointments.length > 0,
    }
  }

  private buildSubNav(content: ReferralAppointmentsContent): MojSubNavigation {
    return {
      label: content.subNavTitle,
      items: (Object.keys(this.tabPaths) as ReferralTab[]).map(tab => ({
        text: content.subNavItems.find(item => item.id === tab)?.title ?? tab,
        href: this.tabPaths[tab],
        active: tab === 'appointments',
      })),
    }
  }

  private buildAppointmentsTable(content: ReferralAppointmentsContent): GovukFrontendTable {
    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': 'referral-appointments-table',
      },
      head: [{ text: content.appointmentTypeColumnHeader }, { text: content.dateTimeColumnHeader }],
      rows: this.referralAppointments.appointments.map(appointment => [
        { text: appointment.label },
        { text: formatDate(appointment.time, "dd MMMM yyyy 'at' h:mmaaa") },
      ]),
    }
  }
}

import type { Response } from 'express'
import type { GovukFrontendButton, GovukFrontendTable } from '@govuk-frontend'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import { formatDate } from 'date-fns'
import { formatTime12Hr, formatTime24Hr } from '../../utils/timeFormat'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import type { ReferralAppointmentsContent, ReferralAppointmentsViewModel } from './referralAppointmentsViewModel'

export default class ReferralAppointmentsPresenter extends ReferralLayoutPresenter<
  ReferralAppointmentsViewModel,
  ReferralAppointmentsContent
> {
  constructor(
    private readonly referralAppointments: ReferralAppointmentsBffResponseDto,
    private readonly caseReference: string,
    private readonly showSuccessAlert = false,
  ) {
    super(ReferralNavigationValues.appointmentsTab, caseReference)
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
      navBar: this.getMojSubNavigationArgs(),
      appointmentsTitle: content.appointmentsTitle,
      createAppointmentButton: this.buildAppointmentButton(content),
      noAppointmentsMessage: content.noAppointmentsMessage,
      appointmentsTable: this.buildAppointmentsTable(content),
      hasAppointments: appointments.length > 0,
      ...(this.showSuccessAlert && {
        notificationBanner: {
          type: 'success',
          html: `<h3 class="govuk-notification-banner__heading">${content.appointmentCreatedSuccessfully}</h3>`,
        },
      }),
      ...(this.showSuccessAlert && {
        notificationBanner: {
          type: 'success',
          html: `<h3 class="govuk-notification-banner__heading">${content.appointmentCreatedSuccessfully}</h3>`,
        },
      }),
      upcomingAppointmentsTitle: content.upcomingAppointmentsTitle,
      pastAppointmentsTitle: content.pastAppointmentsTitle,
    }
  }

  private buildAppointmentButton(content: ReferralAppointmentsContent): GovukFrontendButton {
    return {
      text: content.bookAppointmentText,
      href: content.bookAppointmentHref.replace('{{ id }}', this.caseReference),
      preventDoubleClick: true,
    }
  }

  private buildAppointmentsTable(content: ReferralAppointmentsContent): GovukFrontendTable {
    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': 'referral-appointments-table',
      },
      head: [
        {
          text: content.appointmentTypeColumnHeader,
          attributes: {
            'aria-sort': 'none',
          },
        },
        {
          text: content.dateColumnHeader,
          attributes: {
            'aria-sort': 'none',
          },
        },
        {
          text: content.timeColumnHeader,
          attributes: {
            'aria-sort': 'none',
          },
        },
      ],
      rows: this.referralAppointments.appointments.map(appointment => [
        {
          text: appointment.label,
          attributes: {
            'data-sort-value': appointment.label,
          },
        },
        {
          text: `${formatDate(new Date(appointment.appointmentDate), 'dd MMMM yyyy')}`,
          attributes: {
            'data-sort-value': appointment.appointmentDate,
          },
        },
        {
          text: `${formatTime12Hr(
            appointment.appointmentTime.hour,
            appointment.appointmentTime.minute,
            appointment.appointmentTime.amPm,
          )}`,
          attributes: {
            'data-sort-value': formatTime24Hr(appointment.appointmentTime),
          },
        },
      ]),
    }
  }
}

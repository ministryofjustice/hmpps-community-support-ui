import type { Response } from 'express'
import type { GovukFrontendButton, GovukFrontendTable } from '@govuk-frontend'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import { formatDate } from 'date-fns'
import { formatTime12Hr, formatTime24Hr } from '../../utils/timeFormat'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import type { ReferralAppointmentsContent, ReferralAppointmentsViewModel } from './referralAppointmentsViewModel'

const statusTagClasses: Record<string, string> = {
  SCHEDULED: 'govuk-tag--blue',
  NEEDS_FEEDBACK: 'govuk-tag--red',
  COMPLETED: 'govuk-tag--green',
  CHANGED: 'govuk-tag--orange',
  DID_NOT_ATTEND: 'govuk-tag--magenta',
  DID_NOT_HAPPEN: 'govuk-tag--magenta',
}

export default class ReferralAppointmentsPresenter extends ReferralLayoutPresenter<
  ReferralAppointmentsViewModel,
  ReferralAppointmentsContent
> {
  constructor(
    private readonly referralAppointments: ReferralAppointmentsBffResponseDto,
    private readonly caseReference: string,
    private readonly successAlert: { title: string; message: string } = undefined,
  ) {
    super(ReferralNavigationValues.appointmentsTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'referral/appointments'
  }

  buildViewModel(res: Response): ReferralAppointmentsViewModel {
    const content = this.buildStaticContent(res)
    const { firstName, lastName } = this.referralAppointments.personDetails
    const { upcomingAppointments, pastAppointments } = this.referralAppointments

    return {
      pageHeader: `${content.pageHeader} ${firstName} ${lastName}`,
      navBar: this.getMojSubNavigationArgs(),
      appointmentsTitle: content.appointmentsTitle,
      createAppointmentButton: this.buildAppointmentButton(content),
      noAppointmentsMessage: content.noAppointmentsMessage,
      noUpcomingAppointmentsMessage: content.noUpcomingAppointmentsMessage,
      noPastAppointmentsMessage: content.noPastAppointmentsMessage,
      upcomingAppointmentsTable: this.buildAppointmentsTable(
        content,
        upcomingAppointments,
        'referral-upcoming-appointments-table',
      ),
      pastAppointmentsTable: this.buildAppointmentsTable(content, pastAppointments, 'referral-past-appointments-table'),
      hasUpcomingAppointments: upcomingAppointments.length > 0,
      hasPastAppointments: pastAppointments.length > 0,
      hasAppointments: upcomingAppointments.length > 0 || pastAppointments.length > 0,
      notificationBanner:
        this.successAlert !== undefined
          ? {
              variant: 'success',
              html: this.successAlert.message,
              title: this.successAlert.title,
              dismissible: true,
              showTitleAsHeading: true,
            }
          : undefined,
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

  private buildAppointmentsTable(
    content: ReferralAppointmentsContent,
    appointments: ReferralAppointmentsBffResponseDto['upcomingAppointments'],
    testId: string,
  ): GovukFrontendTable {
    return {
      classes: 'appointments-table',
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': testId,
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
            'aria-sort': 'ascending',
          },
        },
        {
          text: content.timeColumnHeader,
          attributes: {
            'aria-sort': 'none',
          },
        },
        {
          text: content.statusColumnHeader,
          attributes: {
            'aria-sort': 'none',
          },
        },
        {
          text: content.actionColumnHeader,
          classes: 'govuk-table__header--numeric',
          attributes: {
            'aria-sort': 'none',
          },
        },
      ],
      rows: appointments.map(appointment => {
        const status = content.statuses[appointment.appointmentStatus]
        return [
          {
            text: appointment.label,
            attributes: {
              'data-sort-value': appointment.label,
            },
          },
          {
            text: `${formatDate(new Date(appointment.appointmentDate), 'dd MMMM yyyy')}`,
            attributes: {
              'data-sort-value': `${appointment.appointmentDate}T${formatTime24Hr(appointment.appointmentTime)}`,
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
          {
            html: `<strong class="govuk-tag ${statusTagClasses[appointment.appointmentStatus]}">${status.text}</strong>`,
            attributes: {
              'data-sort-value': status.text,
            },
          },
          {
            classes: 'govuk-table__cell--numeric',
            html: status.actions.map(action => `<a href="${action.href}">${action.text}</a>`).join('<br> '),
            attributes: {
              'data-sort-value': status.text,
            },
          },
        ]
      }),
    }
  }
}

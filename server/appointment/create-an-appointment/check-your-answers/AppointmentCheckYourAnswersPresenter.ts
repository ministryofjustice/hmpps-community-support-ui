import { CreateAppointmentReferenceDataBffDto } from '@community-support-api'
import { GovukFrontendSummaryListRow } from '@govuk-frontend'
import { Response } from 'express'
import { format } from 'date-fns'
import PresenterBase from '../../../presenter/presenterBase'
import { formatIsoDateOrNull } from '../../../utils/dateFormat'
import { govFrontendSummaryListRow } from '../../../utils/viewUtils'
import AppointmentSessionData from '../AppointmentSessionData'
import { getAppointmentMethodLabel, normaliseAppointmentMethod } from '../appointmentMethod'
import { getAppointmentTypeLabel } from '../appointmentTypeLabel'
import {
  AppointmentCheckYourAnswersContent,
  AppointmentCheckYourAnswersViewModel,
} from './AppointmentCheckYourAnswersViewModel'
import { getInformedByLabel } from '../../informedByLabels'

export default class AppointmentCheckYourAnswersPresenter extends PresenterBase<
  AppointmentCheckYourAnswersViewModel,
  AppointmentCheckYourAnswersContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly firstName: string,
    private readonly appointmentSessionData: AppointmentSessionData,
    private readonly probationOfficeLocations: CreateAppointmentReferenceDataBffDto['probationOfficeLocations'],
    private readonly appointmentTypes: CreateAppointmentReferenceDataBffDto['appointmentTypes'] = [],
  ) {
    super()
  }

  buildViewModel(res: Response): AppointmentCheckYourAnswersViewModel {
    const content = this.buildStaticContent(res)
    const appointmentTypeLabel = getAppointmentTypeLabel(
      this.appointmentSessionData.appointmentType,
      this.appointmentTypes,
    )
    const appointmentTypeLabelForSentence = appointmentTypeLabel === 'ICS' ? 'ICS' : appointmentTypeLabel.toLowerCase()

    return {
      pageTitle: `Check the details before scheduling the ${appointmentTypeLabelForSentence}`,
      pageHeader: `Check the details before scheduling the ${appointmentTypeLabelForSentence}`,
      submitHref: content.submitHref.replace(/caseRefId|\{\{ id \}\}/g, this.caseRefId),
      submitButtonText: content.submitButtonText,
      backLink: { href: content.backLink.replace(/caseRefId|\{\{ id \}\}/g, this.caseRefId) },
      appointmentSummary: this.buildAppointmentSummary(content, appointmentTypeLabel),
    }
  }

  protected getTemplatePath(): string {
    return 'appointment/create-an-appointment/check-your-answers'
  }

  private buildAppointmentSummary(content: AppointmentCheckYourAnswersContent, appointmentTypeLabel: string) {
    return {
      card: {
        title: { text: `${appointmentTypeLabel} details` },
        actions: {
          items: [
            {
              href: content.changeLinkHref.replace(/caseRefId|\{\{ id \}\}/g, this.caseRefId),
              text: content.changeLinkText,
              visuallyHiddenText: `${appointmentTypeLabel} details`,
            },
          ],
        },
      },
      rows: this.buildRows(content),
    }
  }

  private buildRows(content: AppointmentCheckYourAnswersContent): GovukFrontendSummaryListRow[] {
    const rows = [
      govFrontendSummaryListRow(content.dateLabel, this.formatDate(this.appointmentSessionData.date)),
      govFrontendSummaryListRow(content.startTimeLabel, this.appointmentSessionData.startTime || ''),
      govFrontendSummaryListRow(content.methodLabel, this.formatMethod(this.appointmentSessionData.method)),
    ]

    const locationRow = this.buildLocationRow(content)
    if (locationRow) {
      rows.push(locationRow)
    }

    const meetAtTheGateRow = this.buildMeetAtTheGateRow(content)
    if (meetAtTheGateRow) {
      rows.push(meetAtTheGateRow)
    }

    if (this.shouldShowInformedByRow()) {
      rows.push(
        govFrontendSummaryListRow(
          content.informedLabel.replace('{{ firstname }}', this.firstName),
          this.formatInformedBy(),
        ),
      )
    }

    return rows
  }

  private shouldShowInformedByRow(): boolean {
    const { appointmentType } = this.appointmentSessionData
    const informedBy = this.appointmentSessionData.informedBy || []

    if (!appointmentType || appointmentType === 'HANDOVER_SESSION') {
      return false
    }

    return informedBy.length > 0
  }

  private buildLocationRow(content: AppointmentCheckYourAnswersContent): GovukFrontendSummaryListRow | undefined {
    const method = normaliseAppointmentMethod(this.appointmentSessionData.method)
    if (!method || !['IN_PERSON_PROBATION_OFFICE', 'IN_PERSON_OTHER_LOCATION'].includes(method)) {
      return undefined
    }

    const location = this.formatLocation()
    if (!location) {
      return undefined
    }

    return govFrontendSummaryListRow(content.locationLabel, location)
  }

  private formatLocation(): string {
    const method = normaliseAppointmentMethod(this.appointmentSessionData.method)
    if (method === 'IN_PERSON_OTHER_LOCATION' && this.appointmentSessionData.location) {
      return this.appointmentSessionData.location
    }

    const locationId = this.appointmentSessionData.probationOfficeLocationId
    if (!locationId) {
      return ''
    }

    const probationOffice = this.probationOfficeLocations.find(office => String(office.id) === String(locationId))
    return probationOffice?.name || locationId
  }

  private buildMeetAtTheGateRow(content: AppointmentCheckYourAnswersContent): GovukFrontendSummaryListRow | undefined {
    if (this.appointmentSessionData.appointmentType !== 'POST_RELEASE_SESSION') {
      return undefined
    }

    const { meetAtTheGate } = this.appointmentSessionData
    if (meetAtTheGate === undefined) {
      return undefined
    }

    return govFrontendSummaryListRow(content.meetAtTheGateLabel, meetAtTheGate ? 'Yes' : 'No')
  }

  private formatDate(date?: string): string {
    if (!date) {
      return ''
    }

    const formattedDate = formatIsoDateOrNull(date)
    if (formattedDate) {
      return formattedDate
    }

    try {
      return format(new Date(date), 'd MMMM yyyy')
    } catch {
      return date
    }
  }

  private formatMethod(method?: string): string {
    return getAppointmentMethodLabel(method)
  }

  private formatInformedBy(): string {
    const labels = (this.appointmentSessionData.informedBy || []).map(item => getInformedByLabel(item)).filter(Boolean)

    return labels.join(', ')
  }
}

import { CreateAppointmentReferenceDataBffDto } from '@community-support-api'
import { GovukFrontendSummaryListRow } from '@govuk-frontend'
import { Response } from 'express'
import { format, isValid, parse } from 'date-fns'
import PresenterBase from '../../../presenter/presenterBase'
import { formatIsoDateOrNull } from '../../../utils/dateFormat'
import { escapeSpecialHtmlCharacters, govFrontendSummaryListRow } from '../../../utils/viewUtils'
import AppointmentSessionData from '../AppointmentSessionData'
import { getAppointmentMethodLabel, normaliseAppointmentMethod } from '../appointmentMethod'
import { getAppointmentTypeLabel } from '../appointmentTypeLabel'
import {
  AppointmentCheckYourAnswersContent,
  AppointmentCheckYourAnswersViewModel,
} from './AppointmentCheckYourAnswersViewModel'
import { getInformedByLabel } from '../../informedByLabels'
import { appointmentTypeRules, parseAppointmentType } from '../../appointmentTypeRules'

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
    const appointmentTypeLabelForSentence =
      appointmentTypeLabel === 'Initial contact session' || appointmentTypeLabel === 'ICS'
        ? 'ICS'
        : appointmentTypeLabel.toLowerCase()

    return {
      pageTitle: `Check the details before booking the ${appointmentTypeLabelForSentence}`,
      pageHeader: `Check the details before booking the ${appointmentTypeLabelForSentence}`,
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
        title: { text: appointmentTypeLabel },
        actions: {
          items: [
            {
              href: content.changeLinkHref.replace(/caseRefId|\{\{ id \}\}/g, this.caseRefId),
              text: content.changeLinkText,
              visuallyHiddenText: appointmentTypeLabel,
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

    const methodDetailRow = this.buildMethodDetailRow(content)
    if (methodDetailRow) {
      rows.push(methodDetailRow)
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

    const type = parseAppointmentType(appointmentType)
    if (!type || !appointmentTypeRules[type].informed) {
      return false
    }

    return informedBy.length > 0
  }

  private buildMethodDetailRow(content: AppointmentCheckYourAnswersContent): GovukFrontendSummaryListRow | undefined {
    const method = normaliseAppointmentMethod(this.appointmentSessionData.method)
    if (method === 'PHONE' || method === 'VIDEO') {
      return govFrontendSummaryListRow(
        content.reasonSessionNotInPersonLabel,
        this.appointmentSessionData.reasonSessionNotInPerson || '',
      )
    }

    if (method === 'IN_PERSON_PRISON') {
      return govFrontendSummaryListRow(
        content.prisonLabel,
        this.appointmentSessionData.prisonName || this.appointmentSessionData.prisonCode || '',
      )
    }

    if (method !== 'IN_PERSON_PROBATION_OFFICE' && method !== 'IN_PERSON_OTHER_LOCATION') {
      return undefined
    }

    const location = this.formatLocation()
    if (!location) {
      return undefined
    }

    const label =
      method === 'IN_PERSON_PROBATION_OFFICE' ? content.probationOfficeLabel : content.appointmentAddressLabel

    if (method === 'IN_PERSON_OTHER_LOCATION' && this.appointmentSessionData.addressLines) {
      const locationHtml = this.appointmentSessionData.addressLines.map(escapeSpecialHtmlCharacters).join('<br>')
      return govFrontendSummaryListRow(label, { html: locationHtml })
    }

    return govFrontendSummaryListRow(label, location)
  }

  private formatLocation(): string {
    const method = normaliseAppointmentMethod(this.appointmentSessionData.method)
    if (method === 'IN_PERSON_OTHER_LOCATION') {
      return this.appointmentSessionData.addressLines?.join(', ') || ''
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

    // dd/MM/yyyy must be parsed to uk date format: new Date('04/11/2026') would be read as the US format (April 11)
    const localisedDate = parse(date, 'd/M/yyyy', new Date())
    if (isValid(localisedDate)) {
      return format(localisedDate, 'd MMMM yyyy')
    }

    try {
      return format(new Date(date), 'd MMMM yyyy')
    } catch {
      return date
    }
  }

  private formatMethod(method?: string): string {
    const normalisedMethod = normaliseAppointmentMethod(method)
    if (normalisedMethod === 'IN_PERSON_PROBATION_OFFICE') {
      return 'In person: probation office'
    }
    if (normalisedMethod === 'IN_PERSON_OTHER_LOCATION') {
      return 'In person: another address'
    }
    if (normalisedMethod === 'IN_PERSON_PRISON') {
      return 'In person: prison'
    }

    return getAppointmentMethodLabel(method)
  }

  private formatInformedBy(): string {
    const labels = (this.appointmentSessionData.informedBy || []).map(item => getInformedByLabel(item)).filter(Boolean)

    return labels.join(', ')
  }
}

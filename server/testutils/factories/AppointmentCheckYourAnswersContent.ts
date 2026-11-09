import { Factory } from 'fishery'
import { AppointmentCheckYourAnswersContent } from '../../appointment/create-an-appointment/check-your-answers/AppointmentCheckYourAnswersViewModel'

class AppointmentCheckYourAnswersContentFactory extends Factory<AppointmentCheckYourAnswersContent> {}

export default AppointmentCheckYourAnswersContentFactory.define(() => ({
  pageTitle: 'Check your answers before submitting the appointment',
  pageHeader: 'Check your answers before submitting the appointment',
  summaryTitle: 'Appointment details',
  dateLabel: 'Date',
  startTimeLabel: 'Start time',
  methodLabel: 'Method',
  locationLabel: 'Location',
  meetAtTheGateLabel: 'Meeting at the gate',
  informedLabel: 'How {{ firstname }} was informed about the session',
  changeLinkText: 'Change',
  changeLinkVisualText: 'appointment details',
  changeLinkHref: '/referral/{{ id }}/create-an-appointment/appointment-type',
  submitButtonText: 'Submit',
  submitHref: '/referral/{{ id }}/create-an-appointment/check-your-answers',
  backLink: '/referral/{{ id }}/create-an-appointment/appointment-type',
}))

import { Factory } from 'fishery'
import { AppointmentTypeContent } from '../../appointment/create-an-appointment/appointment-type/AppointmentTypeViewModel'

class AppointmentTypeContentFactory extends Factory<AppointmentTypeContent> {}

export default AppointmentTypeContentFactory.define(() => ({
  pageTitle: 'Select the appointment type',
  heading: 'Create an appointment for {{ personName }}',
  appointmentTypeLabel: 'Select the appointment type',
  buttonText: 'Save and continue',
}))

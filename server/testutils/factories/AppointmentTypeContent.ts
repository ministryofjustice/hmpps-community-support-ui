import { Factory } from 'fishery'
import { AppointmentTypeContent } from '../../appointment/create-an-appointment/appointment-type/AppointmentTypeViewModel'

class AppointmentTypeContentFactory extends Factory<AppointmentTypeContent> {}

export default AppointmentTypeContentFactory.define(() => ({
  pageTitle: 'Appointment type',
  buttonText: 'Continue',
}))

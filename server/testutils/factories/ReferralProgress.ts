import { Factory } from 'fishery'
import { ReferralProgress } from '@community-support-api'

class ReferralProgressFactory extends Factory<ReferralProgress> {}

export default ReferralProgressFactory.define<ReferralProgress>(({ sequence }) => ({
  referralId: `ref-${sequence}`,
  personName: 'Person Name',
  appointmentId: `app-${sequence}`,
  appointmentType: 'ICS',
  appointmentDateTime: '2026-03-27T13:00:00',
  status: 'SCHEDULED',
}))

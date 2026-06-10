import { Factory } from 'fishery'
import { ReferralProgress } from '@community-support-api'
import { randomUUID } from 'crypto'

class ReferralProgressFactory extends Factory<ReferralProgress> {}

const referralId = randomUUID()

export default ReferralProgressFactory.define<ReferralProgress>(({ sequence }) => ({
  referralId,
  fullName: 'Person Name',
  appointments: [
    {
      appointmentIcsId: `app-${sequence}`,
      type: 'ICS',
      dateTime: '2026-03-27T13:00:00',
      status: 'SCHEDULED',
    },
  ],
}))

import { z } from 'zod'

const NOTHING_SELECTED_ERROR = { error: 'Select the appointment type' }

export const AppointmentTypeSchema = z.object({
  appointmentType: z.string(NOTHING_SELECTED_ERROR).min(1, NOTHING_SELECTED_ERROR),
})

export type AppointmentTypeFormData = z.infer<typeof AppointmentTypeSchema>

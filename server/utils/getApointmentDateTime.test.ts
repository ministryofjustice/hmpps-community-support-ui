import getAppointmentDateTime from './getAppointmentDateTime'

describe('getAppointmentDateTime', () => {
  test('00:00', () => {
    const input = {
      appointmentDate: '2026-05-28',
      appointmentTime: { hour: 12, minute: 0, amPm: 'am' },
    }
    const output = getAppointmentDateTime(input)
    expect(output).toStrictEqual(new Date('2026-05-28T00:00:00.000Z'))
  })
  test('01:00', () => {
    const input = {
      appointmentDate: '2026-05-28',
      appointmentTime: { hour: 1, minute: 0, amPm: 'am' },
    }
    const output = getAppointmentDateTime(input)
    expect(output).toStrictEqual(new Date('2026-05-28T01:00:00.000Z'))
  })
  test('06:00', () => {
    const input = {
      appointmentDate: '2026-05-28',
      appointmentTime: { hour: 6, minute: 0, amPm: 'am' },
    }
    const output = getAppointmentDateTime(input)
    expect(output).toStrictEqual(new Date('2026-05-28T06:00:00.000Z'))
  })
  test('13:00', () => {
    const input = {
      appointmentDate: '2026-05-28',
      appointmentTime: { hour: 1, minute: 0, amPm: 'pm' },
    }
    const output = getAppointmentDateTime(input)
    expect(output).toStrictEqual(new Date('2026-05-28T13:00:00.000Z'))
  })
  test('12:45', () => {
    const input = {
      appointmentDate: '2026-05-28',
      appointmentTime: { hour: 12, minute: 45, amPm: 'pm' },
    }
    const output = getAppointmentDateTime(input)
    expect(output).toStrictEqual(new Date('2026-05-28T12:45:00.000Z'))
  })
})

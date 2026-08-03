import { addDays, addMonths, startOfDay, subDays } from 'date-fns'
import { britishDateFormat } from '../utils/dateFormat'
import buildScheduleIcsAppointmentFormData from './ScheduleIcsAppointmentFormData'

describe('ScheduleIcsAppointmentFormData', () => {
  // I know this looks weird but I needed to do this because the raw string was flagged as a secret
  const invalidChars = [
    47, 33, 64, 35, 36, 37, 94, 38, 42, 40, 41, 91, 93, 123, 125, 34, 60, 62, 63, 43, 61, 95, 92, 124, 167, 177, 96,
    126, 58, 59,
  ]
    .map(c => String.fromCharCode(c))
    .join('')

  beforeEach(() => {
    // reset the clock time
    jest.useFakeTimers().setSystemTime(startOfDay(new Date('2026-06-18')))
  })

  describe('sessionDate', () => {
    test('no value', () => {
      const body = {
        sessionDate: '',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('sessionDate')
        expect(error.message).toBe('Enter the date of the session')
      }
    })
    test('incorrect format', () => {
      const body = {
        sessionDate: '21-07-2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('sessionDate')
        expect(error.message).toBe('Enter a date in the correct format, like 10/7/2025')
      }
    })
    test('before session date', () => {
      const body = {
        sessionDate: britishDateFormat(subDays(new Date(), 1)),
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('sessionDate')
        expect(error.message).toBe('The session date must be after the referral date, 18/06/2026')
      }
    })
    test('too far into the future', () => {
      const body = {
        sessionDate: britishDateFormat(addMonths(addDays(new Date(), 1), 6)),
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('sessionDate')
        expect(error.message).toBe('The session date must be before 18/12/2026')
      }
    })
    test('date that does not exist', () => {
      jest.useFakeTimers().setSystemTime(startOfDay(new Date('2026-01-18')))
      const body = {
        sessionDate: '30/02/2026', // 30th of Febuary doesn't exist
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('sessionDate')
        expect(error.message).toBe('Enter a date in the correct format, like 10/7/2025')
      }
    })
    test('happy path - tomorrow', () => {
      const body = {
        sessionDate: britishDateFormat(addDays(new Date(), 1)),
        'sessionTime-hour': '10',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeTruthy()
    })
  })
  describe('session-time', () => {
    describe('hours', () => {
      test('no value', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '',
          'sessionTime-minute': '0',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-hour'])
          expect(error.message).toBe('Session start time must include an hour and minute')
        }
      })
      test('too low', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '-1',
          'sessionTime-minute': '0',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-hour'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
      test('too high', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '13',
          'sessionTime-minute': '0',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-hour'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
      test('not a number', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': 'ab',
          'sessionTime-minute': '0',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-hour'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
      test('too many digits', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '001',
          'sessionTime-minute': '0',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-hour'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
    })
    describe('minutes', () => {
      test('no value', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '11',
          'sessionTime-minute': '',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-minute'])
          expect(error.message).toBe('Session start time must include an hour and minute')
        }
      })
      test('too low', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '8',
          'sessionTime-minute': '-1',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-minute'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
      test('too high', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '8',
          'sessionTime-minute': '60',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-minute'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
      test('not a number', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '04',
          'sessionTime-minute': 'ab',
          'sessionTime-meridiem': 'pm',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-minute'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
      test('too many digits', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '3',
          'sessionTime-minute': '001',
          'sessionTime-meridiem': 'am',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-minute'])
          expect(error.message).toBe('Enter a session start time in the correct format')
        }
      })
    })
    describe('merdiem', () => {
      test('no value', () => {
        const body = {
          sessionDate: britishDateFormat(addDays(new Date(), 1)),
          'sessionTime-hour': '11',
          'sessionTime-minute': '30',
          'sessionTime-meridiem': '',
          ByPhone: 'reasons',
          ByVideo: '',
          sessionTakePlace: 'ByPhone',
          probationOfficeList: '',
          addressLine1: '',
          addressLine2: '',
          addressTown: '',
          addressCounty: '',
          addressPostcode: '',
          informedMethods: 'informedByPhone',
          otherMethodOfContact: '',
        }
        const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
        expect(result.success).toBeFalsy()
        if (result.error) {
          expect(result.error.issues).toHaveLength(1)
          const error = result.error.issues.at(0)
          expect(error.path).toStrictEqual(['sessionTime-meridiem'])
          expect(error.message).toBe('Select whether the session start time is AM or PM')
        }
      })
    })
    test('no value', () => {
      const body = {
        sessionDate: britishDateFormat(addDays(new Date(), 1)),
        'sessionTime-hour': '',
        'sessionTime-minute': '',
        'sessionTime-meridiem': '',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['sessionTime'])
        expect(error.message).toBe('Enter the start time of the session')
      }
    })
  })
  describe('sessionTakePlace', () => {
    test('none given', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: '',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['sessionTakePlace'])
        expect(error.message).toBe('Select how the session will take place')
      }
    })
    test('byPhone - missing value', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['ByPhone'])
        expect(error.message).toBe('Enter why the session is not in person')
      }
    })
    test('byPhone - invalid characters', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: invalidChars,
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['ByPhone'])
        expect(error.message).toBe(
          'Why is this session not in person must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
        )
      }
    })
    test('byPhone - too long', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: Array(101).fill('a').join(''),
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['ByPhone'])
        expect(error.message).toBe('Why is this session not in person must be 100 characters or less')
      }
    })
    test('byPhone - happy path', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeTruthy()
    })
    test('byVideo - missing value', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'ByVideo',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['ByVideo'])
        expect(error.message).toBe('Enter why the session is not in person')
      }
    })
    test('byVideo - too long', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: Array(101).fill('a').join(''),
        sessionTakePlace: 'ByVideo',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['ByVideo'])
        expect(error.message).toBe('Why is this session not in person must be 100 characters or less')
      }
    })
    test('byVideo - invalid characters', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: invalidChars,
        sessionTakePlace: 'ByVideo',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['ByVideo'])
        expect(error.message).toBe(
          'Why is this session not in person must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
        )
      }
    })
    test('byVideo - happy path', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: 'reasons',
        sessionTakePlace: 'ByVideo',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeTruthy()
    })
    test('InProbationOffice - missing value', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'InProbationOffice',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['probationOfficeList'])
        expect(error.message).toBe('Select a probation office')
      }
    })
    test('InProbationOffice - happy path', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'InProbationOffice',
        probationOfficeList: 'a probation office',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeTruthy()
    })
    test('InSomewhereElse - missing address data', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'InSomewhereElse',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(3)
        const error1 = result.error.issues.at(0)
        expect(error1.path).toStrictEqual(['addressLine1'])
        expect(error1.message).toBe('Enter an address line 1')

        const error2 = result.error.issues.at(1)
        expect(error2.path).toStrictEqual(['addressTown'])
        expect(error2.message).toBe('Enter a town or city')

        const error3 = result.error.issues.at(2)
        expect(error3.path).toStrictEqual(['addressPostcode'])
        expect(error3.message).toBe('Enter a postcode')
      }
    })
    test('InSomewhereElse - too long', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'InSomewhereElse',
        probationOfficeList: '',
        addressLine1: Array(101).fill('a').join(''),
        addressLine2: Array(101).fill('a').join(''),
        addressTown: Array(101).fill('a').join(''),
        addressCounty: Array(101).fill('a').join(''),
        addressPostcode: Array(101).fill('a').join(''),
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(5)
        const error1 = result.error.issues.at(0)
        expect(error1.path).toStrictEqual(['addressLine1'])
        expect(error1.message).toBe('Address line 1 must be 100 characters or less')

        const error2 = result.error.issues.at(1)
        expect(error2.path).toStrictEqual(['addressLine2'])
        expect(error2.message).toBe('Address line 2 must be 100 characters or less')

        const error3 = result.error.issues.at(2)
        expect(error3.path).toStrictEqual(['addressTown'])
        expect(error3.message).toBe('Town or city must be 100 characters or less')

        const error4 = result.error.issues.at(3)
        expect(error4.path).toStrictEqual(['addressCounty'])
        expect(error4.message).toBe('County must be 100 characters or less')

        const error5 = result.error.issues.at(4)
        expect(error5.path).toStrictEqual(['addressPostcode'])
        expect(error5.message).toBe('Postcode must be 100 characters or less')
      }
    })

    test('InSomewhereElse - invalid characters', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'InSomewhereElse',
        probationOfficeList: '',
        addressLine1: invalidChars,
        addressLine2: invalidChars,
        addressTown: invalidChars,
        addressCounty: invalidChars,
        addressPostcode: invalidChars,
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(5)
        const error1 = result.error.issues.at(0)
        expect(error1.path).toStrictEqual(['addressLine1'])
        expect(error1.message).toBe(
          'Address line 1 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
        )

        const error2 = result.error.issues.at(1)
        expect(error2.path).toStrictEqual(['addressLine2'])
        expect(error2.message).toBe(
          'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
        )

        const error3 = result.error.issues.at(2)
        expect(error3.path).toStrictEqual(['addressTown'])
        expect(error3.message).toBe(
          'Town or city must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
        )

        const error4 = result.error.issues.at(3)
        expect(error4.path).toStrictEqual(['addressCounty'])
        expect(error4.message).toBe(
          'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
        )

        const error5 = result.error.issues.at(4)
        expect(error5.path).toStrictEqual(['addressPostcode'])
        expect(error5.message).toBe('Postcode must only include letters a to z, numbers 0 to 9 or spaces')
      }
    })
    test('InSomewhereElse - invalid postcode characters', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: '',
        ByVideo: '',
        sessionTakePlace: 'InSomewhereElse',
        probationOfficeList: '',
        addressLine1: 'Address 1',
        addressLine2: 'Address 2',
        addressTown: 'Town or city',
        addressCounty: 'County',
        addressPostcode: 'Postcode with invalid character -',
        informedMethods: 'informedByPhone',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['addressPostcode'])
        expect(error.message).toBe('Postcode must only include letters a to z, numbers 0 to 9 or spaces')
      }
    })
  })
  describe('informedMethods', () => {
    test('none selected', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: '',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['informedMethods', 0])
        expect(error.message).toBe('Select how {{ firstname }} was informed about the session')
      }
    })
    test('other selected - no value', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByOtherMethod',
        otherMethodOfContact: '',
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['otherMethodOfContact'])
        expect(error.message).toBe('Enter the other method of contact')
      }
    })
    test('other selected - too long', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByOtherMethod',
        otherMethodOfContact: new Array(51).fill('a').join(''),
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['otherMethodOfContact'])
        expect(error.message).toBe('Other method of contact must be 50 characters or less')
      }
    })
    test('other selected - invalid characters', () => {
      const body = {
        sessionDate: '30/6/2026',
        'sessionTime-hour': '11',
        'sessionTime-minute': '0',
        'sessionTime-meridiem': 'am',
        ByPhone: 'reasons',
        ByVideo: '',
        sessionTakePlace: 'ByPhone',
        probationOfficeList: '',
        addressLine1: '',
        addressLine2: '',
        addressTown: '',
        addressCounty: '',
        addressPostcode: '',
        informedMethods: 'informedByOtherMethod',
        otherMethodOfContact: invalidChars,
      }
      const result = buildScheduleIcsAppointmentFormData(new Date()).safeParse(body)
      expect(result.success).toBeFalsy()
      if (result.error) {
        const error = result.error.issues.at(0)
        expect(error.path).toStrictEqual(['otherMethodOfContact'])
        expect(error.message).toBe(
          'Other method of contact must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
        )
      }
    })
  })
})

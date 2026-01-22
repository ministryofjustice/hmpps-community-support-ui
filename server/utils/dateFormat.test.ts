import dateFormat from './dateFormat'

describe('dateFormat', () => {
  ;[
    {
      date: new Date('2026-01-23T11:40:57+00:00'),
      expected: '23 January 2026',
    },
    {
      date: new Date('2026-02-02T11:40:57+00:00'),
      expected: '2 February 2026',
    },
    {
      date: new Date('2026-03-20T11:40:57+00:00'),
      expected: '20 March 2026',
    },
    {
      date: new Date('2026-04-30T11:40:57+00:00'),
      expected: '30 April 2026',
    },
    {
      date: new Date('2026-05-01T11:40:57+00:00'),
      expected: '1 May 2026',
    },
    {
      date: new Date('2025-06-21T11:40:57+00:00'),
      expected: '21 June 2025',
    },
    {
      date: new Date('2025-07-04T11:40:57+00:00'),
      expected: '4 July 2025',
    },
    {
      date: new Date('2026-08-01T11:40:57+00:00'),
      expected: '1 August 2026',
    },
    {
      date: new Date('2026-09-21T11:40:57+00:00'),
      expected: '21 September 2026',
    },
    {
      date: new Date('2026-10-31T11:40:57+00:00'),
      expected: '31 October 2026',
    },
    {
      date: new Date('2025-11-05T11:40:57+00:00'),
      expected: '5 November 2025',
    },
    {
      date: new Date('1945-12-21T11:40:57+00:00'),
      expected: '21 December 1945',
    },
  ].forEach(({ date, expected }) => {
    test(`${date} should be ${expected}`, () => {
      expect(dateFormat(date)).toStrictEqual(expected)
    })
  })
})

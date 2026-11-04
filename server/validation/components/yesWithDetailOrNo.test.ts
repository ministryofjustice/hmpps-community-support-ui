import { validateYesWithDetailsOrNo } from './yesWithDetailOrNo'

describe('YesWithDetailOrNoSchema', () => {
  describe('raw schema', () => {
    const validator = validateYesWithDetailsOrNo({
      fields: {
        radioFieldName: 'answer',
        detailsFieldName: 'details',
      },
      messages: {
        tooManyCharacters: 'Too many characters',
        nothingSelected: 'Select yes or no',
        noValueGiven: 'Enter details',
      },
    })
    describe('positive', () => {
      ;[
        {
          input: {
            answer: 'No',
            details: '',
          },
          expected: { selected: 'No' },
        },
        {
          input: {
            answer: 'Yes',
            details: 'Some details',
          },
          expected: {
            selected: 'Yes',
            value: 'Some details',
          },
        },
        {
          input: {
            answer: 'No',
            details: '',
          },
          expected: { selected: 'No' },
        },
      ].forEach(({ input, expected }) =>
        test(`${JSON.stringify(input)} should be successful and give ${JSON.stringify(expected)}`, () => {
          const result = validator(input)
          expect(result.success).toBeTruthy()
          expect(result.data.details).toStrictEqual(expected)
        }),
      )
    })
    describe('negative', () => {
      test('nonsense', () => {
        const input = { alice: 'stuff', bob: 'things', charle: 'more things' }
        const result = validator(input)
        expect(result.success).toBeFalsy()
        expect(result.error.issues).toHaveLength(2)
        const [issue1, issue2] = result.error.issues
        expect(issue1).toStrictEqual({
          expected: 'string',
          code: 'invalid_type',
          path: ['details'],
          message: 'Invalid input: expected string, received undefined',
        })
        expect(issue2).toStrictEqual({
          code: 'invalid_value',
          values: ['Yes', 'No'],
          path: ['answer'],
          message: 'Select yes or no',
        })
      })
      ;[
        {
          input: {
            details: '',
          },
          error: 'Select yes or no',
          path: ['answer'],
        },
        {
          input: {
            answer: 'Yes',
            details: '',
          },
          error: 'Enter details',
          path: ['details'],
        },
        {
          input: {
            answer: 'Yes',
            details: new Array(65001).fill('a').join(''),
          },
          error: 'Too many characters',
          path: ['details'],
        },
      ].forEach(({ input, error, path }) =>
        test(`should fail with ${error}`, () => {
          const result = validator(input)
          expect(result.success).toBeFalsy()
          expect(result.error.issues).toHaveLength(1)
          const [issue] = result.error.issues
          expect(issue.message).toBe(error)
          expect(issue.path).toStrictEqual(path)
        }),
      )
    })
  })
  describe('combined', () => {
    const validator = validateYesWithDetailsOrNo({
      fields: {
        radioFieldName: 'has-extra-information',
        detailsFieldName: 'details-text',
      },
      messages: {
        tooManyCharacters: 'Too many characters',
        nothingSelected: 'Select yes or no',
        noValueGiven: 'Enter details',
      },
    })
    describe('positive', () => {
      ;[
        {
          input: {
            input1: 'Alice',
            'has-extra-information': 'No',
            'details-text': '',
          },
          expected: { 'details-text': { selected: 'No' }, input1: 'Alice' },
        },
        {
          input: {
            input1: 'Bob',
            'has-extra-information': 'Yes',
            'details-text': 'Some details',
          },
          expected: {
            'details-text': {
              selected: 'Yes',
              value: 'Some details',
            },
            input1: 'Bob',
          },
        },
        {
          input: {
            input1: 'Charlie',
            'has-extra-information': 'No',
            'details-text': '',
          },
          expected: { 'details-text': { selected: 'No' }, input1: 'Charlie' },
        },
      ].forEach(({ input, expected }) =>
        test(`${JSON.stringify(input)} should be successful and give ${JSON.stringify(expected)}`, () => {
          const result = validator(input)
          expect(result.success).toBeTruthy()
          expect(result.data).toStrictEqual(expected)
        }),
      )
    })
    describe('negative', () => {
      test('nonsense', () => {
        const input = { alice: 'stuff', bob: 'things', charle: 'more things' }
        const result = validator(input)
        expect(result.success).toBeFalsy()
        expect(result.error.issues).toHaveLength(2)
        const [issue1, issue2] = result.error.issues
        expect(issue1).toStrictEqual({
          expected: 'string',
          code: 'invalid_type',
          path: ['details-text'],
          message: 'Invalid input: expected string, received undefined',
        })
        expect(issue2).toStrictEqual({
          code: 'invalid_value',
          values: ['Yes', 'No'],
          path: ['has-extra-information'],
          message: 'Select yes or no',
        })
      })
      ;[
        {
          input: {
            input1: 'David',
            'details-text': '',
          },
          error: 'Select yes or no',
          path: ['has-extra-information'],
        },
        {
          input: {
            input1: 'Eve',
            'has-extra-information': 'Yes',
            'details-text': '',
          },
          error: 'Enter details',
          path: ['details-text'],
        },
        {
          input: {
            input1: 'Trent',
            'has-extra-information': 'Yes',
            'details-text': new Array(65001).fill('a').join(''),
          },
          error: 'Too many characters',
          path: ['details-text'],
        },
      ].forEach(({ input, error, path }) =>
        test(`should fail with ${error}`, () => {
          const result = validator(input)
          expect(result.success).toBeFalsy()
          expect(result.error.issues).toHaveLength(1)
          const [issue] = result.error.issues
          expect(issue.message).toBe(error)
          expect(issue.path).toStrictEqual(path)
        }),
      )
    })
  })
})

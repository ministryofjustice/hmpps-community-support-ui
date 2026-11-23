import {
  buildNotesPathwaysSchema,
  CASE_NOTE_PATHWAY_ERROR,
  NON_CONTACT_SESSION_PATHWAY_ERROR,
  NO_PATHWAY_VALUE,
} from './NotesPathwaysFormData'

describe('buildNotesPathwaysSchema', () => {
  const caseNoteSchema = buildNotesPathwaysSchema(true)
  const nonContactSchema = buildNotesPathwaysSchema(false)

  describe('valid input', () => {
    it.each([
      [
        'a single pathway as a string',
        '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11',
        ['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'],
      ],
      [
        'multiple pathways as an array',
        ['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22'],
        ['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22'],
      ],
      ['the none option on its own', [NO_PATHWAY_VALUE], [NO_PATHWAY_VALUE]],
    ])('accepts %s', (_description, pathways, expected) => {
      const result = caseNoteSchema.safeParse({ pathways })

      expect(result.success).toBe(true)
      expect(result.success && result.data.pathways).toEqual(expected)
    })
  })

  describe('invalid input', () => {
    it('rejects a missing pathways field with the case note error', () => {
      const result = caseNoteSchema.safeParse({})

      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(CASE_NOTE_PATHWAY_ERROR)
    })

    it('rejects an empty array with the non-contact session error', () => {
      const result = nonContactSchema.safeParse({ pathways: [] })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(NON_CONTACT_SESSION_PATHWAY_ERROR)
    })

    it('rejects a value that is not a UUID', () => {
      const result = caseNoteSchema.safeParse({ pathways: ['id-1'] })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(CASE_NOTE_PATHWAY_ERROR)
    })

    it('rejects the none option combined with a pathway', () => {
      const result = caseNoteSchema.safeParse({ pathways: [NO_PATHWAY_VALUE, '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'] })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(CASE_NOTE_PATHWAY_ERROR)
    })
  })

  it('uses the case note error message for case notes', () => {
    expect(CASE_NOTE_PATHWAY_ERROR).toBe(
      "Select what pathway this case note relates to, or select 'it does not relate to a pathway'",
    )
  })

  it('uses the non-contact session error message for non-contact sessions', () => {
    expect(NON_CONTACT_SESSION_PATHWAY_ERROR).toBe('Select what pathway this case note relates to')
  })
})

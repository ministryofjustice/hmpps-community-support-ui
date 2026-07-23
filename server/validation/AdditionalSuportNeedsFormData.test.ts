import { AdditionalSuportNeedsFormDataSchemaBuilder } from './AdditionalSuportNeedsFormData'

const firstName = 'Alex' as const
const someText = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem' as const
describe('AdditionalSuportNeedsFormData', () => {
  describe('selection', () => {
    test('nothing selected missing selection feild', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('AdditionalNeeds')
        expect(error.message).toBe(
          `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
        )
      }
    })
    test('nothing selected - empty array', () => {
      const selection: string[] = []
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: selection,
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('AdditionalNeeds')
        expect(error.message).toBe(
          `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
        )
      }
    })
    test('nothing selected - empty string in array', () => {
      const selection: string[] = ['']
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: selection,
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('AdditionalNeeds')
        expect(error.message).toBe(
          `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
        )
      }
    })
    test('does not need any additional support selected', () => {
      const selection: string[] = ['none']
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: selection,
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('does not need any additional support selected with values', () => {
      const selection: string[] = ['none']
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: selection,
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('nothing selected and something else', () => {
      const selection: string[] = ['none', 'Physical']
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: selection,
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('AdditionalNeeds')
        expect(error.message).toBe(
          `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
        )
      }
    })
  })
  describe('Physical health', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Physical',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: true, value: someText },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Physical',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: true, value: someText },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Physical',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Physical')
        expect(error.message).toBe('Enter details about the physical health issues')
      }
    })
  })

  describe('Mental or emotional health', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: someText,
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Mental',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: true, value: someText },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Mental',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: true, value: someText },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Mental',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Mental')
        expect(error.message).toBe('Enter details about the mental or emotional health issues')
      }
    })
  })

  describe('Neurodiversity', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: someText,
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Neurodiversity',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: true, value: someText },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Neurodiversity',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: true, value: someText },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Neurodiversity',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Neurodiversity')
        expect(error.message).toBe('Enter details about the neurodiversity conditions')
      }
    })
  })

  describe('Location', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: someText,
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Location',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: true, value: someText },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Location',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: true, value: someText },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Location',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Location')
        expect(error.message).toBe('Enter details about the location and travel issues')
      }
    })
  })

  describe('Caring', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: someText,
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Caring',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: true, value: someText },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Caring',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: true, value: someText },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Caring',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Caring')
        expect(error.message).toBe('Enter details about the caring responsibilities')
      }
    })
  })

  describe('Employment', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: someText,
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Employment',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: true, value: someText },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Employment',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: true, value: someText },
        Diversity: { selected: false },
        Anything: { selected: false },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Employment',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Employment')
        expect(error.message).toBe('Enter details about the employment responsibilities')
      }
    })
  })

  describe('Diversity', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: someText,
        AnythingValue: '',
        AdditionalNeeds: 'Diversity',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: true, value: someText },
        Anything: { selected: false },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Diversity',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: true, value: someText },
        Anything: { selected: false },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Diversity',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Diversity')
        expect(error.message).toBe('Enter details about the diversity')
      }
    })
  })

  describe('Anything', () => {
    test('selected with value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: someText,
        AdditionalNeeds: 'Anything',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: true, value: someText },
      })
    })
    test('selected with unselected other values too', () => {
      const formData = {
        PhysicalValue: someText,
        MentalValue: someText,
        NeurodiversityValue: someText,
        LocationValue: someText,
        CaringValue: someText,
        EmploymentValue: someText,
        DiversityValue: someText,
        AnythingValue: someText,
        AdditionalNeeds: 'Anything',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual({
        Physical: { selected: false },
        Mental: { selected: false },
        Neurodiversity: { selected: false },
        Location: { selected: false },
        Caring: { selected: false },
        Employment: { selected: false },
        Diversity: { selected: false },
        Anything: { selected: true, value: someText },
      })
    })
    test('selected but no value', () => {
      const formData = {
        PhysicalValue: '',
        MentalValue: '',
        NeurodiversityValue: '',
        LocationValue: '',
        CaringValue: '',
        EmploymentValue: '',
        DiversityValue: '',
        AnythingValue: '',
        AdditionalNeeds: 'Anything',
      }
      const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
      expect(result.success).toBeFalsy()
      expect(result.error).toBeDefined()
      if (result.error) {
        expect(result.error.issues).toHaveLength(1)
        const error = result.error.issues.at(0)
        expect(error.path).toContain('Anything')
        expect(error.message).toBe('Enter details about any other support needs')
      }
    })
  })
})

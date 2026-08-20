import { AdditionalSupportNeedsDto } from '@community-support-api'
import additionalSupportNeedsResolver from './additionalSupportNeedsResolver'
import { AdditionalSuportNeedsFormData } from '../../validation/AdditionalSuportNeedsFormData'

describe('additionalSupportNeedsResolver', () => {
  const backendData: AdditionalSupportNeedsDto = {
    needsAdditionalSupport: true,
    refereeName: {
      firstName: 'John',
      lastName: 'Doe',
    },
    physicalHealth: {
      selected: 'No',
    },
    mentalEmotionalHealth: {
      selected: 'No',
    },
    neurodiversity: {
      selected: 'No',
    },
    locationTravel: {
      selected: 'No',
    },
    caringResponsibilities: {
      selected: 'No',
    },
    employmentResponsibilities: {
      selected: 'No',
    },
    diversity: {
      selected: 'No',
    },
    anythingElse: {
      selected: 'No',
    },
  }
  test('should return the backend data when postFormData is empty object', () => {
    const result = additionalSupportNeedsResolver({}, backendData)
    expect(result).toEqual(backendData)
  })
  test('should return the form data when postFormData is valid', () => {
    const postFormData: AdditionalSuportNeedsFormData = {
      AdditionalNeeds: ['Physical'],
      PhysicalValue: 'Some physical health issues',
      MentalValue: '',
      NeurodiversityValue: '',
      LocationValue: '',
      CaringValue: '',
      EmploymentValue: '',
      DiversityValue: '',
      AnythingValue: '',
    }
    const result = additionalSupportNeedsResolver(postFormData, backendData)

    const expected: AdditionalSupportNeedsDto = {
      needsAdditionalSupport: true,
      refereeName: {
        firstName: 'John',
        lastName: 'Doe',
      },
      physicalHealth: {
        selected: 'Yes',
        value: 'Some physical health issues',
      },
      mentalEmotionalHealth: {
        selected: 'No',
      },
      neurodiversity: {
        selected: 'No',
      },
      locationTravel: {
        selected: 'No',
      },
      caringResponsibilities: {
        selected: 'No',
      },
      employmentResponsibilities: {
        selected: 'No',
      },
      diversity: {
        selected: 'No',
      },
      anythingElse: {
        selected: 'No',
      },
    }
    expect(result).toStrictEqual(expected)
  })
})

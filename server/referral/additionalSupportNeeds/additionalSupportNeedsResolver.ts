import { AdditionalSupportNeedsDto, Selection } from '@community-support-api'
import {
  AdditionalNeedsType,
  AdditionalSuportNeedsFormData,
  rawFormDataBuilder,
} from '../../validation/AdditionalSuportNeedsFormData'

const getFieldValue = (field: AdditionalNeedsType, formData: AdditionalSuportNeedsFormData) => {
  switch (field) {
    case 'Physical':
      return formData.PhysicalValue
    case 'Mental':
      return formData.MentalValue
    case 'Neurodiversity':
      return formData.NeurodiversityValue
    case 'Location':
      return formData.LocationValue
    case 'Caring':
      return formData.CaringValue
    case 'Employment':
      return formData.EmploymentValue
    case 'Diversity':
      return formData.DiversityValue
    case 'Anything':
      return formData.AnythingValue
    default:
      return ''
  }
}

const selectionFor =
  (formData: AdditionalSuportNeedsFormData) =>
  (field: AdditionalNeedsType): Selection =>
    formData.AdditionalNeeds.includes(field)
      ? {
          selected: 'Yes',
          value: getFieldValue(field, formData).trim(),
        }
      : { selected: 'No' }

const additionalSupportNeedsResolver = (
  postFormData: unknown,
  backendData: AdditionalSupportNeedsDto,
): AdditionalSupportNeedsDto => {
  const result = rawFormDataBuilder(backendData.refereeName.firstName).safeParse(postFormData)
  if (!result.success) {
    return backendData
  }
  const formData: AdditionalSuportNeedsFormData = {
    ...result.data,
    AdditionalNeeds: result.data.AdditionalNeeds || ['none'],
  }
  const getSelectionFor = selectionFor(formData)
  return {
    ...backendData,
    needsAdditionalSupport: true,
    physicalHealth: getSelectionFor('Physical'),
    mentalEmotionalHealth: getSelectionFor('Mental'),
    neurodiversity: getSelectionFor('Neurodiversity'),
    locationTravel: getSelectionFor('Location'),
    caringResponsibilities: getSelectionFor('Caring'),
    employmentResponsibilities: getSelectionFor('Employment'),
    diversity: getSelectionFor('Diversity'),
    anythingElse: getSelectionFor('Anything'),
  }
}
export default additionalSupportNeedsResolver

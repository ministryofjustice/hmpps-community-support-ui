import { Response } from 'express'
import { AdditionalSupportNeedsDto } from '@community-support-api'
import { GovukFrontendCheckboxesItem } from '@govuk-frontend'
import AdditionalSuportNeedsPresenter from './AdditionalSupportNeedsPresenter'
import { AdditionalSuportNeedsViewModel } from './AdditionalSupportNeedsModel'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { WithConditional } from '../../@types/govukFrontend/derived'
import loadContentData from '../../testutils/loadContentData'

const firstName = 'Alex' as const
const lastName = 'Rivers' as const

const pageContent = {
  h1: `What does ${firstName} need support with to attend or take part in sessions?`,
  hint: 'Select all that apply.',
  checkbox1: {
    label: 'Physical health',
    hint: 'For example, physical disabilities or illnesses that affect their daily life.',
    textareaLabel: `Give details of any physical health issues and how the delivery partner can support ${firstName}`,
  },
  checkbox2: {
    label: 'Mental or emotional health',
    hint: 'For example, depression, anxiety, behavioural issues or learning difficulties.',
    textareaLabel: `Give details of any mental or emotional health issues and how the delivery partner can support ${firstName}`,
  },
  checkbox3: {
    label: 'Neurodiversity',
    hint: 'For example, autism, ADHD or dyslexia.',
    textareaLabel: `Give details of any conditions and how the delivery partner can support ${firstName}`,
  },
  checkbox4: {
    label: 'Location and travel',
    hint: 'For example, if they live in a remote area or do not have access to transport.',
    textareaLabel: `Give details of issues regarding travel or location and how this may affect when and where ${firstName} can attend sessions`,
  },
  checkbox5: {
    label: 'Caring responsibilities',
    hint: 'For example, if they care for a child which may limit when they can attend sessions.',
    textareaLabel: `Give details of any caring responsibilities and how this may affect when and where ${firstName} can attend sessions`,
  },
  checkbox6: {
    label: 'Employment responsibilities',
    hint: 'For example, if any work they do may limit when they can attend sessions.',
    textareaLabel: `Give details of any employment responsibilities and how this may affect when and where ${firstName} can attend sessions`,
  },
  checkbox7: {
    label: 'Diversity',
    hint: 'For example, if they have any additional needs regarding their ethnicity, religion, gender identity or sexual orientation.',
    textareaLabel: `Give details of any additional needs ${firstName} has regarding diversity and how the delivery partner can support them`,
  },
  checkbox8: {
    label: 'Anything else',
    hint: 'This includes any other support needs the delivery partner should know about.',
    textareaLabel: `Give details of any other needs and how the delivery partner can support ${firstName}`,
  },
  bodyText: 'or',
  checkbox9: {
    label: `${firstName} does not need any additional support`,
  },
  button: 'Save and continue',
  backlink: '/referral/task-list', // note not included in content document
} as const

const errorMessage = {
  additionalNeeds: `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
  physical: 'Enter details about the physical health issues',
  mental: 'Enter details about the mental or emotional health issues',
  neurodiversity: 'Enter details about the neurodiversity conditions',
  location: 'Enter details about the location and travel issues',
  caring: 'Enter details about the caring responsibilities',
  employment: 'Enter details about the employment responsibilities',
  diversity: 'Enter details about the diversity',
  anything: 'Enter details about any other support needs',
} as const

interface ExpectedItem {
  value: string
  label: string
  hint?: string
  textareaLabel?: string
}

const content = loadContentData('/referral/task-list/additional-support-needs')

describe('AdditionalSupportNeedsPresenter', () => {
  const res = {
    locals: {
      content,
    },
  } as unknown as Response

  const checkCheckboxItem = (item: WithConditional<GovukFrontendCheckboxesItem>, expectedItem: ExpectedItem) => {
    expect(item.value).toBe(expectedItem.value)
    expect(item.text).toBe(expectedItem.label)
    if (item.hint) {
      expect(item.hint.text).toBe(expectedItem.hint)
    }
    if (expectedItem.textareaLabel) {
      expect(item.conditional).toBeDefined()
      expect(item.conditional.html).toContain(`id="${expectedItem.value}Value"`)
      expect(item.conditional.html).toContain(expectedItem.textareaLabel)
    }
  }

  const checkChecklistItems = (items: WithConditional<GovukFrontendCheckboxesItem>[]) => {
    expect(items).toHaveLength(10)
    checkCheckboxItem(items[0], {
      value: 'Physical',
      ...pageContent.checkbox1,
    })
    checkCheckboxItem(items[1], {
      value: 'Mental',
      ...pageContent.checkbox2,
    })
    checkCheckboxItem(items[2], {
      value: 'Neurodiversity',
      ...pageContent.checkbox3,
    })
    checkCheckboxItem(items[3], {
      value: 'Location',
      ...pageContent.checkbox4,
    })
    checkCheckboxItem(items[4], {
      value: 'Caring',
      ...pageContent.checkbox5,
    })
    checkCheckboxItem(items[5], {
      value: 'Employment',
      ...pageContent.checkbox6,
    })
    checkCheckboxItem(items[6], {
      value: 'Diversity',
      ...pageContent.checkbox7,
    })
    checkCheckboxItem(items[7], {
      value: 'Anything',
      ...pageContent.checkbox8,
    })
    expect(items[8]).toMatchObject({ divider: pageContent.bodyText, value: '' })
    const noneOption = items[9]
    checkCheckboxItem(noneOption, {
      value: 'none',
      ...pageContent.checkbox9,
    })
    expect(noneOption.behaviour).toBe('exclusive')
  }

  const checkPageContent = (viewModel: AdditionalSuportNeedsViewModel) => {
    expect(viewModel.heading).toBe(`${firstName} ${lastName}`)
    expect(viewModel.button).toStrictEqual({ text: pageContent.button })
    expect(viewModel.checkList.name).toBe('AdditionalNeeds')
    expect(viewModel.checkList.fieldset.legend.text).toBe(pageContent.h1)
    expect(viewModel.checkList.hint.text).toBe(pageContent.hint)
    expect(viewModel.backLink.href).toBe(pageContent.backlink)
    checkChecklistItems(viewModel.checkList.items)
  }

  const defaultDTO: AdditionalSupportNeedsDto = {
    refereeName: { firstName, lastName },
    needsAdditionalSupport: null,
    physicalHealth: {
      selected: 'Unanswered',
    },
    mentalEmotionalHealth: {
      selected: 'Unanswered',
    },
    neurodiversity: {
      selected: 'Unanswered',
    },
    locationTravel: {
      selected: 'Unanswered',
    },
    caringResponsibilities: {
      selected: 'Unanswered',
    },
    employmentResponsibilities: {
      selected: 'Unanswered',
    },
    diversity: {
      selected: 'Unanswered',
    },
    anythingElse: {
      selected: 'Unanswered',
    },
  }

  const emptyValidationErrors: ErrorMiddlewareErrors = {
    list: [],
    messages: {},
  }

  test('builds the correct view model from default dto data', () => {
    const presenter = new AdditionalSuportNeedsPresenter(defaultDTO, emptyValidationErrors)
    const result = presenter.buildViewModel(res)
    checkPageContent(result)
    // nothing is selected
    expect(result.checkList.items.map(item => item.checked)).not.toContain(true)
  })

  test('builds the correct view model when nothing selected error', () => {
    const validationErrors: ErrorMiddlewareErrors = {
      ...emptyValidationErrors,
      messages: { AdditionalNeeds: { text: errorMessage.additionalNeeds } },
    }

    const presenter = new AdditionalSuportNeedsPresenter(defaultDTO, validationErrors)
    const result = presenter.buildViewModel(res)
    expect(result.checkList.errorMessage.text).toBe(errorMessage.additionalNeeds)
  })
  test('builds the correct view model when everything selected but no values', () => {
    const dto: AdditionalSupportNeedsDto = {
      ...defaultDTO,
      needsAdditionalSupport: true,
      physicalHealth: {
        selected: 'Yes',
        value: '',
      },
      mentalEmotionalHealth: {
        selected: 'Yes',
        value: '',
      },
      neurodiversity: {
        selected: 'Yes',
        value: '',
      },
      locationTravel: {
        selected: 'Yes',
        value: '',
      },
      caringResponsibilities: {
        selected: 'Yes',
        value: '',
      },
      employmentResponsibilities: {
        selected: 'Yes',
        value: '',
      },
      diversity: {
        selected: 'Yes',
        value: '',
      },
      anythingElse: {
        selected: 'Yes',
        value: '',
      },
    }

    const validationErrors: ErrorMiddlewareErrors = {
      ...emptyValidationErrors,
      messages: {
        PhysicalValue: { text: errorMessage.physical },
        MentalValue: { text: errorMessage.mental },
        NeurodiversityValue: { text: errorMessage.neurodiversity },
        LocationValue: { text: errorMessage.location },
        CaringValue: { text: errorMessage.caring },
        EmploymentValue: { text: errorMessage.employment },
        DiversityValue: { text: errorMessage.diversity },
        AnythingValue: { text: errorMessage.anything },
      },
    }

    const presenter = new AdditionalSuportNeedsPresenter(dto, validationErrors)
    const result = presenter.buildViewModel(res)
    expect(result.checkList.errorMessage).toBeUndefined()
    expect(result.checkList.items[0].conditional.html).toContain(errorMessage.physical)
    expect(result.checkList.items[1].conditional.html).toContain(errorMessage.mental)
    expect(result.checkList.items[2].conditional.html).toContain(errorMessage.neurodiversity)
    expect(result.checkList.items[3].conditional.html).toContain(errorMessage.location)
    expect(result.checkList.items[4].conditional.html).toContain(errorMessage.caring)
    expect(result.checkList.items[5].conditional.html).toContain(errorMessage.employment)
    expect(result.checkList.items[6].conditional.html).toContain(errorMessage.diversity)
    expect(result.checkList.items[7].conditional.html).toContain(errorMessage.anything)
  })
  test('builds the correct view model when prepopulated with no needs', () => {
    const dto: AdditionalSupportNeedsDto = {
      ...defaultDTO,
      needsAdditionalSupport: false,
    }

    const presenter = new AdditionalSuportNeedsPresenter(dto, emptyValidationErrors)
    const result = presenter.buildViewModel(res)
    expect(result.checkList.items[9].checked).toBe(true)
  })

  test('builds the correct view model when prepopulated with all needs filled', () => {
    const details = {
      physicalHealth: 'physical health condition',
      mentalEmotionalHealth: 'mental health condition',
      neurodiversity: 'some kind of neurodiversity',
      locationTravel: 'some travel restriction of some kind',
      caringResponsibilities: 'caring responsibilities of some kind',
      employmentResponsibilities: 'some kind of employment responsibility',
      diversity: 'some kind of diversity need',
      anythingElse: 'something else also',
    }
    const dto: AdditionalSupportNeedsDto = {
      ...defaultDTO,
      needsAdditionalSupport: true,
      physicalHealth: {
        selected: 'Yes',
        value: details.physicalHealth,
      },
      mentalEmotionalHealth: {
        selected: 'Yes',
        value: details.mentalEmotionalHealth,
      },
      neurodiversity: {
        selected: 'Yes',
        value: details.neurodiversity,
      },
      locationTravel: {
        selected: 'Yes',
        value: details.locationTravel,
      },
      caringResponsibilities: {
        selected: 'Yes',
        value: details.caringResponsibilities,
      },
      employmentResponsibilities: {
        selected: 'Yes',
        value: details.employmentResponsibilities,
      },
      diversity: {
        selected: 'Yes',
        value: details.diversity,
      },
      anythingElse: {
        selected: 'Yes',
        value: details.anythingElse,
      },
    }

    const presenter = new AdditionalSuportNeedsPresenter(dto, emptyValidationErrors)
    const result = presenter.buildViewModel(res)
    expect(result.checkList.items[0].conditional.html).toContain(`>${details.physicalHealth}</textarea>`)
    expect(result.checkList.items[1].conditional.html).toContain(`>${details.mentalEmotionalHealth}</textarea>`)
    expect(result.checkList.items[2].conditional.html).toContain(`>${details.neurodiversity}</textarea>`)
    expect(result.checkList.items[3].conditional.html).toContain(`>${details.locationTravel}</textarea>`)
    expect(result.checkList.items[4].conditional.html).toContain(`>${details.caringResponsibilities}</textarea>`)
    expect(result.checkList.items[5].conditional.html).toContain(`>${details.employmentResponsibilities}</textarea>`)
    expect(result.checkList.items[6].conditional.html).toContain(`>${details.diversity}</textarea>`)
    expect(result.checkList.items[7].conditional.html).toContain(`>${details.anythingElse}</textarea>`)
  })
})

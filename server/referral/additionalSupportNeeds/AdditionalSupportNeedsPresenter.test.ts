import { Response } from 'express'
import { AdditionalSupportNeedsDto } from '@community-support-api'
import AdditionalSuportNeedsPresenter from './AdditionalSupportNeedsPresenter'

describe('AdditionalSupportNeedsPresenter', () => {
  test('creates the correct view model', () => {
    const content = {
      header: 'What does {{ firstname }} need support with to attend or take part in sessions?',
      hint: 'Select all that apply.',
      items: [
        {
          label: 'Physical health',
          hint: 'For example, physical disabilities or illnesses that affect their daily life.',
          detailsLabel:
            'Give details of any physical health issues and how the delivery partner can support {{ firstName }}',
        },
        {
          label: 'Mental or emotional health',
          hint: 'For example, depression, anxiety, behavioural issues and learning difficulties.',
          detailsLabel:
            'Give details of any mental or emotional health issues and how the delivery partner can support {{ firstName }}',
        },
        {
          label: 'Neurodiversity',
          hint: 'For example, autism, ADHD or dyslexia.',
          detailsLabel: 'Give details of any conditions and how the delivery partner can support {{ firstName}}',
        },
        {
          label: 'Location and travel',
          hint: 'For example, if they live in a remote area or do not have access to transport.',
          detailsLabel:
            'Give details of issues regarding travel or location and how this may affect when and where {{ firstName }} can attend sessions',
        },
        {
          label: 'Caring responsibilities',
          hint: 'For example, if they care for a child which may limit when they can attend sessions.',
          detailsLabel:
            'Give details of any caring responsibilities and how this may affect when and where {{ firstName }} can attend sessions ',
        },
        {
          label: 'Employment responsibilities',
          hint: 'For example, if any work they do may limit when they can attend sessions.',
          detailsLabel:
            'Give details of any employment responsibilities and how this may affect when and where {{ firstName }} can attend sessions',
        },
        {
          label: 'Diversity',
          hint: 'For example, if they have any additional needs regarding their ethnicity, religion, gender identity or sexual orientation.',
          detailsLabel:
            'Give details of any additional needs {{ firstName }} has regarding diversity and how the delivery partner can support them ',
        },
        {
          label: 'Anything else',
          hint: 'This includes any other support needs the delivery partner should know about.',
          detailsLabel: 'Give details of any other needs and how the delivery partner can support {{ firstName }}',
        },
      ],
      defaultItemLabel: '{{ firstname }} does not need any additional support',
    }
    const res = {
      locals: {
        content,
      },
    } as unknown as Response
    const dto: AdditionalSupportNeedsDto = {
      refereeName: { firstName: 'Alex', lastName: 'River' },
      needsAdditionalSupport: false,
    }
    const presenter = new AdditionalSuportNeedsPresenter(dto)
    const result = presenter.buildViewModel(res)
    expect(result).toBeDefined()
    // TODO rest of this test
  })
})

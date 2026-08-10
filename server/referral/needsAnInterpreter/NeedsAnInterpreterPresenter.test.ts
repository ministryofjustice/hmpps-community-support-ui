import { Response } from 'express'
import { NeedsInterpreterBffResponseDto } from '@community-support-api'
import NeedsAnInterpreterPresenter from './NeedsAnInterpreterPresenter'
import { ErrorMiddlewareErrors } from '../../@types/express'
import loadContentData from '../../testutils/loadContentData'

const firstName = 'Alex' as const

const pageContent = {
  h2: `Does ${firstName} need an interpreter?`,
  radio1: {
    label: 'Yes',
    textareaLabel: `What language does ${firstName} need an interpreter for?`,
  },
  radio2: {
    label: 'No',
  },
  button: 'Save and continue',
} as const

const errorMessage = {
  needsInterpreter: `Select yes if ${firstName} needs an interpreter`,
  language: `Enter the language ${firstName} needs an interpreter for`,
} as const

const content = loadContentData('/referral/task-list/needs-an-interpreter')

describe('NeedsAnInterpreterPresenter', () => {
  describe('buildViewModel', () => {
    const res = {
      locals: {
        content,
      },
    } as unknown as Response

    test('buildViewModel creates radios with empty conditional text when no language is selected', () => {
      const dto: NeedsInterpreterBffResponseDto = {
        refereeName: { firstName: 'Alex', lastName: 'River' },
        language: { selected: 'Unanswered' },
      }

      const presenter = new NeedsAnInterpreterPresenter(dto, { list: [], messages: {} })
      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.backLink.href).toBe('/referral/task-list/additional-support-needs')
      expect(viewModel.button).toStrictEqual({ text: pageContent.button })
      expect(viewModel.radios.name).toBe('needsInterpreter')
      expect(viewModel.radios.fieldset.legend.text).toBe(pageContent.h2)
      expect(viewModel.radios.items).toHaveLength(2)

      const [yesRadio, noRadio] = viewModel.radios.items

      expect(yesRadio.value).toBe(pageContent.radio1.label)
      expect(yesRadio.text).toBe(pageContent.radio1.label)
      expect(yesRadio.checked).toBeNull()
      expect(yesRadio.conditional.html).toContain(pageContent.radio1.textareaLabel)
      expect(yesRadio.conditional.html).toContain('name="language"')
      expect(yesRadio.conditional.html).toContain('></textarea>') // ie empty text area

      expect(noRadio.value).toBe(pageContent.radio2.label)
      expect(noRadio.text).toBe(pageContent.radio2.label)
      expect(noRadio.checked).toBeNull()

      expect(viewModel.button.text).toBe(pageContent.button)
    })

    test('buildViewModel selects the yes option and preserves the saved language', () => {
      const dto: NeedsInterpreterBffResponseDto = {
        refereeName: { firstName: 'Alex', lastName: 'River' },
        language: {
          selected: 'Yes',
          value: 'French',
        },
      }

      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: {},
      }

      const presenter = new NeedsAnInterpreterPresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)

      const [yesRadio, noRadio] = viewModel.radios.items

      expect(yesRadio).toBeDefined()
      expect(noRadio).toBeDefined()

      expect(yesRadio.checked).toBe(true)
      expect(yesRadio.conditional.html).toContain('>French</textarea>')
      expect(noRadio.checked).toBe(false)
    })

    test('buildViewModel displays the correct error message when nothing is selected', () => {
      const dto: NeedsInterpreterBffResponseDto = {
        refereeName: { firstName: 'Alex', lastName: 'River' },
        language: { selected: 'Unanswered' },
      }

      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: { needsInterpreter: { text: errorMessage.needsInterpreter } },
      }

      const presenter = new NeedsAnInterpreterPresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)

      const [yesRadio, noRadio] = viewModel.radios.items
      // nothing checked
      expect(yesRadio.checked).toBeNull()
      expect(noRadio.checked).toBeNull()
      expect(viewModel.radios.errorMessage.text).toBe(errorMessage.needsInterpreter)
    })

    test('buildViewModel displays the correct error message when no language is given', () => {
      const dto: NeedsInterpreterBffResponseDto = {
        refereeName: { firstName: 'Alex', lastName: 'River' },
        language: { selected: 'Yes', value: '' },
      }

      const validationErrors: ErrorMiddlewareErrors = {
        list: [],
        messages: { language: { text: errorMessage.language } },
      }

      const presenter = new NeedsAnInterpreterPresenter(dto, validationErrors)
      const viewModel = presenter.buildViewModel(res)

      const [yesRadio, noRadio] = viewModel.radios.items
      // yes checked
      expect(yesRadio.checked).toBe(true)
      expect(noRadio.checked).toBe(false)
      expect(yesRadio.conditional.html).toContain(errorMessage.language)
    })
  })
})

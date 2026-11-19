import NotesTypePresenter from './notesTypePresenter'
import { globalContent } from '../../../assets/content/GlobalContent'

describe('NotesTypePresenter', () => {
  const caseReference = 'AB1234CD'
  const content = globalContent['/referral/:id/notes/type']

  test('builds correct view model', () => {
    const viewModel = new NotesTypePresenter(caseReference).buildViewModel()

    expect(viewModel.pageHeader).toBe(content.pageHeader)
    expect(viewModel.backLink.href).toBe(`/referral/${caseReference}/notes`)
    expect(viewModel.description).toBe(content.description)
    expect(viewModel.details.summaryText).toBe(content.detailsTitle)
    expect(viewModel.details.html).toContain(content.detailsDescription)
    expect(viewModel.noteTypeRadio.items[0].text).toBe(content.radioCaseNote)
    expect(viewModel.noteTypeRadio.items[1].text).toBe(content.radioNonContactActivity)
    expect(viewModel.continueButton.text).toBe(content.continueText)
    expect(viewModel.continueButtonLink).toBe(`/referral/${caseReference}/notes/type`)
  })

  test('persists checked radio from session data', () => {
    const viewModel = new NotesTypePresenter(caseReference, { noteType: 'CASE_NOTE' }).buildViewModel()

    expect(viewModel.noteTypeRadio.items[0].checked).toBe(true)
    expect(viewModel.noteTypeRadio.items[1].checked).toBe(false)
  })
})

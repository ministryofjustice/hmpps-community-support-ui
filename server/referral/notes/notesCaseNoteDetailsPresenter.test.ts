import { globalContent } from '../../../assets/content/GlobalContent'
import NotesCaseNoteDetailsPresenter from './notesCaseNoteDetailsPresenter'
import { ErrorMiddlewareErrors } from '../../@types/express'

describe('NotesCaseNoteDetailsPresenter', () => {
  const caseReference = 'AB1234CD'
  const content = globalContent.referral.id.notes['case-note-details']

  test('build static content in view model', () => {
    const viewModel = new NotesCaseNoteDetailsPresenter(caseReference).buildViewModel()

    expect(viewModel.pageHeader).toBe(content.pageHeader)
    expect(viewModel.titleInput.label.text).toBe(content.titleLabel)
    expect(viewModel.detailsCharacterCount.label.text).toBe(content.detailsLabel)
    expect(viewModel.shouldNotifyRadio.fieldset.legend.text).toBe(content.shouldNotifyLabel)
    expect(viewModel.shouldNotifyRadio.hint)
  })

  test('persists inputs from session data', () => {
    const viewModel = new NotesCaseNoteDetailsPresenter(caseReference, { noteType: 'CASE_NOTE', title: 'Note title', details: 'Note details', shouldNotify: true }).buildViewModel()

    expect(viewModel.titleInput.value).toEqual('Note title')
    expect(viewModel.detailsCharacterCount.value).toEqual('Note details')
    expect(viewModel.shouldNotifyRadio.items[0].checked).toBe(true)
  })

  test('persists should notify radio correctly', () => {
    let viewModel = new NotesCaseNoteDetailsPresenter(caseReference, {
      noteType: 'CASE_NOTE',
      title: 'Note title',
      details: 'Note details',
    }).buildViewModel()
    expect(viewModel.shouldNotifyRadio.items[0].checked).toBe(false)
    expect(viewModel.shouldNotifyRadio.items[1].checked).toBe(false)

    viewModel = new NotesCaseNoteDetailsPresenter(caseReference, {
      noteType: 'CASE_NOTE',
      title: 'Note title',
      details: 'Note details',
      shouldNotify: true,
    }).buildViewModel()
    expect(viewModel.shouldNotifyRadio.items[0].checked).toBe(true)
    expect(viewModel.shouldNotifyRadio.items[1].checked).toBe(false)

    viewModel = new NotesCaseNoteDetailsPresenter(caseReference, {
      noteType: 'CASE_NOTE',
      title: 'Note title',
      details: 'Note details',
      shouldNotify: false,
    }).buildViewModel()
    expect(viewModel.shouldNotifyRadio.items[0].checked).toBe(false)
    expect(viewModel.shouldNotifyRadio.items[1].checked).toBe(true)
  })

  test('shows validation errors correctly', () => {
    const validationErrors: ErrorMiddlewareErrors = {
      list: [
        { text: 'Enter a title for the case note' },
        { text: 'Enter the details of the case note' },
        { text: 'Select whether you want to send an email to the probation practitioner' },
      ],
      messages: {
        titleInput: { text: 'Enter a title for the case note' },
        detailsInput: { text: 'Enter the details of the case note' },
        shouldNotify: { text: 'Select whether you want to send an email to the probation practitioner' },
      },
    }

    const viewModel = new NotesCaseNoteDetailsPresenter(caseReference, undefined, validationErrors).buildViewModel()
    expect(viewModel.titleInput.errorMessage.text).toEqual('Enter a title for the case note')
    expect(viewModel.detailsCharacterCount.errorMessage.text).toEqual('Enter the details of the case note')
    expect(viewModel.shouldNotifyRadio.errorMessage.text).toEqual(
      'Select whether you want to send an email to the probation practitioner',
    )
  })
})

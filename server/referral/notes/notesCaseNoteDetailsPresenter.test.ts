import { globalContent } from '../../../assets/content/GlobalContent'
import NotesCaseNoteDetailsPresenter from './notesCaseNoteDetailsPresenter'

describe('NotesCaseNoteDetailsPresenter', () => {
  const caseReference = 'AB1234CD'
  const content = globalContent.referral.id.notes['case-note-details']

  test('build correct view model', () => {
    const viewModel = new NotesCaseNoteDetailsPresenter(caseReference).buildViewModel()

    expect(viewModel.pageHeader).toBe(content.pageHeader)
    expect(viewModel.titleInput.label).toBe(content.titleLabel)
    expect(viewModel.detailsCharacterCount.label).toBe(content.detailsLabel)
    expect(viewModel.shouldNotifyRadio.fieldset.legend.text).toBe(content.shouldNotifyLabel)
    expect(viewModel.shouldNotifyRadio.hint)
  })
})

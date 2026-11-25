import type { ReferenceDataReferralPathwaysDto } from '@community-support-api'
import { globalContent } from '../../../assets/content/GlobalContent'
import NotesCheckYourAnswersPresenter from './notesCheckYourAnswersPresenter'
import { NO_PATHWAY_VALUE } from '../../validation/NotesPathwaysFormData'
import { NoteData } from '../../@types/express'

describe('NotesCheckYourAnswersPresenter', () => {
  const caseReference = 'AB1234CD'
  const content = globalContent.referral.id.notes['check-your-answers']
  const accommodationId = '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'
  const employmentId = '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22'
  const pathwaysResponse: ReferenceDataReferralPathwaysDto = {
    pathways: [
      { id: accommodationId, title: 'Accommodation' },
      { id: employmentId, title: 'Employment' },
    ],
  }
  const caseNote: NoteData = {
    noteType: 'CASE_NOTE',
    pathways: [accommodationId, employmentId],
    title: 'Note title',
    details: 'Line one\nLine two',
    shouldNotify: true,
  }

  const buildRows = (sessionData: NoteData, pathways = pathwaysResponse) =>
    new NotesCheckYourAnswersPresenter(caseReference, sessionData, pathways).buildViewModel().summaryList.rows

  it('builds the case note summary rows with change links', () => {
    const rows = buildRows(caseNote)

    expect(rows.map(row => row.key)).toEqual([
      { text: content.noteTypeLabel },
      { text: content.pathwayLabel },
      { text: content.caseNoteTitleLabel },
      { text: content.caseNoteDetailsLabel },
      { text: content.shouldNotifyLabel },
    ])
    expect(rows[0].value).toEqual({ text: content.caseNoteType })
    expect(rows[1].value).toEqual({ html: 'Accommodation<br>Employment' })
    expect(rows[2].value).toEqual({ text: 'Note title' })
    expect(rows[3].value).toEqual({ html: 'Line one<br>Line two' })
    expect(rows[4].value).toEqual({ text: content.yesText })
    expect(rows[1].actions.items[0].href).toBe(`/referral/${caseReference}/notes/pathways`)
    expect(rows[2].actions.items[0].href).toBe(`/referral/${caseReference}/notes/case-note-details`)
  })

  it('shows the no pathway text when the none option is selected', () => {
    const rows = buildRows({ ...caseNote, pathways: [NO_PATHWAY_VALUE] })

    expect(rows[1].value).toEqual({ text: content.noPathwayText })
  })

  it('shows No when the probation practitioner should not be emailed', () => {
    const rows = buildRows({ ...caseNote, shouldNotify: false })

    expect(rows[4].value).toEqual({ text: content.noText })
  })

  it('escapes user-entered text in the summary', () => {
    const rows = buildRows({ ...caseNote, title: '<b>bold</b>', details: '<script>x</script>' })

    expect(rows[2].value).toEqual({ text: '<b>bold</b>' })
    expect(rows[3].value).toEqual({ html: '&lt;script&gt;x&lt;/script&gt;' })
  })

  it('shows the type, pathway, title and details rows with activity labels for a non-contact activity note', () => {
    const rows = buildRows({
      noteType: 'NON_CONTACT_SESSION',
      pathways: [employmentId],
      title: 'Activity title',
      details: 'Activity details',
    })

    expect(rows).toHaveLength(4)
    expect(rows[0].value).toEqual({ text: content.nonContactNoteType })
    expect(rows[1].value).toEqual({ html: 'Employment' })
    expect(rows[2].key).toEqual({ text: content.nonContactTitleLabel })
    expect(rows[2].value).toEqual({ text: 'Activity title' })
    expect(rows[3].key).toEqual({ text: content.nonContactDetailsLabel })
    expect(rows[3].value).toEqual({ html: 'Activity details' })
  })

  it('builds the page header and submit button', () => {
    const viewModel = new NotesCheckYourAnswersPresenter(caseReference, caseNote, pathwaysResponse).buildViewModel()

    expect(viewModel.pageHeader).toBe(content.pageHeader)
    expect(viewModel.detailsSubHeader).toBe(content.detailsSubHeader)
    expect(viewModel.submitButton.text).toBe(content.submitButtonText)
    expect(viewModel.submitHref).toBe(`/referral/${caseReference}/notes/check-your-answers`)
  })

  it('links back to case note details for a case note', () => {
    const viewModel = new NotesCheckYourAnswersPresenter(caseReference, caseNote, pathwaysResponse).buildViewModel()

    expect(viewModel.backLink.href).toBe(`/referral/${caseReference}/notes/case-note-details`)
  })

  it('links back to non-contact session details for a non-contact activity note', () => {
    const viewModel = new NotesCheckYourAnswersPresenter(
      caseReference,
      { ...caseNote, noteType: 'NON_CONTACT_SESSION' },
      pathwaysResponse,
    ).buildViewModel()

    expect(viewModel.backLink.href).toBe(`/referral/${caseReference}/notes/non-contact-session-details`)
  })
})

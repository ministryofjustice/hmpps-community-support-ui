import type { ReferenceDataReferralPathwaysDto } from '@community-support-api'
import NotesPathwaysPresenter from './notesPathwaysPresenter'
import { ErrorMiddlewareErrors } from '../../@types/express'

describe('NotesPathwaysPresenter', () => {
  const caseReference = 'AB1234CD'
  const pathwaysResponse: ReferenceDataReferralPathwaysDto = {
    pathways: [
      { id: '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', title: 'Accommodation' },
      { id: '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22', title: 'Employment' },
    ],
  }

  it('maps each pathway to a checkbox item', () => {
    const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference).buildViewModel()

    expect(model.checkboxes.name).toBe('pathways')
    expect(model.checkboxes.items).toEqual([
      { value: '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', text: 'Accommodation' },
      { value: '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22', text: 'Employment' },
    ])
  })

  it('uses the page content for the heading, hint and button', () => {
    const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference, 'CASE_NOTE').buildViewModel()

    expect(model.pageHeader).toBe('What pathway does this note relate to?')
    expect(model.checkboxes.hint?.text).toBe('Select all that apply.')
    expect(model.button.text).toBe('Continue')
  })

  it('links the back link to the note type page', () => {
    const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference).buildViewModel()

    expect(model.backLink.href).toBe(`/referral/${caseReference}/notes/type`)
  })

  it('renders an empty item list when there are no pathways', () => {
    const model = new NotesPathwaysPresenter({ pathways: [] }, caseReference).buildViewModel()

    expect(model.checkboxes.items).toEqual([])
  })

  describe('when the note type is a case note', () => {
    it('sets the case note page title', () => {
      const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference, 'CASE_NOTE').buildViewModel()

      expect(model.pageTitle).toBe('What pathway does this case note relate to? - Community Support')
    })

    it('adds an "or" divider and an exclusive "does not relate" option after the pathways', () => {
      const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference, 'CASE_NOTE').buildViewModel()

      expect(model.checkboxes.items).toEqual([
        { value: '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', text: 'Accommodation' },
        { value: '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22', text: 'Employment' },
        { divider: 'or', value: '' },
        { value: 'NONE', text: 'It does not relate to a pathway option', behaviour: 'exclusive' },
      ])
    })
  })

  describe('when the note type is a non-contact session', () => {
    it('sets the non-contact activity page title', () => {
      const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference, 'NON_CONTACT_SESSION').buildViewModel()

      expect(model.pageTitle).toBe(
        'What pathway does this non-contact activity note relate to? - Community Support',
      )
    })

    it('does not add the divider or the "does not relate" option', () => {
      const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference, 'NON_CONTACT_SESSION').buildViewModel()

      expect(model.pageHeader).toBe('What pathway does this non-contact activity note relate to?')
      expect(model.checkboxes.items).toEqual([
        { value: '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', text: 'Accommodation' },
        { value: '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22', text: 'Employment' },
      ])
    })
  })

  describe('validation errors', () => {
    it('sets the checkbox error message from the pathways validation error', () => {
      const validationErrors: ErrorMiddlewareErrors = {
        list: [{ text: 'Select at least one pathway', href: '#pathways' }],
        messages: { pathways: { text: 'Select at least one pathway' } },
      }

      const model = new NotesPathwaysPresenter(
        pathwaysResponse,
        caseReference,
        'NON_CONTACT_SESSION',
        validationErrors,
      ).buildViewModel()

      expect(model.checkboxes.errorMessage).toEqual({ text: 'Select at least one pathway' })
    })

    it('has no checkbox error message when there are no validation errors', () => {
      const model = new NotesPathwaysPresenter(pathwaysResponse, caseReference).buildViewModel()

      expect(model.checkboxes.errorMessage).toBeNull()
    })
  })
})

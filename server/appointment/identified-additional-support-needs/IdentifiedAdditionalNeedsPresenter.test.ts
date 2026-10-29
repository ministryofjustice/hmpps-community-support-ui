import { Response } from 'express'
import { ExistingSupportNeedsBffResponseDto } from '@community-support-api'
import contentJson from '../../../assets/content/content.json'
import IdentifiedAdditionalNeedsPresenter from './IdentifiedAdditionalNeedsPresenter'
import { IdentifiedAdditionalNeedsContent } from './IdentifiedAdditionalNeedsViewModel'

describe('IdentifiedAdditionalNeedsPresenter', () => {
  const caseRefId = 'ics-test-123'
  const firstName = 'Alex'
  let content: IdentifiedAdditionalNeedsContent
  let res: Response
  let existingSupportNeeds: ExistingSupportNeedsBffResponseDto

  beforeEach(() => {
    content = contentJson['/ics-feedback/:id/identified-additional-needs']
    res = {
      locals: { content },
      render: jest.fn(),
    } as unknown as Response
    existingSupportNeeds = {
      referralFirstName: firstName,
      supportNeeds: {},
    }
  })

  describe('renderPage', () => {
    it('renders the identified-additional-needs template with the view model', () => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {})

      presenter.renderPage(res)

      expect(res.render).toHaveBeenCalledTimes(1)
      expect(res.render).toHaveBeenCalledWith('appointment/identifiedAdditionalNeeds', {
        content: presenter.buildViewModel(res),
      })
    })
  })

  describe('buildViewModel', () => {
    it('includes page content, personalised text and navigation links', () => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {})

      const viewModel = presenter.buildViewModel(res)

      expect(viewModel).toMatchObject({
        pageTitle: content.pageTitle,
        pageHeader: content.pageHeader,
        pageSubHeader: content.pageSubHeader.replace('{{ firstname }}', firstName),
        firstname: firstName,
        submitButton: { text: content.submitButtonText },
        submitHref: `/ics-feedback/${caseRefId}/identified-additional-needs`,
        backLink: { href: `/ics-feedback/${caseRefId}/issues-or-concerns` },
      })
      expect(viewModel.didYouIdentifyRadio).toMatchObject({
        name: 'didYouIdentify',
        fieldset: {
          attributes: { 'data-testid': 'fieldset-didYouIdentify' },
          legend: {
            text: content.didYouIdentifyRadio.title.replace('{{ firstname }}', firstName),
            isPageHeading: false,
            classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
          },
        },
        attributes: { 'data-testid': 'didYouIdentify' },
      })
    })

    it('leaves both radio options unselected when form data is missing', () => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, undefined)

      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.formData).toEqual({})
      expect(viewModel.didYouIdentifyRadio.items).toEqual([
        {
          id: 'YesRadio',
          value: 'Yes',
          text: 'Yes',
          checked: false,
          conditional: { html: expect.any(String) },
        },
        { id: 'NoRadio', value: 'No', text: 'No', checked: false },
      ])
      expect(viewModel.didYouIdentifyRadio.items[0].conditional.html).toContain(
        'name=identifyDetails rows="5" spellcheck="false" ></textarea>',
      )
    })

    it.each([true, false])('restores a previously selected answer of %s', didYouIdentify => {
      const formData = { didYouIdentify, identifyDetails: 'Help with reading' }
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, formData)

      const viewModel = presenter.buildViewModel(res)

      expect(viewModel.formData).toEqual(formData)
      expect(viewModel.didYouIdentifyRadio.items[0].checked).toBe(didYouIdentify)
      expect(viewModel.didYouIdentifyRadio.items[1].checked).toBe(!didYouIdentify)
      expect(viewModel.didYouIdentifyRadio.items[0].conditional.html).toContain('>Help with reading</textarea>')
    })

    it('personalises the conditional textarea label and sets its field identifiers', () => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {})

      const { html } = presenter.buildViewModel(res).didYouIdentifyRadio.items[0].conditional

      expect(html).toContain('data-testid=identifyDetails')
      expect(html).toContain('id=identifyDetailsLabel')
      expect(html).toContain(
        content.didYouIdentifyRadio.items.identifyDetailsLabel.replace('{{ firstname }}', firstName),
      )
      expect(html).toContain('id=identifyDetailsInput name=identifyDetails')
    })

    it('escapes special characters in previously entered details', () => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {
        didYouIdentify: true,
        identifyDetails: '<script>alert("test")</script> & \'details\'',
      })

      const { html } = presenter.buildViewModel(res).didYouIdentifyRadio.items[0].conditional

      expect(html).toContain('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt; &amp; &apos;details&apos;')
      expect(html).not.toContain('<script>')
    })

    it('shows radio and textarea validation errors while retaining form values', () => {
      const radioError = { text: 'Select yes or no' }
      const detailsError = { text: 'Enter details of the additional support needs' }
      const presenter = new IdentifiedAdditionalNeedsPresenter(
        caseRefId,
        firstName,
        existingSupportNeeds,
        { didYouIdentify: true, identifyDetails: 'Existing details' },
        {
          list: [
            { href: '#didYouIdentify', text: radioError.text },
            { href: '#identifyDetailsInput', text: detailsError.text },
          ],
          messages: { didYouIdentify: radioError, identifyDetails: detailsError },
        },
      )

      const viewModel = presenter.buildViewModel(res)
      const { html } = viewModel.didYouIdentifyRadio.items[0].conditional

      expect(viewModel.didYouIdentifyRadio.errorMessage).toEqual(radioError)
      expect(viewModel.didYouIdentifyRadio.items[0].checked).toBe(true)
      expect(html).toContain('govuk-form-group--error')
      expect(html).toContain('id="identifyDetailsError" class="govuk-error-message"')
      expect(html).toContain(detailsError.text)
      expect(html).toContain('>Existing details</textarea>')
    })

    it.each([undefined, { list: [], messages: {} }])('does not show validation errors when errors are %j', errors => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {}, errors)

      const viewModel = presenter.buildViewModel(res)
      const { html } = viewModel.didYouIdentifyRadio.items[0].conditional

      expect(viewModel.didYouIdentifyRadio.errorMessage).toBeUndefined()
      expect(html).not.toContain('govuk-form-group--error')
      expect(html).not.toContain('govuk-error-message')
    })
  })

  describe('existing support needs', () => {
    it('renders all populated support needs in order with the card title', () => {
      existingSupportNeeds.supportNeeds = {
        physicalHealthDetails: 'Physical health support',
        mentalEmotionalHealthDetails: 'Mental health support',
        neurodiversityDetails: 'Neurodiversity support',
        locationTravelDetails: 'Travel support',
        caringResponsibilitiesDetails: 'Caring support',
        employmentResponsibilitiesDetails: 'Employment support',
        diversityDetails: 'Diversity support',
        anythingElseDetails: 'Other support',
      }
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {})

      const summaryList = presenter.buildViewModel(res).existingSupportNeedsDetails

      expect(summaryList).toEqual({
        card: { title: { text: content.cardTitle } },
        rows: [
          { key: { text: content.supportNeedsTitle.physicalHealth }, value: { html: 'Physical health support' } },
          { key: { text: content.supportNeedsTitle.mentalEmotionalHealth }, value: { html: 'Mental health support' } },
          { key: { text: content.supportNeedsTitle.neurodiversity }, value: { html: 'Neurodiversity support' } },
          { key: { text: content.supportNeedsTitle.locationTravel }, value: { html: 'Travel support' } },
          { key: { text: content.supportNeedsTitle.caringResponsibilities }, value: { html: 'Caring support' } },
          {
            key: { text: content.supportNeedsTitle.employmentResponsibilities },
            value: { html: 'Employment support' },
          },
          { key: { text: content.supportNeedsTitle.diversity }, value: { html: 'Diversity support' } },
          { key: { text: content.supportNeedsTitle.anythingElse }, value: { html: 'Other support' } },
        ],
        attributes: { 'data-testid': 'exisiting-support-needs-details' },
      })
    })

    it('omits empty, null and missing support needs', () => {
      existingSupportNeeds.supportNeeds = {
        physicalHealthDetails: '',
        mentalEmotionalHealthDetails: null,
        neurodiversityDetails: 'Use plain language',
      }
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {})

      expect(presenter.buildViewModel(res).existingSupportNeedsDetails.rows).toEqual([
        { key: { text: content.supportNeedsTitle.neurodiversity }, value: { html: 'Use plain language' } },
      ])
    })

    it('returns an empty list of rows when no support needs are populated', () => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, existingSupportNeeds, {})

      expect(presenter.buildViewModel(res).existingSupportNeedsDetails.rows).toEqual([])
    })

    it('omits the summary list when existing support needs data is missing', () => {
      const presenter = new IdentifiedAdditionalNeedsPresenter(caseRefId, firstName, undefined, {})

      expect(presenter.buildViewModel(res).existingSupportNeedsDetails).toBeUndefined()
    })
  })
})

import type { Response } from 'express'
import WhyDidSessionNotHappenPresenter from './WhyDidSessionNotHappenPresenter'
import { globalContent } from '../../../assets/content/GlobalContent'
import type { WhyDidSessionNotHappenViewModel } from './WhyDidSessionNotHappenViewModel'
import type { ErrorMiddlewareErrors } from '../../@types/express'

describe('WhyDidSessionNotHappenPresenter', () => {
  const caseRefId = 'case-ref-1'
  const content = globalContent['/ics-feedback/:id/why-did-the-session-not-happen']
  const { items: itemsContent } = content.whyDidSessionNotHappenRadio
  const noErrors: ErrorMiddlewareErrors = { list: [], messages: {} }

  const buildViewModel = (
    session: ConstructorParameters<typeof WhyDidSessionNotHappenPresenter>[2] = undefined,
    errors: ErrorMiddlewareErrors = noErrors,
  ) => {
    const presenter = new WhyDidSessionNotHappenPresenter(caseRefId, 'Alex', session, errors) as unknown as {
      buildViewModel(res: Response): WhyDidSessionNotHappenViewModel
    }
    return presenter.buildViewModel({ locals: { content, errors } } as unknown as Response)
  }

  const buildRadios = (...args: Parameters<typeof buildViewModel>) =>
    buildViewModel(...args).whyDidSessionNotHappenRadio({
      serviceProviderIssue: '<sp>',
      referralCouldNotTakePart: '<could-not>',
      referralDidNotComply: '<did-not-comply>',
    })

  it('builds the page header, button and back link', () => {
    const viewModel = buildViewModel()

    expect(viewModel.pageHeader).toBe(content.pageHeader)
    expect(viewModel.submitButton).toEqual({ text: 'Continue', classes: 'govuk-!-margin-top-6' })
    expect(viewModel.backLink).toEqual({ href: `/ics-feedback/${caseRefId}/did-attend` })
    expect(viewModel.formData).toEqual({})
  })

  describe('radios', () => {
    it('builds the radios with hints, first name and conditional html', () => {
      const radios = buildRadios()

      expect(radios.name).toBe('whyDidSessionNotHappen')
      expect(radios.attributes).toEqual({ 'data-testid': 'whyDidSessionNotHappen' })
      expect(radios.fieldset).toEqual({ attributes: { 'data-testid': 'fieldset-whyDidSessionNotHappen' } })
      expect(radios.errorMessage).toBeNull()
      expect(radios.items).toEqual([
        {
          id: 'SERVICE_PROVIDER_ISSUE',
          value: 'SERVICE_PROVIDER_ISSUE',
          text: itemsContent.serviceProviderIssueText,
          hint: { text: itemsContent.serviceProviderIssueHint },
          checked: false,
          conditional: { html: '<sp>' },
        },
        {
          id: 'REFERRAL_COULD_NOT_TAKE_PART',
          value: 'REFERRAL_COULD_NOT_TAKE_PART',
          text: 'Alex could not take part',
          hint: { text: itemsContent.referralCouldNotTakePartHint },
          checked: false,
          conditional: { html: '<could-not>' },
        },
        {
          id: 'REFERRAL_DID_NOT_COMPLY',
          value: 'REFERRAL_DID_NOT_COMPLY',
          text: 'Alex did not comply',
          hint: { text: itemsContent.referralDidNotComplyHint },
          checked: false,
          conditional: { html: '<did-not-comply>' },
        },
      ])
    })

    it.each([
      ['SERVICE_PROVIDER_ISSUE', [true, false, false]],
      ['REFERRAL_COULD_NOT_TAKE_PART', [false, true, false]],
      ['REFERRAL_DID_NOT_COMPLY', [false, false, true]],
    ] as const)('checks the correct radio when the reason is %s', (reason, expected) => {
      const { items } = buildRadios({ reason, details: 'Some details' })

      expect(items.map(item => item.checked)).toEqual(expected)
    })

    it('passes the radio error message', () => {
      const error = { text: 'Select why the session did not happen' }
      const errors: ErrorMiddlewareErrors = {
        list: [{ href: '#whyDidSessionNotHappen', text: error.text }],
        messages: { whyDidSessionNotHappen: error },
      }

      expect(buildRadios(undefined, errors).errorMessage).toEqual(error)
    })
  })

  describe('conditional textareas', () => {
    it('builds an empty textarea for each reason', () => {
      const viewModel = buildViewModel()

      expect(viewModel.serviceProviderIssueHtmlTextBoxArgs).toEqual({
        id: 'serviceProviderIssueDetails',
        name: 'serviceProviderIssueDetails',
        label: { text: itemsContent.serviceProviderIssueDetails.label },
        rows: '5',
        formGroup: { attributes: { 'data-testid': 'serviceProviderIssueDetails' } },
        errorMessage: null,
        value: '',
      })
      expect(viewModel.referralCouldNotTakePartHtmlTextBoxArgs).toMatchObject({
        id: 'referralCouldNotTakePartDetails',
        name: 'referralCouldNotTakePartDetails',
        label: { text: itemsContent.referralCouldNotTakePartDetails.label },
        value: '',
      })
      expect(viewModel.referralDidNotComplyHtmlTextBoxArgs).toMatchObject({
        id: 'referralDidNotComplyDetails',
        name: 'referralDidNotComplyDetails',
        label: { text: itemsContent.referralDidNotComplyDetails.label },
        value: '',
      })
    })

    it('only populates the textarea for the selected reason', () => {
      const viewModel = buildViewModel({ reason: 'REFERRAL_COULD_NOT_TAKE_PART', details: 'They were ill' })

      expect(viewModel.serviceProviderIssueHtmlTextBoxArgs.value).toBe('')
      expect(viewModel.referralCouldNotTakePartHtmlTextBoxArgs.value).toBe('They were ill')
      expect(viewModel.referralDidNotComplyHtmlTextBoxArgs.value).toBe('')
    })

    it('passes each textarea its own error message', () => {
      const error = { text: 'Enter details about why they did not comply' }
      const errors: ErrorMiddlewareErrors = {
        list: [{ href: '#referralDidNotComplyDetails', text: error.text }],
        messages: { referralDidNotComplyDetails: error },
      }
      const viewModel = buildViewModel({ reason: 'REFERRAL_DID_NOT_COMPLY', details: '' }, errors)

      expect(viewModel.referralDidNotComplyHtmlTextBoxArgs.errorMessage).toEqual(error)
      expect(viewModel.serviceProviderIssueHtmlTextBoxArgs.errorMessage).toBeNull()
      expect(viewModel.referralCouldNotTakePartHtmlTextBoxArgs.errorMessage).toBeNull()
    })
  })

  it('uses the why did the session not happen template', () => {
    const res = { locals: { content, errors: noErrors }, render: jest.fn() } as unknown as Response

    new WhyDidSessionNotHappenPresenter(caseRefId, 'Alex', undefined).renderPage(res)

    expect(res.render).toHaveBeenCalledWith('appointment/whyDidSessionNotHappen', {
      content: expect.objectContaining({ pageHeader: content.pageHeader }),
    })
  })
})

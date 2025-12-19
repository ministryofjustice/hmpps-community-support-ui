import { runtime } from 'nunjucks'
import { ListStyle } from './summaryList'
import ViewUtils from './viewUtils'

describe('ViewUtils', () => {
  describe('escape', () => {
    it('escapes HTML tags', () => {
      expect(ViewUtils.escape('<ul class="foo">')).toBe('&lt;ul class=&quot;foo&quot;&gt;')
    })

    it('escapes HTML reserved characters', () => {
      expect(ViewUtils.escape('It’s a great day for you & me')).toBe('It’s a great day for you &amp; me')
    })
  })

  describe('nl2br', () => {
    it('converts newline characters with html break tags', () => {
      expect(ViewUtils.nl2br('tom\ntom\r\ntom')).toBe('tom<br />\ntom<br />\ntom')
    })

    it('should return the original object when passed a Nunjucks SafeString (Passthrough)', () => {
      const htmlContent = '<strong class="govuk-tag">\nTag\n</strong>'
      const tagValue = new runtime.SafeString(htmlContent)

      const result = ViewUtils.nl2br(tagValue)

      expect(result).toBe(tagValue)
      expect(result).toBeInstanceOf(runtime.SafeString)
    })

    it.each([[null], [undefined], [123], [{ key: 'value' }]])(
      'should return %p untouched if it is not a string',
      input => {
        expect(ViewUtils.nl2br(input)).toBe(input)
      },
    )
  })

  describe('summaryListArgs', () => {
    it('returns a summary list args object for passing to the govukSummaryList macro', () => {
      expect(
        ViewUtils.summaryListArgs([
          { key: 'Risks', lines: ['No risk'], changeLink: '/risks' },
          { key: 'Needs', lines: ['Accommodation', 'Social inclusion'], listStyle: ListStyle.noMarkers },
          { key: 'Needs', lines: ['Accommodation', 'Social inclusion'], listStyle: ListStyle.bulleted },
          { key: 'Gender', lines: ['Male'] },
          { key: 'Address', lines: ['Flat 2', '27 Test Walk', 'SY16 1AQ'] },
        ]),
      ).toEqual({
        classes: undefined,
        rows: [
          {
            key: {
              text: 'Risks',
            },
            value: {
              html: '<p class="govuk-body">No risk</p>',
            },
            actions: {
              items: [
                {
                  href: '/risks',
                  text: 'Change',
                  attributes: { id: `change-link-0` },
                  visuallyHiddenText: undefined,
                },
              ],
            },
          },
          {
            key: {
              text: 'Needs',
            },
            value: {
              html: `<ul class="govuk-list"><li>Accommodation</li>\n<li>Social inclusion</li></ul>`,
            },
            actions: { items: [] },
          },
          {
            key: {
              text: 'Needs',
            },
            value: {
              html: `<ul class="govuk-list govuk-list--bullet"><li>Accommodation</li>\n<li>Social inclusion</li></ul>`,
            },
            actions: { items: [] },
          },
          {
            key: {
              text: 'Gender',
            },
            value: {
              html: '<p class="govuk-body">Male</p>',
            },
            actions: { items: [] },
          },
          {
            key: {
              text: 'Address',
            },
            value: {
              html: '<p class="govuk-body">Flat 2</p>\n<p class="govuk-body">27 Test Walk</p>\n<p class="govuk-body">SY16 1AQ</p>',
            },
            actions: { items: [] },
          },
        ],
      })
    })
  })

  describe('with provided options', () => {
    describe('when show borders is set to false', () => {
      it('should add a hide borders class', () => {
        expect(ViewUtils.summaryListArgs([], { showBorders: false })).toEqual({
          classes: 'govuk-summary-list--no-border',
          rows: [],
        })
      })
    })
  })

  it('escapes special characters passed iin', () => {
    expect(
      ViewUtils.summaryListArgs([
        { key: 'Needs', lines: ['Accommodation&', 'Social inclusion'], listStyle: ListStyle.noMarkers },
        { key: 'Address', lines: ['Flat 2', "27 St James's Road", 'SY16 1AQ'] },
      ]),
    ).toEqual({
      rows: [
        {
          key: {
            text: 'Needs',
          },
          value: {
            html: `<ul class="govuk-list"><li>Accommodation&amp;</li>\n<li>Social inclusion</li></ul>`,
          },
          actions: { items: [] },
        },
        {
          key: {
            text: 'Address',
          },
          value: {
            // gitleaks:allow (test fixture address; not a secret)
            html: '<p class="govuk-body">Flat 2</p>\n<p class="govuk-body">27 St James&#39;s Road</p>\n<p class="govuk-body">SY16 1AQ</p>',
          },
          actions: { items: [] },
        },
      ],
    })
  })
})

import renderer, { cleanHtml } from '../../utils/nunjucksSetup.test'

describe('Record Session Details View', () => {
  const context = {
    // Get this from RecordSessionDetailsPresenter.buildViewModel
    content: {
      pageHeader: 'page header',
      description: 'page description',
      appointment: {
        rows: [
          {
            key: { text: 'row1_key' },
            value: { html: 'row1_value' },
          },
        ],
        attributes: { 'data-testid': 'appointment-details' },
      },
    },
  }

  it("renders correctly", () => {
    const render = renderer(context)
    const view = render("appointment/recordSessionDetails.njk")

    expect(
      cleanHtml(
        view('[data-testid="appointment-details"]')
          .children('.govuk-summary-list__row')
          .children('.govuk-summary-list__key'),
      ),
    ).toEqual('row1_key')

    expect(
      cleanHtml(
        view('[data-testid="appointment-details"]')
          .children('.govuk-summary-list__row')
          .children('.govuk-summary-list__value'),
      ),
    ).toEqual('row1_value')
  })
})

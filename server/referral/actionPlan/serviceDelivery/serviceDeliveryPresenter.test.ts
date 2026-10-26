import { Response } from 'express'
import ServiceDeliveryPresenter from './serviceDeliveryPresenter'
import { ServiceDeliveryViewModel } from './serviceDeliveryViewModel'
import { globalContent } from '../../../../assets/content/GlobalContent'

describe('ServiceDeliveryPresenter', () => {
  const content = { ...globalContent['/referral/:id'], ...globalContent['/referral/:id/service-delivery'] }

  const render = (caseReference = 'AB1234CD') => {
    const res = { locals: { content }, render: jest.fn() } as unknown as Response
    new ServiceDeliveryPresenter(caseReference).renderPage(res)
    const [template, data] = (res.render as jest.Mock).mock.calls[0] as [string, { content: ServiceDeliveryViewModel }]
    return { template, viewModel: data.content }
  }

  it('renders the service delivery template', () => {
    expect(render().template).toBe('referral/serviceDelivery')
  })

  it('builds the page header and back link', () => {
    const { viewModel } = render()

    expect(viewModel.pageHeader).toBe('Action plan')
    expect(viewModel.backLink).toEqual({ href: '/progress/AB1234CD' })
  })

  it('builds the add another outcome button for the referral', () => {
    const { viewModel } = render()

    expect(viewModel.addAnotherOutcomeButton).toEqual({
      href: '/referral/AB1234CD/action-plan/select-a-need',
      text: 'Add another outcome',
      classes: 'govuk-button--secondary govuk-!-margin-right-2',
    })
  })

  it('builds the referral sub navigation', () => {
    const { viewModel } = render()

    expect(viewModel.subNavigationArgs).toEqual({
      label: 'Sub navigation',
      items: [{ href: '/referral/AB1234CD/action-plan', text: 'Action plan', active: true }],
    })
  })

  it('builds the side navigation with the service delivery item active', () => {
    const { viewModel } = render()

    expect(viewModel.horizontalSubNavArgs).toEqual({
      label: 'Side navigation',
      items: [
        { href: '/referral/AB1234CD/action-plan', text: 'Action plan', active: false },
        { href: '/referral/AB1234CD/service-delivery', text: 'Service details', active: true },
      ],
    })
  })

  it('uses the referral id in every link', () => {
    const { viewModel } = render('ZZ9876YY')

    expect(viewModel.horizontalSubNavArgs.items.map(item => item.href)).toEqual([
      '/referral/ZZ9876YY/action-plan',
      '/referral/ZZ9876YY/service-delivery',
    ])
  })
})

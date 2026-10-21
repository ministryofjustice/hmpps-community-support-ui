import { Response } from 'express'
import ActionPlanLayoutPresenter, { ActionPlanNavigationValues } from './actionPlanLayoutPresenter'
import { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import { ActionPlanContent } from './actionPlanViewModel'
import { globalContent } from '../../../assets/content/GlobalContent'

class TestActionPlanLayoutPresenter extends ActionPlanLayoutPresenter<{ title: string }, Record<string, string>> {
  constructor(activeTab: ActionPlanNavigationValues, referralId: string) {
    super(ReferralNavigationValues.actionPlanTab, activeTab, referralId)
  }

  protected buildViewModel(res: Response): { title: string } {
    return { title: this.buildStaticContent(res).title }
  }

  protected getTemplatePath(): string {
    return 'referral/test'
  }
}

describe('ActionPlanLayoutPresenter', () => {
  const content = {
    ...globalContent['/referral/:id'],
    ...globalContent['/referral/:id/action-plan'],
  } as ActionPlanContent

  describe('getHorizontalSubNavArgs', () => {
    it('marks the action plan item as active', () => {
      const presenter = new TestActionPlanLayoutPresenter(ActionPlanNavigationValues.actionPlanTab, 'AB1234CD')

      expect(presenter.getHorizontalSubNavArgs(content)).toEqual({
        label: 'Side navigation',
        items: [
          { href: '/referral/AB1234CD/action-plan', text: 'Action plan', active: true },
          { href: '/referral/AB1234CD/service-delivery', text: 'Service details', active: false },
        ],
      })
    })

    it('marks the service details item as active', () => {
      const presenter = new TestActionPlanLayoutPresenter(ActionPlanNavigationValues.serviceDeliveryTab, 'AB1234CD')

      const { items } = presenter.getHorizontalSubNavArgs(content)

      expect(items.map(item => item.active)).toEqual([false, true])
    })

    it('replaces the id placeholder in each link with the referral id', () => {
      const presenter = new TestActionPlanLayoutPresenter(ActionPlanNavigationValues.actionPlanTab, 'ZZ9876YY')

      const { items } = presenter.getHorizontalSubNavArgs(content)

      expect(items.map(item => item.href)).toEqual([
        '/referral/ZZ9876YY/action-plan',
        '/referral/ZZ9876YY/service-delivery',
      ])
    })

    it('takes the label and item text from the content', () => {
      const presenter = new TestActionPlanLayoutPresenter(ActionPlanNavigationValues.actionPlanTab, 'AB1234CD')

      const args = presenter.getHorizontalSubNavArgs({
        ...content,
        sideNavigationLabel: 'Custom label',
        actionPlanSideTabText: 'Custom plan',
        serviceDeliverySideTabText: 'Custom service',
      })

      expect(args.label).toBe('Custom label')
      expect(args.items.map(item => item.text)).toEqual(['Custom plan', 'Custom service'])
    })
  })

  it('exposes the constructor arguments and still provides the referral sub navigation', () => {
    const presenter = new TestActionPlanLayoutPresenter(ActionPlanNavigationValues.serviceDeliveryTab, 'AB1234CD')

    expect(presenter.activePage).toBe(ReferralNavigationValues.actionPlanTab)
    expect(presenter.activeTab).toBe(ActionPlanNavigationValues.serviceDeliveryTab)
    expect(presenter.referralId).toBe('AB1234CD')
    expect(presenter.getMojSubNavigationArgs(content).items[0]).toEqual({
      href: '/referral/AB1234CD/action-plan',
      text: 'Action plan',
      active: true,
    })
  })
})

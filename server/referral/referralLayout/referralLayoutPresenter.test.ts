import { Response } from 'express'
import { globalContent } from '../../../assets/content/GlobalContent'
import ReferralLayoutPresenter, { ReferralNavigationValues } from './referralLayoutPresenter'

class TestReferralLayoutPresenter extends ReferralLayoutPresenter<{ title: string }, Record<string, string>> {
  constructor(activePage: ReferralNavigationValues, referralId: string) {
    super(activePage, referralId)
  }

  protected buildViewModel(res: Response): { title: string } {
    return { title: this.buildStaticContent(res).title }
  }

  protected getTemplatePath(): string {
    return 'referral/test'
  }
}

describe('ReferralLayoutPresenter', () => {
  const content = globalContent['/referral/:id']

  describe('getMojSubNavigationArgs', () => {
    it('builds the shared navigation with Action Plan immediately after Progress', () => {
      const presenter = new TestReferralLayoutPresenter(ReferralNavigationValues.actionPlanTab, 'AB1234CD')

      expect(presenter.getMojSubNavigationArgs(content)).toEqual({
        label: 'Sub navigation',
        items: [
          { href: '/referral-details/AB1234CD', text: 'Case details', active: false },
          { href: '/progress/AB1234CD', text: 'Progress', active: false },
          { href: '/referral/AB1234CD/action-plan', text: 'Action Plan', active: true },
          { href: '/referral/AB1234CD/appointments', text: 'Appointments', active: false },
          { href: '#', text: 'Change log', active: false },
        ],
      })
    })

    it('takes the label and tab text from the content', () => {
      const presenter = new TestReferralLayoutPresenter(ReferralNavigationValues.actionPlanTab, 'AB1234CD')

      const args = presenter.getMojSubNavigationArgs({
        subNavigationLabel: 'Custom label',
        subNavItems: [{ id: 'actionPlan', text: 'Custom tab', href: '/custom/{{ id }}/path' }],
      })

      expect(args.label).toBe('Custom label')
      expect(args.items[0].text).toBe('Custom tab')
      expect(args.items[0].href).toBe('/custom/AB1234CD/path')
    })

    it('marks the action plan item as inactive when another page is active', () => {
      const presenter = new TestReferralLayoutPresenter('somethingElse' as ReferralNavigationValues, 'AB1234CD')

      expect(presenter.getMojSubNavigationArgs(content).items.every(item => !item.active)).toBe(true)
    })

    it.each(Object.values(ReferralNavigationValues))('marks only %s as active', activePage => {
      const presenter = new TestReferralLayoutPresenter(activePage, 'AB1234CD')
      const { items } = presenter.getMojSubNavigationArgs()

      expect(items.filter(item => item.active)).toHaveLength(1)
      expect(items.findIndex(item => item.active)).toBe(content.subNavItems.findIndex(item => item.id === activePage))
    })

    it('hides Progress, Action Plan and Appointments for unassigned referrals', () => {
      const presenter = new TestReferralLayoutPresenter(ReferralNavigationValues.caseDetailsTab, 'AB1234CD')

      expect(presenter.getMojSubNavigationArgs(content, false).items).toEqual([
        { href: '/referral-details/AB1234CD', text: 'Case details', active: true },
        { href: '#', text: 'Change log', active: false },
      ])
    })
  })

  it('exposes the constructor arguments', () => {
    const presenter = new TestReferralLayoutPresenter(ReferralNavigationValues.actionPlanTab, 'AB1234CD')

    expect(presenter.activePage).toBe(ReferralNavigationValues.actionPlanTab)
    expect(presenter.referralId).toBe('AB1234CD')
  })

  it('renders through PresenterBase using the subclass template and view model', () => {
    const res = { locals: { content: { title: 'Hello' } }, render: jest.fn() } as unknown as Response

    new TestReferralLayoutPresenter(ReferralNavigationValues.actionPlanTab, 'AB1234CD').renderPage(res)

    expect(res.render).toHaveBeenCalledWith('referral/test', { content: { title: 'Hello' } })
  })
})

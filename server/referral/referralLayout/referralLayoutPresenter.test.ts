import { Response } from 'express'
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
  describe('getMojSubNavigationArgs', () => {
    it('builds the action plan item linking to the referral', () => {
      const presenter = new TestReferralLayoutPresenter(ReferralNavigationValues.actionPlanTab, 'AB1234CD')

      expect(presenter.getMojSubNavigationArgs()).toEqual({
        label: 'Sub navigation',
        items: [{ href: '/referral/AB1234CD/action-plan', text: 'Action plan', active: true }],
      })
    })

    it('marks the action plan item as inactive when another page is active', () => {
      const presenter = new TestReferralLayoutPresenter('somethingElse' as ReferralNavigationValues, 'AB1234CD')

      expect(presenter.getMojSubNavigationArgs().items[0].active).toBe(false)
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

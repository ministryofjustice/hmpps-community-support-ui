import { Response } from 'express'
import ActionPlanViewActivitiesPresenter from './actionPlanViewActivitiesPresenter'
import { ActionPlanViewActivitiesViewModel } from './actionPlanViewActivitiesViewModel'
import { globalContent } from '../../../../assets/content/GlobalContent'

describe('ActionPlanViewActivitiesPresenter', () => {
  const render = (alertType?: 'ADD' | 'REMOVE', firstName?: string) => {
    const res = {
      locals: { content: globalContent['/referral/:id/action-plan/activities'] },
      render: jest.fn(),
    } as unknown as Response

    new ActionPlanViewActivitiesPresenter(
      'AB1234CD',
      'Accommodation',
      'Find housing',
      [],
      alertType,
      firstName,
    ).renderPage(res)

    return (res.render as jest.Mock).mock.calls[0][1].content as ActionPlanViewActivitiesViewModel
  }

  it('builds an add activity success alert with the first name', () => {
    expect(render('ADD', 'Alex').alert).toEqual({
      variant: 'success',
      html: '<p class="govuk-body">You added an activity to Alex\'s plan</p>',
      dismissible: true,
    })
  })

  it('builds a remove activity success alert with the first name', () => {
    expect(render('REMOVE', 'Alex').alert).toEqual({
      variant: 'success',
      html: '<p class="govuk-body">You removed an activity from Alex\'s plan</p>',
      dismissible: true,
    })
  })

  it('does not build an alert when no activity alert is active', () => {
    expect(render().alert).toBeUndefined()
  })
})

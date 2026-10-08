import { Response } from 'express'
import ActionPlanRemoveActivityPresenter from './actionPlanRemoveActivityPresenter'
import { ActionPlanRemoveActivityViewModel } from './actionPlanRemoveActivityViewModel'
import { globalContent } from '../../../../assets/content/GlobalContent'

describe('ActionPlanRemoveActivityPresenter', () => {
  const render = (isOnlyActivity: boolean, errors?: Response['locals']['errors']) => {
    const res = {
      locals: {
        content: globalContent['/referral/:id/action-plan/activities/remove'],
        errors,
      },
      render: jest.fn(),
    } as unknown as Response

    new ActionPlanRemoveActivityPresenter('AB1234CD', 2, isOnlyActivity).renderPage(res)

    return (res.render as jest.Mock).mock.calls[0][1].content as ActionPlanRemoveActivityViewModel
  }

  it('builds the question as the page heading with yes and no options', () => {
    const viewModel = render(false)

    expect(viewModel.pageHeader).toBe('Are you sure you want to remove this activity?')
    expect(viewModel.removeActivityRadio.name).toBe('removeActivity')
    expect(viewModel.removeActivityRadio.fieldset?.legend).toEqual({
      text: 'Are you sure you want to remove this activity?',
      isPageHeading: true,
      classes: 'govuk-fieldset__legend--l',
    })
    expect(viewModel.removeActivityRadio.items).toEqual([
      { text: 'Yes', value: 'yes' },
      { text: 'No', value: 'no' },
    ])
    expect(viewModel.saveAndContinueButton.text).toBe('Save and continue')
    expect(viewModel.formAction).toBe('/referral/AB1234CD/action-plan/activities/remove?activityIndex=2')
    expect(viewModel.backLink).toEqual({ href: '/referral/AB1234CD/action-plan/activities' })
  })

  it('does not show a hint when other activities remain', () => {
    expect(render(false).removeActivityRadio.hint).toBeNull()
  })

  it('shows a hint when it is the only activity', () => {
    expect(render(true).removeActivityRadio.hint).toEqual({
      text: 'This is the only activity in the action plan. If you remove it, you will need to start the action plan again.',
    })
  })

  it('shows the validation error against the radios', () => {
    const viewModel = render(false, {
      list: [],
      messages: { removeActivity: { text: 'Select yes if you want to remove this activity' } },
    })

    expect(viewModel.removeActivityRadio.errorMessage).toEqual({
      text: 'Select yes if you want to remove this activity',
    })
  })
})

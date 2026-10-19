import { Response } from 'express'
import { expect } from '@playwright/test'
import type { ActionPlanSelectANeedNeed, ActionPlanSelectANeedResponse } from '@community-support-api'
import { globalContent } from '../../../../assets/content/GlobalContent'
import ActionPlanSelectANeedPresenter from './actionPlanSelectANeedPresenter'
import { ActionPlanSelectANeedViewModel } from './actionPlanSelectANeedViewModel'

describe('ActionPlanSelectANeedPresenter', () => {
  it('includes the needs identified in the referral in the details view model', () => {
    const needs: ActionPlanSelectANeedNeed[] = [
      { id: 'need-1', label: 'Accommodation', outcomes: [{ id: 'outcome-1', text: 'Find housing' }] },
    ]
    const selectedNeeds: ActionPlanSelectANeedResponse['selectedNeeds'] = [
      { id: 'selected-need-1', label: 'Employment' },
      { id: 'selected-need-2', label: 'Health and wellbeing' },
    ]
    const presenter = new ActionPlanSelectANeedPresenter('AB1234CD', needs, selectedNeeds)
    const res = {
      locals: { content: globalContent['/referral/:id/action-plan/select-a-need'] },
      render: jest.fn(),
    } as unknown as Response

    presenter.renderPage(res)
    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanSelectANeedViewModel }

    expect(renderData.content.identifiedNeedsDetailsTitle).toBe('Show the needs identified in the referral')
    expect(renderData.content.identifiedNeeds).toEqual(selectedNeeds)
  })
})

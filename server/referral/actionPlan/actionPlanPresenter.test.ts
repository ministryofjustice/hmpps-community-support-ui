import { Response } from 'express'
import { ActionPlanSummaryDto } from '@community-support-api'
import { expect } from '@playwright/test'
import ActionPlanPresenter from './actionPlanPresenter'
import { ActionPlanViewModel } from './actionPlanViewModel'
import { globalContent } from '../../../assets/content/GlobalContent'

describe('ActionPlanPresenter', () => {
  it('builds the page header and back link from summary data', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: {
        firstName: 'Alex',
        lastName: 'River',
      },
      needs: [],
    }

    const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD')
    const res = {
      locals: {
        content: globalContent['/referral/:id/action-plan'],
      },
      render: jest.fn(),
    } as unknown as Response

    presenter.renderPage(res)
    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }

    expect(renderData.content.pageHeader).toBe('Action plan')
    expect(renderData.content.backLink).toEqual({ href: '/progress/AB1234CD' })
    expect(renderData.content.addAnotherOutcomeButton).toBeUndefined()
    expect(renderData.content.submitActionPlanButton).toBeUndefined()
    expect(renderData.content.noActionPlanText).toBe('Alex does not have an action plan yet.')
    expect(renderData.content.createButton).toBeDefined()
    expect(renderData.content.createButton.text).toBe('Create an action plan')
  })

  it('builds the needs summary from data', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: {
        firstName: 'Alex',
        lastName: 'Smith',
      },
      needs: [
        {
          id: 'need_id_1',
          label: 'Accommodation',
          outcomes: [
            {
              id: 'outcome_id_1',
              label: 'I want to secure and maintain settled and suitable accommodation.',
              activities: [
                {
                  id: 'activity_id_1',
                  who: 'Delivery practitioner',
                  details: 'Details about what needs to be done to achieve the outcome',
                },
                {
                  id: 'activity_id_2',
                  who: 'Alex',
                  details: 'Details about what Alex can do to achieve the outcome',
                },
              ],
            },
          ],
        },
      ],
    }

    const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD')
    const res = {
      locals: {
        content: globalContent['/referral/:id/action-plan'],
      },
      render: jest.fn(),
    } as unknown as Response

    presenter.renderPage(res)
    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }

    expect(renderData.content.pageHeader).toBe('Action plan')
    expect(renderData.content.addAnotherOutcomeButton).toBeDefined()
    expect(renderData.content.addAnotherOutcomeButton.text).toBe('Add another outcome')
    expect(renderData.content.submitActionPlanButton).toBeDefined()
    expect(renderData.content.submitActionPlanButton.text).toBe('Submit Action plan')

    expect(renderData.content.needsSummary.length).toBe(1)
    const need = renderData.content.needsSummary[0]
    expect(need.card.title.text).toBe('Accommodation')
    expect(need.preText).toBe('<b>Outcome: </b>I want to secure and maintain settled and suitable accommodation.')
    expect(need.card.actions.items.length).toBe(2)
    const cardActions = need.card.actions.items
    expect(cardActions[0].text).toBe('Add or change activities')
    expect(cardActions[1].text).toBe('Remove')
    expect(need.rows.length).toBe(3)
    const activities = need.rows
    expect(activities[0].key.text).toBe('Who will do this')
    expect(activities[0].value.text).toBe('Activity')
    expect(activities[1].key.text).toBe('Delivery practitioner')
    expect(activities[1].value.text).toBe('Details about what needs to be done to achieve the outcome')
    expect(activities[2].key.text).toBe('Alex')
    expect(activities[2].value.text).toBe('Details about what Alex can do to achieve the outcome')
    expect(need.moveDownButton).toBeUndefined()
    expect(need.moveUpButton).toBeUndefined()
  })

  it('renders the need movement buttons correctly', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: {
        firstName: 'Alex',
        lastName: 'Smith',
      },
      needs: [
        {
          id: 'need_id_1',
          label: 'Accommodation',
          outcomes: [
            {
              id: 'outcome_id_1',
              label: 'I want to secure and maintain settled and suitable accommodation.',
              activities: [
                {
                  id: 'activity_id_1',
                  who: 'Delivery practitioner',
                  details: 'Details about what needs to be done to achieve the outcome',
                },
              ],
            },
          ],
        },
        {
          id: 'need_id_2',
          label: 'Employment and education',
          outcomes: [
            {
              id: 'outcome_id_2',
              label:
                'I want to find and keep suitable employment, or take steps towards employment through education, training, or other opportunities.',
              activities: [
                {
                  id: 'activity_id_2',
                  who: 'Delivery practitioner',
                  details: 'Details about what needs to be done to achieve the outcome',
                },
              ],
            },
          ],
        },
        {
          id: 'need_id_3',
          label: 'Finances',
          outcomes: [
            {
              id: 'outcome_id_3',
              label:
                'I want to improve my financial situation by reducing debt, managing my money better and accessing the benefits I am entitled to.',
              activities: [
                {
                  id: 'activity_id_3',
                  who: 'Delivery practitioner',
                  details: 'Details about what needs to be done to achieve the outcome',
                },
              ],
            },
          ],
        },
      ],
    }

    const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD')
    const res = {
      locals: {
        content: globalContent['/referral/:id/action-plan'],
      },
      render: jest.fn(),
    } as unknown as Response

    presenter.renderPage(res)
    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }

    expect(renderData.content.needsSummary.length).toBe(3)
    const needs = renderData.content.needsSummary
    // First need can't move up but can move down
    expect(needs[0].moveUpButton).toBeUndefined()
    expect(needs[0].moveDownButton).toBeDefined()
    expect(needs[0].moveDownButton.text).toBe('Move outcome down')
    // Second need can move up and move down
    expect(needs[1].moveUpButton).toBeDefined()
    expect(needs[1].moveUpButton.text).toBe('Move outcome up')
    expect(needs[1].moveDownButton).toBeDefined()
    expect(needs[1].moveDownButton.text).toBe('Move outcome down')
    // Third need can move up but can not move down
    expect(needs[2].moveUpButton).toBeDefined()
    expect(needs[2].moveUpButton.text).toBe('Move outcome up')
    expect(needs[2].moveDownButton).toBeUndefined()
  })
})

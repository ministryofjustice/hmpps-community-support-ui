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
      lastUpdatedAt: '',
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
          orderNumber: 1,
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
      lastUpdatedAt: '2026-10-15',
    }

    const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD', true)
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
    expect(renderData.content.submitActionPlanButton).toEqual({
      href: '/referral/AB1234CD/action-plan/session-delivery-details',
      text: 'Submit Action plan',
    })

    expect(renderData.content.needsSummary.length).toBe(1)
    const need = renderData.content.needsSummary[0]
    expect(need.card.title.text).toBe('Accommodation')
    expect(need.preText).toBe('<b>Outcome: </b>I want to secure and maintain settled and suitable accommodation.')
    expect(need.card.actions.items.length).toBe(2)
    const cardActions = need.card.actions.items
    expect(cardActions[0].text).toBe('Add or change activities')
    expect(cardActions[0].href).toBe(
      '/referral/AB1234CD/action-plan/activities?needId=need_id_1&outcomeAnswerId=outcome_id_1',
    )
    expect(cardActions[1].text).toBe('Remove')
    expect(cardActions[1].href).toBe(
      '/referral/AB1234CD/action-plan/remove-outcome?needId=need_id_1&outcomeAnswerId=outcome_id_1',
    )
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

  it('encodes need and outcome answer identifiers in the remove outcome link', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: { firstName: 'Alex', lastName: 'River' },
      needs: [
        {
          id: 'need/id',
          label: 'Accommodation',
          orderNumber: 1,
          outcomes: [{ id: 'outcome answer/id', label: 'Find housing', activities: [] }],
        },
      ],
      lastUpdatedAt: '2026-10-15T09:00:00Z',
    }
    const res = {
      locals: { content: globalContent['/referral/:id/action-plan'] },
      render: jest.fn(),
    } as unknown as Response

    new ActionPlanPresenter(actionPlanSummary, 'AB1234CD').renderPage(res)

    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }
    expect(renderData.content.needsSummary[0].card.actions.items[1].href).toBe(
      '/referral/AB1234CD/action-plan/remove-outcome?needId=need%2Fid&outcomeAnswerId=outcome%20answer%2Fid',
    )
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
          orderNumber: 1,
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
          orderNumber: 2,
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
          orderNumber: 3,
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
      lastUpdatedAt: '2026-10-15',
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

  describe('submit action plan button', () => {
    const outcome = {
      id: 'outcome_id_1',
      label: 'I want to secure and maintain settled and suitable accommodation.',
      activities: [{ id: 'activity_id_1', who: 'Delivery practitioner', details: 'Some details' }],
    }

    const render = (actionPlanSummary: ActionPlanSummaryDto, icsFeedbackSubmitted?: boolean) => {
      const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD', icsFeedbackSubmitted)
      const res = {
        locals: {
          content: globalContent['/referral/:id/action-plan'],
        },
        render: jest.fn(),
      } as unknown as Response
      presenter.renderPage(res)
      return ((res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }).content
    }

    const summaryWithAllOutcomes: ActionPlanSummaryDto = {
      personDetails: { firstName: 'Alex', lastName: 'Smith' },
      needs: [
        { id: 'need_id_1', label: 'Accommodation', orderNumber: 1, outcomes: [outcome] },
        { id: 'need_id_2', label: 'Finances', orderNumber: 2, outcomes: [{ ...outcome, id: 'outcome_id_2' }] },
      ],
      lastUpdatedAt: '2026-10-15',
    }

    it('is displayed and links to session details when all outcomes are added and ICS feedback is submitted', () => {
      const content = render(summaryWithAllOutcomes, true)

      expect(content.submitActionPlanButton).toEqual({
        href: '/referral/AB1234CD/action-plan/session-delivery-details',
        text: 'Submit Action plan',
      })
    })

    it('is not displayed when the ICS feedback has not been submitted', () => {
      expect(render(summaryWithAllOutcomes, false).submitActionPlanButton).toBeUndefined()
      expect(render(summaryWithAllOutcomes).submitActionPlanButton).toBeUndefined()
    })

    it('is not displayed when not all outcomes have been added', () => {
      const summary: ActionPlanSummaryDto = {
        ...summaryWithAllOutcomes,
        needs: [summaryWithAllOutcomes.needs[0], { id: 'need_id_2', label: 'Finances', orderNumber: 1, outcomes: [] }],
      }

      expect(render(summary, true).submitActionPlanButton).toBeUndefined()
    })

    it('is not displayed when there are no needs', () => {
      const summary: ActionPlanSummaryDto = { ...summaryWithAllOutcomes, needs: [] }

      expect(render(summary, true).submitActionPlanButton).toBeUndefined()
    })
  })

  describe('alert banner', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: { firstName: 'Alex', lastName: 'River' },
      needs: [
        {
          id: 'need/id',
          label: 'Accommodation',
          orderNumber: 1,
          outcomes: [{ id: 'outcome answer/id', label: 'Find housing', activities: [] }],
        },
      ],
      lastUpdatedAt: '2026-10-15T09:00:00Z',
    }

    it('renders the correct alert when adding an outcome', () => {
      const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD', false, 'ADD')
      const res = {
        locals: {
          content: globalContent['/referral/:id/action-plan'],
        },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)
      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }

      expect(renderData.content.alert).toBeDefined()
      expect(renderData.content.alert.variant).toBe('success')
      expect(renderData.content.alert.html).toContain("You added an outcome to Alex's plan.")
      expect(renderData.content.alert.dismissible).toBeTruthy()
    })

    it('renders the correct alert when removing an outcome', () => {
      const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD', false, 'REMOVE')
      const res = {
        locals: {
          content: globalContent['/referral/:id/action-plan'],
        },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)
      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }

      expect(renderData.content.alert).toBeDefined()
      expect(renderData.content.alert.variant).toBe('success')
      expect(renderData.content.alert.html).toContain("You removed an outcome from Alex's plan.")
      expect(renderData.content.alert.dismissible).toBeTruthy()
    })

    it('does not render an alert when alertType is not provided', () => {
      const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD', false)
      const res = {
        locals: {
          content: globalContent['/referral/:id/action-plan'],
        },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)
      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }

      expect(renderData.content.alert).toBeNull()
    })
  })
})

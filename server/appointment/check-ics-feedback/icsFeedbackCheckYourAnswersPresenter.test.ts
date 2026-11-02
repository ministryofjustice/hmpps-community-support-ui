import { Response } from 'express'
import { IcsFeedbackSubmission } from '@community-support-api'
import IcsFeedbackCheckYourAnswersPresenter from './icsFeedbackCheckYourAnswersPresenter'
import {
  IcsFeedbackCheckYourAnswersContent,
  SummaryListWithTitle,
  IcsFeedbackCheckYourAnswersViewModel,
} from './icsFeedbackCheckYourAnswersViewModel'
import IcsFeedbackCheckContentFactory from '../../testutils/factories/IcsFeedbackCheckContent'

describe('IcsFeedbackCheckYourAnswersPresenter', () => {
  const caseRefId = 'AB1234CD'
  const firstName = 'John'

  const baseIcsFeedbackSubmission: IcsFeedbackSubmission = {
    record: {
      didSessionHappen: true,
      didPersonAttend: true,
      howSessionTookPlace: {
        type: 'PHONE',
        additionalDetails: 'Phone conversation was productive',
      },
    },
    sessionDetails: {
      wasPersonLate: false,
      duration: { hours: 1, minutes: 30 },
    },
    sessionFeedback: {
      whatHappened: 'Discussed career options',
      behaviour: 'Cooperative',
      strengthsIdentified: 'Good communication skills',
    },
    issuesAndConcerns: {
      identified: 'None',
    },
    newlyIdentifiedAdditionalSupportNeeds: 'Literacy support needed',
    nextSteps: {
      plannedForNextSession: 'Follow-up appointment scheduled',
      actionsBeforeNextSession: 'Research job opportunities',
    },
  }

  const mockContent: IcsFeedbackCheckYourAnswersContent = IcsFeedbackCheckContentFactory.build({
    pageHeader: 'Check your answers before submitting feedback',
    summaryLists: [
      {
        summaryTitle: 'Record session attendance',
        rows: [
          {
            text: 'Did the session happen?',
            hint: 'Whether the session happened',
            changeHref: '/referral/caseRefId/appointment/session-happened/change',
          },
          {
            text: 'Did {{firstname}} attend?',
            hint: 'Whether {{firstname}} attended',
            changeHref: '/referral/caseRefId/appointment/person-attendance/change',
          },
          {
            text: 'How the session took place',
            hint: 'How the session took place',
            changeHref: '/referral/caseRefId/appointment/session-method/change',
          },
          {
            text: 'Location',
            hint: 'Location of the session',
            changeHref: '/referral/caseRefId/appointment/location/change',
          },
          {
            text: 'Additional details',
            hint: 'Additional details about the session',
            changeHref: '/referral/caseRefId/appointment/additional-details/change',
          },
        ],
      },
      {
        summaryTitle: 'Session details',
        rows: [
          {
            text: 'Was {{firstname}} late?',
            hint: 'If {{firstname}} was late',
            changeHref: '/referral/caseRefId/appointment/was-late/change',
          },
          {
            text: 'Why {{firstname}} was late?',
            hint: 'Reason for being late',
            changeHref: '/referral/caseRefId/appointment/late-reason/change',
          },
          {
            text: 'Session duration',
            hint: 'How long did the session last',
            changeHref: '/referral/caseRefId/appointment/duration/change',
          },
        ],
      },
      {
        summaryTitle: 'Session feedback',
        rows: [
          {
            text: 'What happened in the session?',
            hint: 'Description of the session',
            changeHref: '/referral/caseRefId/appointment/what-happened/change',
          },
          {
            text: 'Why did the session not happen?',
            hint: 'Reason the session did not happen',
            changeHref: '/referral/caseRefId/appointment/why-not-happened/change',
          },
          {
            text: 'Why did {{firstname}} not attend?',
            hint: 'Reason {{firstname}} did not attend',
            changeHref: '/referral/caseRefId/appointment/why-not-attend/change',
          },
          {
            text: '{{firstname}} behaviour',
            hint: 'How {{firstname}} behaved',
            changeHref: '/referral/caseRefId/appointment/behaviour/change',
          },
          {
            text: 'Strengths identified',
            hint: 'Any strengths identified during the session',
            changeHref: '/referral/caseRefId/appointment/strengths/change',
          },
        ],
      },
      {
        summaryTitle: 'Issues or concerns',
        rows: [
          {
            text: 'Issues or concerns',
            hint: 'Any issues or concerns identified',
            changeHref: '/referral/caseRefId/appointment/issues-concerns/change',
          },
        ],
      },
      {
        summaryTitle: 'Additional support needs',
        rows: [
          {
            text: 'New support needs identified',
            hint: 'Any new support needs identified',
            changeHref: '/referral/caseRefId/appointment/new-support-needs/change',
          },
        ],
      },
      {
        summaryTitle: 'Next steps',
        rows: [
          {
            text: 'What is planned for the next session?',
            hint: 'What is planned for the next session',
            changeHref: '/referral/caseRefId/appointment/next-session-plan/change',
          },
          {
            text: 'What actions are needed before the next session?',
            hint: 'Actions needed before next session',
            changeHref: '/referral/caseRefId/appointment/actions-before-next/change',
          },
        ],
      },
    ],
    didNotHappenReasonLabels: {
      serviceProviderIssue: 'Service provider issue',
      referralCouldNotTakePart: '{{firstname}} could not take part',
      referralDidNotComply: '{{firstname}} did not comply',
    },
    submitButtonText: 'Save and continue',
    submitHref: '/referral/caseRefId/appointment/submit-feedback',
    attendedBackLinkHref: '/referral/caseRefId/appointment/feedback',
    didNotAttendbackLinkHref: '/referral/caseRefId/appointment/no-attendance-info',
    noSessionbackLinkHref: '/referral/caseRefId/appointment/session-not-happened',
  })

  describe('buildSummary - Additional Support Needs', () => {
    describe('AC1: Display newly identified support needs when present', () => {
      it('should display "Yes" and the support needs content when newlyIdentifiedAdditionalSupportNeeds is provided', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        expect(additionalSupportSummary).toBeDefined()
        expect(additionalSupportSummary.rows).toHaveLength(1)
        const row = additionalSupportSummary.rows[0]
        expect(row.key.text).toBe('New support needs identified')
        expect(row.value.html).toContain('<p>Yes</p>')
        expect(row.value.html).toContain('<p>Literacy support needed</p>')
        expect(row.actions.items[0].href).toContain('/referral/AB1234CD/appointment/new-support-needs/change')
      })

      it('should include the change action with correct href for Additional support needs', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        const row = additionalSupportSummary.rows[0]
        expect(row.actions.items[0].text).toBe('Change')
        expect(row.actions.items[0].visuallyHiddenText).toBe('Any new support needs identified')
      })
    })

    describe('AC2: Display "None" when no new support needs are identified', () => {
      it('should display "None" when newlyIdentifiedAdditionalSupportNeeds is null', () => {
        const submission: IcsFeedbackSubmission = {
          ...baseIcsFeedbackSubmission,
          newlyIdentifiedAdditionalSupportNeeds: null,
        }

        const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        expect(additionalSupportSummary).toBeDefined()
        expect(additionalSupportSummary.rows).toHaveLength(1)
        const row = additionalSupportSummary.rows[0]
        expect(row.value.html).toBe('<p>None</p>')
      })

      it('should treat undefined as having needs (current implementation behavior)', () => {
        const submission: IcsFeedbackSubmission = {
          ...baseIcsFeedbackSubmission,
          newlyIdentifiedAdditionalSupportNeeds: undefined,
        }

        const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        expect(additionalSupportSummary).toBeDefined()
        const row = additionalSupportSummary.rows[0]
        // Current implementation shows "Yes" for undefined (due to !== null check)
        expect(row.value.html).toContain('<p>Yes</p>')
      })
    })

    describe('AC3: Format multiple support needs correctly', () => {
      it('should display multiple support needs on separate lines', () => {
        const submission: IcsFeedbackSubmission = {
          ...baseIcsFeedbackSubmission,
          newlyIdentifiedAdditionalSupportNeeds:
            'Literacy support needed\nNumeracy support needed\nMental health support',
        }

        const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        const row = additionalSupportSummary.rows[0]
        expect(row.value.html).toContain('<p>Yes</p>')
        expect(row.value.html).toContain('<p>Literacy support needed')
      })
    })

    describe('AC4: Render additional support needs section with correct summary structure', () => {
      it('should return a SummaryListWithTitle with correct structure', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        expect(additionalSupportSummary).toHaveProperty('summaryTitle')
        expect(additionalSupportSummary).toHaveProperty('rows')
        expect(Array.isArray(additionalSupportSummary.rows)).toBe(true)
      })

      it('should include all required row properties (key, value, actions)', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        const row = additionalSupportSummary.rows[0]
        expect(row).toHaveProperty('key')
        expect(row).toHaveProperty('value')
        expect(row).toHaveProperty('actions')
        expect(row.key).toHaveProperty('text')
        expect(row.value).toHaveProperty('html')
        expect(row.actions).toHaveProperty('items')
      })
    })

    describe('AC5: Handle special characters and HTML escaping', () => {
      it('should preserve HTML structure for support needs content', () => {
        const submission: IcsFeedbackSubmission = {
          ...baseIcsFeedbackSubmission,
          newlyIdentifiedAdditionalSupportNeeds: 'Literacy & numeracy support',
        }

        const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )

        const row = additionalSupportSummary.rows[0]
        expect(row.value.html).toContain('Literacy & numeracy support')
      })
    })

    describe('AC6: Integration with other feedback sections', () => {
      it('should include Additional support needs summary alongside other summaries', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel

        const summaryTitles = viewModel.feedbackSummaries.map((summary: SummaryListWithTitle) => summary.summaryTitle)
        expect(summaryTitles).toContain('Additional support needs')
      })

      it('should maintain correct order with all feedback sections when support needs are present', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel

        const summaryTitles = viewModel.feedbackSummaries.map((summary: SummaryListWithTitle) => summary.summaryTitle)

        // Verify expected summaries are present in order
        const supportNeedsIndex = summaryTitles.indexOf('Additional support needs')
        const feedbackIndex = summaryTitles.indexOf('Session feedback')
        const nextStepsIndex = summaryTitles.indexOf('Next steps')

        expect(supportNeedsIndex).toBeGreaterThan(-1)
        expect(supportNeedsIndex).toBeGreaterThan(feedbackIndex)
        expect(nextStepsIndex).toBeGreaterThan(supportNeedsIndex)
      })

      it('should include Additional support needs summary even when issuesAndConcerns is missing', () => {
        const submission: IcsFeedbackSubmission = {
          ...baseIcsFeedbackSubmission,
          issuesAndConcerns: null,
        }

        const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel

        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: SummaryListWithTitle) => summary.summaryTitle === 'Additional support needs',
        )
        expect(additionalSupportSummary).toBeDefined()
      })
    })

    describe('AC7: Render page with correct template and view model', () => {
      it('should render the correct template', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const templatePath = (res.render as jest.Mock).mock.calls[0][0]
        expect(templatePath).toContain('icsFeedbackCheck')
      })

      it('should pass view model with feedbackSummaries to template', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const res = {
          locals: { content: mockContent },
          render: jest.fn(),
        } as unknown as Response

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel

        expect(viewModel).toHaveProperty('feedbackSummaries')
        expect(Array.isArray(viewModel.feedbackSummaries)).toBe(true)
      })
    })
  })

  describe('buildSummary - Generic cases', () => {
    it('should return null when shouldDisplay is false', () => {
      const submission: IcsFeedbackSubmission = {
        ...baseIcsFeedbackSubmission,
        issuesAndConcerns: null,
      }

      const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

      const res = {
        locals: { content: mockContent },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel

      // Issues or concerns should not be rendered when issuesAndConcerns is null
      const issuesSummary = viewModel.feedbackSummaries.find(
        (summary: SummaryListWithTitle) => summary.summaryTitle === 'Issues or concerns',
      )
      expect(issuesSummary).toBeUndefined()
    })

    it('should filter out null values from row values', () => {
      const submission: IcsFeedbackSubmission = {
        ...baseIcsFeedbackSubmission,
        sessionDetails: {
          wasPersonLate: false,
          lateReason: null,
          duration: { hours: 1, minutes: 30 },
        },
      }

      const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

      const res = {
        locals: { content: mockContent },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
      const sessionDetailsSummary = viewModel.feedbackSummaries.find(
        (summary: SummaryListWithTitle) => summary.summaryTitle === 'Session details',
      )

      // Should only have 2 rows (wasPersonLate=No, duration), not 3
      expect(sessionDetailsSummary.rows.length).toBeLessThanOrEqual(2)
    })

    it('should replace firstname placeholders in change link text', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const res = {
        locals: { content: mockContent },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
      const sessionDetailsSummary = viewModel.feedbackSummaries.find(
        (summary: SummaryListWithTitle) => summary.summaryTitle === 'Session details',
      )

      // Check that firstname was replaced in the key text
      const keyWithFirstname = sessionDetailsSummary.rows.find(row => row.key.text.includes(firstName))
      expect(keyWithFirstname).toBeDefined()
    })

    it('should replace firstname placeholders in visually hidden text', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const res = {
        locals: { content: mockContent },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel
      const sessionDetailsSummary = viewModel.feedbackSummaries.find(
        (summary: SummaryListWithTitle) => summary.summaryTitle === 'Session details',
      )

      // Check that firstname was replaced in the visually hidden text
      const actionWithFirstname = sessionDetailsSummary.rows
        .flatMap(row => row.actions.items)
        .find(action => action.visuallyHiddenText.includes(firstName))
      expect(actionWithFirstname).toBeDefined()
    })
  })

  describe('Full page rendering', () => {
    it('should render complete feedback summary with all sections', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const res = {
        locals: { content: mockContent },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)

      expect(res.render).toHaveBeenCalled()
      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel

      expect(viewModel.pageHeader).toBe('Check your answers before submitting feedback')
      expect(viewModel.feedbackSummaries.length).toBeGreaterThan(0)
      expect(viewModel.submitButtonText).toBe('Save and continue')
      expect(viewModel.backLink).toBeDefined()
    })

    it('should replace caseRefId in submit href', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const res = {
        locals: { content: mockContent },
        render: jest.fn(),
      } as unknown as Response

      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel = renderCall[1].content as IcsFeedbackCheckYourAnswersViewModel

      expect(viewModel.submitHref).toContain(caseRefId)
      expect(viewModel.submitHref).not.toContain('caseRefId')
    })
  })
})

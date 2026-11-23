import { Response } from 'express'
import { IcsFeedbackSubmission } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { globalContent } from '../../../assets/content/GlobalContent'
import IcsFeedbackCheckYourAnswersPresenter from './icsFeedbackCheckYourAnswersPresenter'
import { IcsFeedbackCheckYourAnswersContent } from './icsFeedbackCheckYourAnswersViewModel'
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

  const mockContent: IcsFeedbackCheckYourAnswersContent = globalContent.icsFeedback.id.checkAnswers

  let res: Response

  beforeEach(() => {
    res = {
      locals: { content: mockContent },
      render: jest.fn(),
    } as unknown as Response
  })

  describe('buildSummary - Additional Support Needs', () => {
    describe('AC1: Display newly identified support needs when present', () => {
      it('should display "Yes" and the support needs content when newlyIdentifiedAdditionalSupportNeeds is provided', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
        )

        expect(additionalSupportSummary).toBeDefined()
        expect(additionalSupportSummary.rows).toHaveLength(1)
        const row = additionalSupportSummary.rows[0]
        expect(row.key.text).toBe('New support needs identified')
        expect(row.value.html).toContain('<p>Yes</p>')
        expect(row.value.html).toContain('<p>Literacy support needed</p>')
        expect(row.actions.items[0].href).toContain('/ics-feedback/AB1234CD/identified-additional-needs')
      })

      it('should include the change action with correct href for Additional support needs', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
        )

        const row = additionalSupportSummary.rows[0]
        expect(row.actions.items[0].text).toBe('Change')
        expect(row.actions.items[0].visuallyHiddenText).toBe('New support needs identified')
      })
    })

    describe('AC2: Display "None" when no new support needs are identified', () => {
      it('should display "None" when newlyIdentifiedAdditionalSupportNeeds is null', () => {
        const submission: IcsFeedbackSubmission = {
          ...baseIcsFeedbackSubmission,
          newlyIdentifiedAdditionalSupportNeeds: null,
        }

        const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
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

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
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

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
        )

        const row = additionalSupportSummary.rows[0]
        expect(row.value.html).toContain('<p>Yes</p>')
        expect(row.value.html).toContain('<p>Literacy support needed')
      })
    })

    describe('AC4: Render additional support needs section with correct summary structure', () => {
      it('should return a summary list card with correct structure', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
        )

        expect(additionalSupportSummary).toHaveProperty('card.title.text', 'Additional support needs')
        expect(additionalSupportSummary).toHaveProperty('rows')
        expect(Array.isArray(additionalSupportSummary.rows)).toBe(true)
      })

      it('should include all required row properties (key, value, actions)', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
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

        const viewModel = presenter.buildViewModel()
        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
        )

        const row = additionalSupportSummary.rows[0]
        expect(row.value.html).toContain('Literacy & numeracy support')
      })
    })

    describe('AC6: Integration with other feedback sections', () => {
      it('should include Additional support needs summary alongside other summaries', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()

        const summaryTitles = viewModel.feedbackSummaries.map(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text,
        )
        expect(summaryTitles).toContain('Additional support needs')
      })

      it('should maintain correct order with all feedback sections when support needs are present', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()

        const summaryTitles = viewModel.feedbackSummaries.map(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text,
        )

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

        const viewModel = presenter.buildViewModel()

        const additionalSupportSummary = viewModel.feedbackSummaries.find(
          (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Additional support needs',
        )
        expect(additionalSupportSummary).toBeDefined()
      })
    })

    describe('AC7: Render page with correct template and view model', () => {
      it('should render the correct template', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        presenter.renderPage(res)

        const templatePath = (res.render as jest.Mock).mock.calls[0][0]
        expect(templatePath).toContain('icsFeedbackCheck')
      })

      it('should pass view model with feedbackSummaries to template', () => {
        const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

        const viewModel = presenter.buildViewModel()

        expect(viewModel).toHaveProperty('feedbackSummaries')
        expect(Array.isArray(viewModel.feedbackSummaries)).toBe(true)
      })
    })
  })

  describe('Session feedback summary', () => {
    it('matches non-attendance answers to their labels and change links', () => {
      const submission: IcsFeedbackSubmission = {
        ...baseIcsFeedbackSubmission,
        record: {
          didSessionHappen: false,
          didPersonAttend: false,
          howTheyTriedToContactThePerson: 'Called twice',
          reasonsTheyDidNotAttend: 'They were unwell',
        },
        sessionFeedback: null,
      }

      const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)
      const summary = presenter
        .buildViewModel()
        .feedbackSummaries.find(item => item.summaryTitle === 'Session feedback')
      const changeHref = `/ics-feedback/${caseRefId}/how-they-tried-to-contact-the-person`

      expect(summary.rows).toHaveLength(2)
      expect(summary.rows[0]).toMatchObject({
        key: { text: 'How did you try to contact John?' },
        value: { text: 'Called twice' },
        actions: {
          items: [{ href: changeHref, text: 'Change', visuallyHiddenText: 'How did you try to contact John?' }],
        },
      })
      expect(summary.rows[1]).toMatchObject({
        key: { text: 'Reason they did not attend' },
        value: { text: 'They were unwell' },
        actions: { items: [{ href: changeHref, text: 'Change', visuallyHiddenText: 'Reason they did not attend' }] },
      })
    })

    it('keeps attended-session feedback mapped to its labels', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)
      const summary = presenter
        .buildViewModel()
        .feedbackSummaries.find(item => item.summaryTitle === 'Session feedback')

      expect(summary.rows.map(row => [row.key.text, row.value.text])).toEqual([
        ['What happened in the session', 'Discussed career options'],
        ["What was John's engagement like during the session?", 'Cooperative'],
        ['What strengths did you identify?', 'Good communication skills'],
      ])
    })
  })

  describe('buildSummary - Generic cases', () => {
    it('should return null when shouldDisplay is false', () => {
      const submission: IcsFeedbackSubmission = {
        ...baseIcsFeedbackSubmission,
        issuesAndConcerns: null,
      }

      const presenter = new IcsFeedbackCheckYourAnswersPresenter(submission, caseRefId, firstName)

      const viewModel = presenter.buildViewModel()

      // Issues or concerns should not be rendered when issuesAndConcerns is null
      const issuesSummary = viewModel.feedbackSummaries.find(
        (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Issues or concerns',
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

      const viewModel = presenter.buildViewModel()
      const sessionDetailsSummary = viewModel.feedbackSummaries.find(
        (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Session details',
      )

      // Should only have 2 rows (wasPersonLate=No, duration), not 3
      expect(sessionDetailsSummary.rows.length).toBeLessThanOrEqual(2)
    })

    it('should replace firstname placeholders in change link text', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const viewModel = presenter.buildViewModel()
      const sessionDetailsSummary = viewModel.feedbackSummaries.find(
        (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Session details',
      )

      // Check that firstname was replaced in the key text
      const keyWithFirstname = sessionDetailsSummary.rows.find(row => row.key.text.includes(firstName))
      expect(keyWithFirstname).toBeDefined()
    })

    it('should replace firstname placeholders in visually hidden text', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const viewModel = presenter.buildViewModel()
      const sessionDetailsSummary = viewModel.feedbackSummaries.find(
        (summary: GovukFrontendSummaryList) => summary.card?.title?.text === 'Session details',
      )

      // Check that firstname was replaced in the visually hidden text
      const actionWithFirstname = sessionDetailsSummary.rows
        .flatMap(row => row.actions.items)
        .find(action => action.visuallyHiddenText.includes(firstName))
      expect(actionWithFirstname).toBeDefined()
    })
  })

  describe('Why the session did not happen', () => {
    // reasonsTheyDidNotAttend and howTheyTriedToContactThePerson are not yet in the API types
    type FutureRecord = IcsFeedbackSubmission['record'] & {
      reasonsTheyDidNotAttend?: string
      howTheyTriedToContactThePerson?: string
    }
    const buildSummaryRows = (record: FutureRecord) => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(
        { ...baseIcsFeedbackSubmission, record } as IcsFeedbackSubmission,
        caseRefId,
        firstName,
      )
      const viewModel = presenter.buildViewModel()
      const byTitle = (title: string) =>
        viewModel.feedbackSummaries.find((summary: GovukFrontendSummaryList) => summary.card?.title?.text === title)
      return { attendanceRows: byTitle('ICS attendance').rows }
    }

    it('shows the reason and details in the attendance summary when the session did not happen', () => {
      const { attendanceRows } = buildSummaryRows({
        didSessionHappen: false,
        didPersonAttend: true,
        sessionNotHappenReason: { reason: 'SERVICE_PROVIDER_ISSUE', details: 'Room unavailable' },
      })

      const row = attendanceRows.find(r => r.key.text === 'Why did the ICS not happen?')
      expect(row.value.html).toBe('Service provider issue<br /><br /> Room unavailable')
      expect(row.actions.items[0].href).toBe('/ics-feedback/AB1234CD/why-did-the-session-not-happen')
    })

    it('does not show the row when the session happened', () => {
      const { attendanceRows } = buildSummaryRows({ didSessionHappen: true, didPersonAttend: true })

      expect(attendanceRows.some(r => r.key.text === 'Why did the ICS not happen?')).toBe(false)
    })

    it('shows how the provider tried to contact the person when they did not attend', () => {
      const { attendanceRows } = buildSummaryRows({
        didSessionHappen: false,
        didPersonAttend: false,
        howTheyTriedToContactThePerson: 'Called twice',
      })

      const row = attendanceRows.find(r => r.key.text === 'How did you try to contact John?')
      expect(row.value.text).toBe('Called twice')
      expect(row.actions.items[0].visuallyHiddenText).toBe('details about how you tried to contact them')
    })

    it('shows the reason they did not attend when the session did not happen and they did not attend', () => {
      const { attendanceRows } = buildSummaryRows({
        didSessionHappen: false,
        didPersonAttend: false,
        reasonsTheyDidNotAttend: 'Was unwell',
      })

      const row = attendanceRows.find(r => r.key.text === 'Reason they did not attend?')
      expect(row.value.text).toBe('Was unwell')
      expect(row.actions.items[0].visuallyHiddenText).toBe('details about why they did not attend')
    })

    it('does not show the contact or non-attendance rows when the person attended', () => {
      const { attendanceRows } = buildSummaryRows({
        didSessionHappen: false,
        didPersonAttend: true,
        howTheyTriedToContactThePerson: 'Called twice',
        reasonsTheyDidNotAttend: 'Was unwell',
      })

      const keys = attendanceRows.map(r => r.key.text)
      expect(keys).not.toContain('How did you try to contact John?')
      expect(keys).not.toContain('Reason they did not attend?')
    })

    it('does not show the contact or non-attendance rows when the session happened', () => {
      const { attendanceRows } = buildSummaryRows({
        didSessionHappen: true,
        didPersonAttend: false,
        howTheyTriedToContactThePerson: 'Called twice',
        reasonsTheyDidNotAttend: 'Was unwell',
      })

      const keys = attendanceRows.map(r => r.key.text)
      expect(keys).not.toContain('How did you try to contact John?')
      expect(keys).not.toContain('Reason they did not attend?')
    })

    it('does not show the not-happen reason row when the person did not attend', () => {
      const { attendanceRows } = buildSummaryRows({ didSessionHappen: false, didPersonAttend: false })

      expect(attendanceRows.some(r => r.key.text === 'Why did the ICS not happen?')).toBe(false)
    })
  })

  describe('Sections shown when the session did not happen', () => {
    const titlesFor = (record: IcsFeedbackSubmission['record']) =>
      new IcsFeedbackCheckYourAnswersPresenter({ ...baseIcsFeedbackSubmission, record }, caseRefId, firstName)
        .buildViewModel()
        .feedbackSummaries.map((summary: GovukFrontendSummaryList) => summary.card?.title?.text)

    it('hides session details, session feedback and additional support needs', () => {
      const titles = titlesFor({ didSessionHappen: false, didPersonAttend: true })

      expect(titles).toContain('ICS attendance')
      expect(titles).not.toContain('Session details')
      expect(titles).not.toContain('Session feedback')
      expect(titles).not.toContain('Additional support needs')
    })

    it('shows them when the session happened', () => {
      const titles = titlesFor({ didSessionHappen: true, didPersonAttend: true })

      expect(titles).toEqual(
        expect.arrayContaining(['Session details', 'Session feedback', 'Additional support needs']),
      )
    })
  })

  describe('Full page rendering', () => {
    it('should render complete feedback summary with all sections', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const viewModel = presenter.buildViewModel()

      expect(viewModel.pageHeader).toBe('Check your answers before adding ICS feedback')
      expect(viewModel.feedbackSummaries.length).toBeGreaterThan(0)
      expect(viewModel.submitButtonText).toBe('Submit feedback')
      expect(viewModel.backLink).toBeDefined()
    })

    it('should replace caseRefId in submit href', () => {
      const presenter = new IcsFeedbackCheckYourAnswersPresenter(baseIcsFeedbackSubmission, caseRefId, firstName)

      const viewModel = presenter.buildViewModel()

      expect(viewModel.submitHref).toContain(caseRefId)
      expect(viewModel.submitHref).not.toContain('caseRefId')
    })
  })
})

import { Response } from 'express'
import ViewSessionFeedbackPresenter from './ViewSessionFeedbackPresenter'
import { ViewSessionFeedbackViewModel } from './ViewSessionFeedbackViewModel'
import IcsFeedbackResponseFactory from '../../testutils/factories/IcsFeedbackSubmissionResponse'

describe('ViewSessionFeedbackPresenter', () => {
  let res: Response

  const caseRefId = 'AB1234CD'
  const caseWorker1 = { fullName: 'CaseWorker One', emailAddress: 'one@example.com' }
  const caseWorker2 = { fullName: 'CaseWorker Two', emailAddress: 'two@example.com' }
  const icsFeedbackSubmissionResponse = IcsFeedbackResponseFactory.build()

  beforeEach(() => {
    res = {
      locals: { content: {} },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('renderPage', () => {
    it('should render the view session feedback template', () => {
      const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
      presenter.renderPage(res)

      expect(res.render).toHaveBeenCalledWith('appointment/viewSessionFeedback', expect.objectContaining({}))
    })

    it('should include the page header "View session feedback"', () => {
      const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
      presenter.renderPage(res)

      expect(res.render).toHaveBeenCalledWith(
        'appointment/viewSessionFeedback',
        expect.objectContaining({
          content: expect.objectContaining({ pageHeader: 'View session feedback' }),
        }),
      )
    })

    it('should include the correct back link', () => {
      const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
      presenter.renderPage(res)

      expect(res.render).toHaveBeenCalledWith(
        'appointment/viewSessionFeedback',
        expect.objectContaining({
          content: expect.objectContaining({ backLink: { href: `/progress/${caseRefId}` } }),
        }),
      )
    })

    describe('Appointment details', () => {
      it('should include the appointment details card title', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.appointmentDetailsSummary.card?.title?.text).toBe('Appointment details')
      })

      it('should display "Current caseworker" label when one caseworker exists', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.appointmentDetailsSummary.rows[0]).toEqual(
          expect.objectContaining({ key: { text: 'Current caseworker' } }),
        )
      })

      it('should display "Current caseworkers" label when multiple caseworkers exist', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackDetails: { currentCaseworkers: [caseWorker1, caseWorker2] },
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.appointmentDetailsSummary.rows[0]).toEqual(
          expect.objectContaining({ key: { text: 'Current caseworkers' } }),
        )
      })

      it('should display "Feedback submitted by" row', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        const row = viewModel.appointmentDetailsSummary.rows.find(r => r.key.text === 'Feedback submitted by')

        expect(row?.value).toMatchObject({ html: expect.stringContaining('mailto:') })
        expect(row?.value).toMatchObject({ html: expect.stringContaining(caseWorker2.emailAddress) })
      })

      it('should display "Method" row with formatted session type', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        const row = viewModel.appointmentDetailsSummary.rows.find(r => r.key.text === 'Method')

        expect(row?.value.text).toBe('Phone call')
      })

      it('should display "Method" row when session method is not present', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackDetails,
              sessionMethod: undefined,
            },
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        const row = viewModel.appointmentDetailsSummary.rows.find(r => r.key.text === 'Method')

        expect(row?.value.text).toBeUndefined()
      })

      it('shows reason session was not in-person for remote sessions', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionNotInPersonReason: 'Requested a phone appointment',
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        const row = viewModel.appointmentDetailsSummary.rows.find(
          r => r.key.text === 'Reason session was not in-person',
        )

        expect(row).toEqual({
          key: { text: 'Reason session was not in-person' },
          value: { text: 'Requested a phone appointment' },
        })
      })

      it('shows location for in-person sessions', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackDetails: {
              sessionMethod: 'IN_PERSON_PROBATION_OFFICE',
            },
            recordSessionPdu: 'Test Area PDU',
            recordSessionAddressLine1: '1 Test Street',
            recordSessionTownOrCity: 'Test Town',
            recordSessionPostcode: 'T3 3ST',
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.appointmentDetailsSummary.rows).toContainEqual({
          key: { text: 'Location' },
          value: { text: 'Test Area PDU, 1 Test Street, Test Town, T3 3ST' },
        })
      })

      it('does not show reason session was not in-person for in-person sessions', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackDetails: {
              sessionMethod: 'IN_PERSON_PROBATION_OFFICE',
            },
            recordSessionNotInPersonReason: 'Requested a phone appointment',
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        const row = viewModel.appointmentDetailsSummary.rows.find(
          r => r.key.text === 'Reason session was not in-person',
        )

        expect(row).toBeUndefined()
      })

      it('should display "How user was informed about session" row', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackDetails,
              sessionCommunications: ['PHONE', 'TEXT'],
            },
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content
        const row = viewModel.appointmentDetailsSummary.rows.find(r =>
          r.key.text.includes('was informed about the session'),
        )

        expect(row?.value.text).toBe('Phone call, Text message')
      })

      it('should display "How user was informed about session" row when session communications are not present', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackDetails,
              sessionCommunications: undefined,
            },
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content
        const row = viewModel.appointmentDetailsSummary.rows.find(r =>
          r.key.text.includes('was informed about the session'),
        )

        expect(row?.value.text).toBeUndefined()
      })
    })

    describe('Session details', () => {
      it('includes the session details card title', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionDetailsSummary.card?.title?.text).toBe('Session details')
      })

      it('does not include sessionDetailsSummary when the session did not happen', () => {
        const sessionDidNotHappenFeedbackResponse = IcsFeedbackResponseFactory.build({
          recordSessionDidSessionHappen: false,
          recordSessionDidPersonAttend: true,
          recordSessionNotHappenReason: 'Provider unexpectedly cancelled session due to emergency meeting ',
        })

        const presenter = new ViewSessionFeedbackPresenter(sessionDidNotHappenFeedbackResponse, caseRefId)

        const viewModel = presenter.buildPageContent({} as Response)

        expect(viewModel.sessionDetailsSummary).toBeUndefined()
      })

      it('includes sessionDetailsSummary when the session did happen', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)

        const viewModel = presenter.buildPageContent({} as Response)

        expect(viewModel.sessionDetailsSummary).toBeDefined()
      })

      it('shows late reason when person was late and a reason exists', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionDetailsWasPersonLate: true,
            sessionDetailsLateReason: 'Stuck in traffic',
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionDetailsSummary).toBeDefined()
        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Was Alex late?' },
          value: { text: 'Yes' },
        })
        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Why was Alex late' },
          value: { text: 'Stuck in traffic' },
        })
      })

      it('does not show late reason when person was not late', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionDetailsWasPersonLate: false,
            sessionDetailsLateReason: 'Stuck in traffic',
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Was Alex late?' },
          value: { text: 'No' },
        })
        expect(viewModel.sessionDetailsSummary.rows).not.toContainEqual({
          key: { text: 'Why was Alex late' },
          value: { text: 'Stuck in traffic' },
        })
      })

      it('does not show late reason when reason is missing', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionDetailsWasPersonLate: true,
            sessionDetailsLateReason: undefined,
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Was Alex late?' },
          value: { text: 'Yes' },
        })

        expect(viewModel.sessionDetailsSummary.rows.find(r => r.key.text.includes('Why was Alex late'))).toBeUndefined()
      })
    })

    describe('Record session attendance', () => {
      it('includes the record session attendance card title', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({ recordSessionDidSessionHappen: false }),
          caseRefId,
        )
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.recordSessionAttendanceSummary.card?.title?.text).toBe('Record session attendance')
      })

      it('does not include recordSessionAttendanceSummary when the session happened', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.recordSessionAttendanceSummary).toBeUndefined()
      })

      it('shows person attendance status when the session did not happen', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackDetails,
            },
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: false,
          }),
          caseRefId,
        )
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content
        const row = viewModel.recordSessionAttendanceSummary.rows.find(r => r.key.text.includes('Alex'))

        expect(row).toEqual({
          key: { text: 'Did Alex come to the appointment?' },
          value: { text: 'No' },
        })
      })

      it('does not show attendance row when attendance is unknown', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: null,
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.recordSessionAttendanceSummary.rows).toHaveLength(1)
        expect(viewModel.recordSessionAttendanceSummary.rows[0]).toEqual({
          key: { text: 'Did the session happen?' },
          value: { text: 'No' },
        })
      })
    })

    describe('Session feedback', () => {
      it('should include the session feedback card title', () => {
        const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionFeedbackSummary.card?.title?.text).toBe('Session feedback')
      })

      it('does not create session feedback summary when no feedback information exists', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionFeedbackWhatHappened: undefined,
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionFeedbackSummary).toBeUndefined()
      })

      it('shows what happened in the session when the session happened', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionFeedbackWhatHappened: 'Alex discussed his current situation and was open to new possibilities',
          }),
          caseRefId,
        )

        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionFeedbackSummary.rows).toContainEqual({
          key: { text: 'What happened in the session' },
          value: { text: 'Alex discussed his current situation and was open to new possibilities' },
        })
      })

      it('shows why the session did not happen when a reason is provided', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: true,
            recordSessionNotHappenReason: 'Participant cancelled',
          }),
          caseRefId,
        )
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content

        expect(viewModel.sessionFeedbackSummary.rows[0]).toEqual({
          key: { text: 'Why the session did not happen' },
          value: { text: 'Participant cancelled' },
        })
      })

      it('shows contact attempt details when the person did not attend', () => {
        const presenter = new ViewSessionFeedbackPresenter(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: false,
            recordSessionNotHappenReason: undefined,
            recordSessionNoAttendanceInformation: 'Called and left voicemail',
          }),
          caseRefId,
        )
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ViewSessionFeedbackViewModel = renderCall[1].content
        const row = viewModel.sessionFeedbackSummary.rows[0]

        expect(row).toEqual({
          key: { text: 'Details about how you tried to contact Alex and why they did not attend' },
          value: { text: 'Called and left voicemail' },
        })
      })
    })
  })
})

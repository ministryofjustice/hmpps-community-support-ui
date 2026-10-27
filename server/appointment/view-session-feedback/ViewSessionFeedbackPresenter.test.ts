import { Response } from 'express'
import ViewSessionFeedbackPresenter from './ViewSessionFeedbackPresenter'
import { ViewSessionFeedbackViewModel } from './ViewSessionFeedbackViewModel'
import IcsFeedbackResponseFactory from '../../testutils/factories/IcsFeedbackSubmissionResponse'
import { globalContent } from '../../../assets/content/GlobalContent'

describe('ViewSessionFeedbackPresenter', () => {
  let res: Response

  const caseRefId = 'AB1234CD'
  const caseWorker1 = { fullName: 'CaseWorker One', emailAddress: 'one@example.com' }
  const caseWorker2 = { fullName: 'CaseWorker Two', emailAddress: 'two@example.com' }
  const icsFeedbackSubmissionResponse = IcsFeedbackResponseFactory.build()

  const renderViewModel = (
    response = icsFeedbackSubmissionResponse,
    refId = caseRefId,
  ): ViewSessionFeedbackViewModel => {
    new ViewSessionFeedbackPresenter(response, refId).renderPage(res)

    return (res.render as jest.Mock).mock.calls[0][1].content
  }

  beforeEach(() => {
    res = {
      locals: { content: globalContent['/ics-feedback/:id/session/:id'] },
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
      it('includes the appointment details card title', () => {
        const viewModel = renderViewModel()

        expect(viewModel.appointmentDetailsSummary.card?.title?.text).toBe('Appointment details')
      })

      it('shows the singular caseworker label when one caseworker exists', () => {
        const viewModel = renderViewModel()

        expect(viewModel.appointmentDetailsSummary.rows[0]).toEqual(
          expect.objectContaining({ key: { text: 'Current caseworker' } }),
        )
      })

      it('shows the plural caseworker label when multiple caseworkers exist', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackAppointmentDetails: { currentCaseworkers: [caseWorker1, caseWorker2] },
          }),
        )

        expect(viewModel.appointmentDetailsSummary.rows[0]).toEqual(
          expect.objectContaining({ key: { text: 'Current caseworkers' } }),
        )
      })

      it('shows the feedback submitted by row', () => {
        const viewModel = renderViewModel()
        const row = viewModel.appointmentDetailsSummary.rows.find(r => r.key.text === 'Feedback submitted by')

        expect(row?.value).toMatchObject({ html: expect.stringContaining('mailto:') })
        expect(row?.value).toMatchObject({ html: expect.stringContaining(caseWorker2.emailAddress) })
      })

      it('shows the recorded session method', () => {
        const viewModel = renderViewModel()
        const row = viewModel.appointmentDetailsSummary.rows.find(r => r.key.text === 'Method')

        expect(row?.value.text).toBe('Phone call')
      })

      it('shows None when no recorded session method exists', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: undefined,
          }),
        )
        const row = viewModel.appointmentDetailsSummary.rows.find(r => r.key.text === 'Method')

        expect(row?.value.text).toBe('None')
      })

      it('shows the recorded reason why the session was not in-person', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionNotInPersonReason: 'Requested a phone appointment',
          }),
        )

        const row = viewModel.appointmentDetailsSummary.rows.find(
          r => r.key.text === 'Reason session was not in-person',
        )

        expect(row).toEqual({
          key: { text: 'Reason session was not in-person' },
          value: { text: 'Requested a phone appointment' },
        })
      })

      it('shows None when no recorded reason exists', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: 'Phone call',
            recordSessionNotInPersonReason: undefined,
            sessionFeedbackAppointmentDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails,
              appointmentDeliveryDetails: {
                method: 'PHONE_CALL',
                methodDetails: 'Client requested phone appointment',
              },
            },
          }),
        )

        const row = viewModel.appointmentDetailsSummary.rows.find(
          r => r.key.text === 'Reason session was not in-person',
        )

        expect(row?.value.text).toBe('None')
      })

      it.each([
        ['Phone call', 'Reason session was not in-person', 'Location'],
        ['Video call', 'Reason session was not in-person', 'Location'],
        ['In person (probation office)', 'Location', 'Reason session was not in-person'],
        ['In person (other location)', 'Location', 'Reason session was not in-person'],
      ])('shows only the applicable location or reason for %s', (method, visibleLabel, hiddenLabel) => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: method,
            recordSessionNotInPersonReason: 'Requested a remote session',
            recordSessionPdu: 'Test Area PDU',
            recordSessionAddressLine1: '1 Test Street',
            recordSessionTownOrCity: 'Test Town',
            recordSessionPostcode: 'T3 3ST',
          }),
        )

        const labels = viewModel.appointmentDetailsSummary.rows.map(row => row.key.text)
        expect(labels.filter(label => label === visibleLabel)).toHaveLength(1)
        expect(labels).not.toContain(hiddenLabel)
      })

      it('hides the non-in-person reason for in-person sessions', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: 'In person (probation office)',
            sessionFeedbackAppointmentDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails,
              appointmentDeliveryDetails: {
                method: 'IN_PERSON_PROBATION_OFFICE',
              },
            },
            recordSessionNotInPersonReason: 'Requested a phone appointment',
          }),
        )

        const row = viewModel.appointmentDetailsSummary.rows.find(
          r => r.key.text === 'Reason session was not in-person',
        )

        expect(row).toBeUndefined()
      })

      it('shows the recorded probation office when present', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: 'In person (probation office)',
            recordSessionPdu: 'Test Area PDU',
          }),
        )

        expect(viewModel.appointmentDetailsSummary.rows).toContainEqual({
          key: { text: 'Location' },
          value: { text: 'Test Area PDU' },
        })
      })

      it('shows the recorded address when present', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: 'In person (other location)',
            recordSessionAddressLine1: '1 Test Street',
            recordSessionTownOrCity: 'Test Town',
            recordSessionPostcode: 'T3 3ST',
          }),
        )

        expect(viewModel.appointmentDetailsSummary.rows).toContainEqual({
          key: { text: 'Location' },
          value: { text: '1 Test Street, Test Town, T3 3ST' },
        })
      })

      it('falls back to the appointment address when no recorded location exists', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: undefined,
            recordSessionAddressLine1: undefined,
            recordSessionTownOrCity: undefined,
            recordSessionPostcode: undefined,
            sessionFeedbackAppointmentDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails,
              appointmentDeliveryDetails: {
                method: 'IN_PERSON_OTHER_LOCATION',
                addressLine1: '2 High Street',
                townOrCity: 'York',
                postcode: 'YO1 1AA',
              },
            },
          }),
        )

        expect(viewModel.appointmentDetailsSummary.rows).toContainEqual({
          key: { text: 'Location' },
          value: { text: '2 High Street, York, YO1 1AA' },
        })
      })

      it('falls back to the appointment probation office when no recorded location exists', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionHowSessionTookPlace: undefined,
            recordSessionPdu: undefined,
            sessionFeedbackAppointmentDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails,
              appointmentDeliveryDetails: {
                method: 'IN_PERSON_PROBATION_OFFICE',
                methodDetails: 'North Leeds PDU',
              },
            },
          }),
        )

        expect(viewModel.appointmentDetailsSummary.rows).toContainEqual({
          key: { text: 'Location' },
          value: { text: 'North Leeds PDU' },
        })
      })

      it('shows how the user was informed about the session', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackAppointmentDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails,
              sessionCommunications: ['informedByPhone', 'informedByTextMessage'],
            },
          }),
        )

        const row = viewModel.appointmentDetailsSummary.rows.find(r =>
          r.key.text.includes('was informed about the session'),
        )

        expect(row?.value.text).toBe('Phone call, Text message')
      })

      it('handles missing session communications', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            sessionFeedbackAppointmentDetails: {
              ...icsFeedbackSubmissionResponse.sessionFeedbackAppointmentDetails,
              sessionCommunications: undefined,
            },
          }),
        )

        const row = viewModel.appointmentDetailsSummary.rows.find(r =>
          r.key.text.includes('was informed about the session'),
        )

        expect(row?.value.text).toBe('None')
      })
    })

    describe('Session details', () => {
      it('includes the session details card title', () => {
        const viewModel = renderViewModel()

        expect(viewModel.sessionDetailsSummary.card?.title?.text).toBe('Session details')
      })

      it('includes the session details summary when the session happened', () => {
        const viewModel = renderViewModel()

        expect(viewModel.sessionDetailsSummary).toBeDefined()
      })

      it.each([true, false, null])(
        'hides delivery-only cards when the session did not happen and attendance is %s',
        attended => {
          const viewModel = renderViewModel(
            IcsFeedbackResponseFactory.build({
              recordSessionDidSessionHappen: false,
              recordSessionDidPersonAttend: attended,
              recordSessionNotHappenReason: 'Provider unexpectedly cancelled session due to emergency meeting',
              issuesOrConcernsIdentified: 'Recorded concern',
              additionalSupportNeeds: 'Recorded support need',
            }),
          )

          expect(viewModel.sessionDetailsSummary).toBeUndefined()
          expect(viewModel.issuesAndConcernsSummary).toBeUndefined()
          expect(viewModel.additionalSupportNeedsSummary).toBeUndefined()
          expect(viewModel.nextStepsSummary).toBeUndefined()
        },
      )

      it('shows the late reason when the person was late', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionDetailsWasPersonLate: true,
            sessionDetailsLateReason: 'Stuck in traffic',
          }),
        )

        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Was Alex late?' },
          value: { text: 'Yes' },
        })

        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Why Alex was late' },
          value: { text: 'Stuck in traffic' },
        })
      })

      it('does not show the late reason when the person was not late', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionDetailsWasPersonLate: false,
            sessionDetailsLateReason: 'Stuck in traffic',
          }),
        )

        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Was Alex late?' },
          value: { text: 'No' },
        })

        expect(viewModel.sessionDetailsSummary.rows).not.toContainEqual({
          key: { text: 'Why Alex was late' },
          value: { text: 'Stuck in traffic' },
        })
      })

      it('shows None for the late reason when no reason is provided', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionDetailsWasPersonLate: true,
            sessionDetailsLateReason: undefined,
          }),
        )

        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Was Alex late?' },
          value: { text: 'Yes' },
        })

        expect(viewModel.sessionDetailsSummary.rows).toContainEqual({
          key: { text: 'Why Alex was late' },
          value: { text: 'None' },
        })
      })
    })

    describe('Record session attendance', () => {
      it('includes the record session attendance card title', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
          }),
        )

        expect(viewModel.recordSessionAttendanceSummary.card?.title?.text).toBe('Record session attendance')
      })

      it('hides the record session attendance summary when the session happened', () => {
        const viewModel = renderViewModel()

        expect(viewModel.recordSessionAttendanceSummary).toBeUndefined()
      })

      it('shows the attendance summary when the person attended but the session did not happen', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: true,
          }),
        )

        expect(viewModel.recordSessionAttendanceSummary.rows).toEqual([
          { key: { text: 'Did the session happen?' }, value: { text: 'No' } },
          { key: { text: 'Did Alex come to the appointment?' }, value: { text: 'Yes' } },
        ])
      })

      it('shows the attendance status when the person did not attend', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: false,
          }),
        )

        const row = viewModel.recordSessionAttendanceSummary.rows.find(r => r.key.text.includes('Alex'))

        expect(row).toEqual({ key: { text: 'Did Alex come to the appointment?' }, value: { text: 'No' } })
      })

      it('treats unknown attendance as No', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: null,
          }),
        )

        expect(viewModel.recordSessionAttendanceSummary.rows).toHaveLength(2)
        expect(viewModel.recordSessionAttendanceSummary.rows[0]).toEqual({
          key: { text: 'Did the session happen?' },
          value: { text: 'No' },
        })
        expect(viewModel.recordSessionAttendanceSummary.rows[1]).toEqual({
          key: { text: 'Did Alex come to the appointment?' },
          value: { text: 'No' },
        })
      })
    })

    describe('Session feedback', () => {
      it('includes the session feedback card title', () => {
        const viewModel = renderViewModel()

        expect(viewModel.sessionFeedbackSummary.card?.title?.text).toBe('Session feedback')
      })

      it('shows a fallback when no session feedback information exists', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionFeedbackWhatHappened: undefined,
            sessionFeedbackBehaviour: undefined,
            sessionFeedbackStrengthsIdentified: undefined,
          }),
        )

        expect(viewModel.sessionFeedbackSummary.rows).toEqual([
          { key: { text: 'What happened in the session' }, value: { text: 'None' } },
          { key: { text: 'How Alex behaved' }, value: { text: 'None' } },
          { key: { text: 'Strengths identified' }, value: { text: 'None' } },
        ])
      })

      it('shows what happened in the session when the session happened', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: true,
            sessionFeedbackWhatHappened: 'Alex discussed his current situation and was open to new possibilities',
          }),
        )

        expect(viewModel.sessionFeedbackSummary.rows).toContainEqual({
          key: { text: 'What happened in the session' },
          value: { text: 'Alex discussed his current situation and was open to new possibilities' },
        })
      })

      it('shows behaviour and strengths when the session happened', () => {
        const viewModel = renderViewModel()

        expect(viewModel.sessionFeedbackSummary.rows).toContainEqual({
          key: { text: 'How Alex behaved' },
          value: { text: 'Engaged and positive' },
        })
        expect(viewModel.sessionFeedbackSummary.rows).toContainEqual({
          key: { text: 'Strengths identified' },
          value: { text: 'Strong family support' },
        })
        expect(viewModel.sessionFeedbackSummary.rows).toHaveLength(3)
      })

      it('shows why the session did not happen when a reason is provided', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: true,
            recordSessionNotHappenReason: 'SERVICE_PROVIDER_ISSUE',
            recordSessionNotHappenReasonDetails: 'Room booking was cancelled due to a fire alarm.',
          }),
        )

        expect(viewModel.sessionFeedbackSummary.rows[0]).toEqual({
          key: { text: 'Why the session did not happen' },
          value: { text: 'Service provider issue: Room booking was cancelled due to a fire alarm.' },
        })
        expect(viewModel.sessionFeedbackSummary.rows).toHaveLength(1)
      })

      it('shows contact attempt details when the person did not attend', () => {
        const viewModel = renderViewModel(
          IcsFeedbackResponseFactory.build({
            recordSessionDidSessionHappen: false,
            recordSessionDidPersonAttend: false,
            recordSessionNotHappenReason: 'REFERRAL_DID_NOT_COMPLY',
            recordSessionNoAttendanceInformation: 'Called and left voicemail',
          }),
        )

        expect(viewModel.sessionFeedbackSummary.rows[0]).toEqual({
          key: { text: 'Details about how you tried to contact Alex and why they did not attend' },
          value: { text: 'Called and left voicemail' },
        })
        expect(viewModel.sessionFeedbackSummary.rows).toHaveLength(1)
      })
    })
  })
})

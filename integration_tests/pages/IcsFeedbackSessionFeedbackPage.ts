import AbstractPage from './abstractPage'

export default class IcsFeedbackSessionFeedbackPage extends AbstractPage {
  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/session-feedback`
  }
}

import AbstractPage from './abstractPage'

export default class IcsFeedbackSessionDetailsPage extends AbstractPage {
  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/session-details`
  }
}

import AbstractPage from './abstractPage'

export default class IcsFeedbackHowSessionTookPlacePage extends AbstractPage {
  static url(caseRefId: string): string {
    return `ics-feedback/${caseRefId}/did-session-take-place`
  }
}

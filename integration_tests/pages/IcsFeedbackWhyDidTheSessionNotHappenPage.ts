import AbstractPage from './abstractPage'

export default class IcsFeedbackWhyDidTheSessionNotHappenPage extends AbstractPage {
  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/why-did-the-session-not-happen`
  }
}

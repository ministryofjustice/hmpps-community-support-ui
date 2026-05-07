import AbstractPage from './abstractPage'

export default class IcsFeedbackDidTheSessionTakePlaceByPage extends AbstractPage {
  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/did-the-session-take-place-by`
  }
}

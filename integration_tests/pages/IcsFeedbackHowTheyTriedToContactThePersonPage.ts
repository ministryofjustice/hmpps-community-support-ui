import AbstractPage from './abstractPage'

export default class IcsFeedbackHowTheyTriedToContactThePersonPage extends AbstractPage {
  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/how-they-tried-to-contact-the-person`
  }
}

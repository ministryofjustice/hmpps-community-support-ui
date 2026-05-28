import { Page } from '@playwright/test'
import AbstractPage from './abstractPage'

// stub
export default class ChangeIcsDetailsPage extends AbstractPage {
  constructor(page: Page) {
    super(page)
  }

  static url(caseRefId: string): string {
    return `/referral/${caseRefId}/ics-change-details`
  }
}
